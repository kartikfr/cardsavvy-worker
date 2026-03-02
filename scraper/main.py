import asyncio
import os
import json
import logging
import traceback
from typing import Optional, List
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from playwright.async_api import async_playwright
import google.generativeai as genai
from uvicorn import run
import aiohttp

# Configure basic logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="CardSavvy Playwright Worker")
security = HTTPBearer(auto_error=False)

# --- Security ---
def verify_cron_secret(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    expected_secret = os.environ.get("CRON_SECRET")
    if not expected_secret:
        # If no secret configured in ENV, allow open access (for local dev)
        return True
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing Authorization bearer token")
    if credentials.credentials != expected_secret:
        raise HTTPException(status_code=401, detail="Invalid CRON_SECRET token")
    return True

# --- Models ---
class ScrapeRequest(BaseModel):
    card_name: str
    gemini_api_key: Optional[str] = None

class BatchScrapeRequest(BaseModel):
    card_names: List[str]
    gemini_api_key: str
    supabase_url: str
    supabase_service_key: str

# --- Gemini Prompt ---
EXTRACTION_PROMPT = """
You are a BFSI data extraction expert. Extract comprehensive credit card data for the Indian credit card: "{card_name}".

Return a JSON object with EXACTLY this structure (no markdown, no explanation, just JSON):
{{
  "name": "full official card name",
  "bank_name": "issuing bank name",
  "network": "VISA or MASTERCARD or AMEX or RUPAY",
  "card_tier": "ULTRA_PREMIUM or PREMIUM or STANDARD or ENTRY",
  "joining_fee": 0,
  "annual_fee": 0,
  "fee_waiver_spend": null or number,
  "fee_waiver_type": null or "ANNUAL" or "QUARTERLY",
  "reward_type": "POINTS or CASHBACK or MILES",
  "reward_currency_name": "e.g. HdfcRewardPoints",
  "base_reward_rate": 0.01,
  "point_value_inr": 0.5,
  "earnkaro_id": null,
  "card_page_url": "official bank card page URL",
  "affiliate_url": null,
  "category_rules": [
    {{
      "category": "GROCERIES or DINING or ONLINE_SHOPPING or TRAVEL_FLIGHTS or TRAVEL_HOTELS or FUEL or UTILITIES or OTT or OTHER",
      "multiplier": 3.0,
      "max_monthly_spend": null or number
    }}
  ],
  "milestones": [
    {{
      "spend_threshold": 300000,
      "bonus_points": 10000,
      "bonus_description": "10,000 bonus reward points"
    }}
  ]
}}

Here is the raw scraped content from the bank's official website:
---
{content}
---

If the content above is missing fees or reward rates, use your pre-trained knowledge of this card to fill in the gaps accurately. Provide ONLY the JSON.
"""

def extract_with_gemini(card_name: str, content: str, api_key: str) -> dict:
    """Use Gemini to extract structured card data from scraped content."""
    genai.configure(api_key=api_key)
    # Using gemini-2.5-flash as per user API key permissions
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = EXTRACTION_PROMPT.format(card_name=card_name, content=content or "No content scraped.")
    
    # Retry logic handles 429 inside the batch processor now, but this does the pure extraction
    response = model.generate_content(prompt)
    text = response.text
    
    clean_text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(clean_text)

async def scrape_card_logic(card_name: str, api_key: str) -> dict:
    """Core logic to spin up Playwright, search Google, scrape the bank site, and pass to Gemini"""
    logger.info(f"Starting scrape process for: {card_name}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        scraped_content = ""
        official_url = ""

        try:
            # 1. Google Search to find official URL
            search_query = f"{card_name} credit card official site site:.in"
            await page.goto(f"https://www.google.com/search?q={search_query}")
            await asyncio.sleep(2) # Give search results time to render
            
            # Find the first valid organic search result (avoid ads if possible)
            links = await page.eval_on_selector_all("a", """elements => {
                return elements.map(el => el.href).filter(href => 
                    href.includes('hdfcbank.com') || 
                    href.includes('sbicard.com') || 
                    href.includes('axisbank.com') || 
                    href.includes('icicibank.com') || 
                    href.includes('americanexpress.com') ||
                    href.includes('indusind.com')
                );
            }""")

            if links and len(links) > 0:
                official_url = links[0]
                logger.info(f"Discovered official URL: {official_url}")
                await page.goto(official_url, wait_until="domcontentloaded", timeout=15000)
                
                # Extract text body, removing scripts/styles
                scraped_content = await page.evaluate("""() => {
                    const scripts = document.querySelectorAll('script, style, noscript');
                    scripts.forEach(s => s.remove());
                    return document.body.innerText.replace(/\\n\\s*\\n/g, '\\n');
                }""")
            else:
                logger.warning(f"Could not find an official bank URL via Google for {card_name}")
                scraped_content = "Could not locate official website. Relying exclusively on Gemini knowledge."

        except Exception as e:
            logger.error(f"Playwright navigation failed: {str(e)}")
            scraped_content = "Playwright failure. Relying exclusively on Gemini knowledge."
        finally:
            await browser.close()
            
        # 2. Extract with Gemini
        logger.info(f"Passing {len(scraped_content)} chars of content to Gemini 2.5 Flash")
        parsed_json = extract_with_gemini(card_name, scraped_content[:30000], api_key)
        
        if official_url and not parsed_json.get("card_page_url"):
             parsed_json["card_page_url"] = official_url

        return parsed_json

# --- API Endpoints ---

@app.get("/")
def health_check():
    return {"status": "ok", "service": "cardsavvy-playwright-worker"}

@app.post("/scrape")
async def scrape_single(req: ScrapeRequest, _=Depends(verify_cron_secret)):
    """Single synchronous scrape endpoint (Used by 'Auto-Fill with AI' in admin UI)"""
    try:
        api_key = req.gemini_api_key or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=400, detail="Gemini API Key missing")
            
        card_data = await scrape_card_logic(req.card_name, api_key)
        return {"success": True, "card": card_data}
    except Exception as e:
        logger.error(f"Single scrape error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_batch_job(req: BatchScrapeRequest):
    """Background task to run through the entire list of cards natively in Python"""
    logger.info(f"Started BACKGROUND batch job for {len(req.card_names)} cards")
    
    # Tiny helper to slugify locally
    import re
    def slugify(s):
        s = s.lower().strip()
        s = re.sub(r'[\s]+', '-', s)
        return re.sub(r'[^\w\-]', '', s)

    async with aiohttp.ClientSession() as session:
        for index, card_name in enumerate(req.card_names):
            logger.info(f"[{index+1}/{len(req.card_names)}] Processing: {card_name}")
            
            attempts = 0
            card_data = None
            
            # 1. Scrape with Retry for 429
            while attempts < 15:
                attempts += 1
                try:
                    card_data = await scrape_card_logic(card_name, req.gemini_api_key)
                    break # Success!
                except Exception as e:
                    err_str = str(e)
                    if "429" in err_str or "Too Many Requests" in err_str or "quota" in err_str.lower():
                        logger.warning(f"  [!] Gemini Rate Limit hit 429. Sleeping 65s... (Attempt {attempts}/15)")
                        await asyncio.sleep(65)
                    else:
                        logger.error(f"  [X] Irrecoverable error extracting {card_name}: {err_str}")
                        break
            
            if not card_data:
                continue
                
            # 2. Save directly to Supabase REST API
            logger.info(f"  -> Inserting {card_data.get('name')} into Supabase...")
            slug = slugify(card_data.get("name", card_name))
            base_reward_rate = card_data.get("base_reward_rate") or 0.01
            point_value_inr = card_data.get("point_value_inr") or 0.5
            
            card_payload = {
                "slug": slug,
                "name": card_data.get("name"),
                "bank_name": card_data.get("bank_name"),
                "network": card_data.get("network", "VISA"),
                "card_tier": card_data.get("card_tier", "STANDARD"),
                "joining_fee": card_data.get("joining_fee", 0),
                "annual_fee": card_data.get("annual_fee", 0),
                "fee_waiver_spend": card_data.get("fee_waiver_spend"),
                "fee_waiver_type": card_data.get("fee_waiver_type"),
                "reward_type": card_data.get("reward_type", "POINTS"),
                "reward_currency_name": card_data.get("reward_currency_name"),
                "base_reward_rate": base_reward_rate,
                "point_value_inr": point_value_inr,
                "earnkaro_id": card_data.get("earnkaro_id"),
                "card_page_url": card_data.get("card_page_url"),
                "affiliate_url": f"https://www.earnkaro.com/clickthrough/{card_data.get('earnkaro_id')}" if card_data.get('earnkaro_id') else None,
                "is_active": True,
                "is_featured": False
            }
            
            headers = {
                "apikey": req.supabase_service_key,
                "Authorization": f"Bearer {req.supabase_service_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            # Insert Card
            async with session.post(f"{req.supabase_url}/rest/v1/cards?select=id", json=card_payload, headers=headers) as resp:
                if resp.status not in [200, 201]:
                    logger.error(f"  [X] Supabase Card Insert Failed: {await resp.text()}")
                    continue
                
                resp_data = await resp.json()
                if not resp_data:
                    continue
                    
                card_id = resp_data[0]["id"]
            
            # Insert Categories
            rules = card_data.get("category_rules", [])
            if rules:
                rules_payload = [
                    {
                        "card_id": card_id,
                        "category": r.get("category"),
                        "multiplier": float(r.get("multiplier") or 1),
                        "effective_rate": float(r.get("multiplier") or 1) * base_reward_rate * point_value_inr,
                        "max_monthly_spend": r.get("max_monthly_spend")
                    } for r in rules
                ]
                async with session.post(f"{req.supabase_url}/rest/v1/card_category_rules", json=rules_payload, headers=headers) as resp:
                    if resp.status not in [200, 201]:
                        modern_err = await resp.text()
                        logger.warning(f"  [!] Modern category schema insert failed. Trying legacy fallback: {modern_err}")

                        legacy_rules_payload = [
                            {
                                "card_id": card_id,
                                "category": r.get("category"),
                                "reward_rate": float(r.get("multiplier") or 1) * base_reward_rate * point_value_inr,
                                "is_accelerated": float(r.get("multiplier") or 1) > 1,
                                "notes": f"max_monthly_spend={r.get('max_monthly_spend')}" if r.get("max_monthly_spend") else None,
                            } for r in rules
                        ]
                        async with session.post(f"{req.supabase_url}/rest/v1/card_category_rules", json=legacy_rules_payload, headers=headers) as legacy_resp:
                            if legacy_resp.status not in [200, 201]:
                                logger.error(f"  [X] Legacy category schema insert also failed: {await legacy_resp.text()}")

            # Insert Milestones
            milestones = card_data.get("milestones", [])
            if milestones:
                ms_payload = [
                    {
                        "card_id": card_id,
                        "spend_threshold": m.get("spend_threshold"),
                        "bonus_points": m.get("bonus_points", 0),
                        "bonus_cash_inr": m.get("bonus_cash_inr"),
                        "bonus_description": m.get("bonus_description", "")
                    } for m in milestones
                ]
                async with session.post(f"{req.supabase_url}/rest/v1/card_milestones", json=ms_payload, headers=headers) as resp:
                     if resp.status not in [200, 201]:
                        modern_err = await resp.text()
                        logger.warning(f"  [!] Modern milestone schema insert failed. Trying legacy fallback: {modern_err}")

                        legacy_ms_payload = [
                            {
                                "card_id": card_id,
                                "milestone_type": "SPEND_BONUS",
                                "spend_threshold": m.get("spend_threshold"),
                                "threshold_period": "YEAR",
                                "benefit_points": m.get("bonus_points", 0),
                                "benefit_inr_value": m.get("bonus_cash_inr", 0) or 0,
                                "fee_waived_amount": 0,
                                "description": m.get("bonus_description", ""),
                            } for m in milestones
                        ]
                        async with session.post(f"{req.supabase_url}/rest/v1/card_milestones", json=legacy_ms_payload, headers=headers) as legacy_resp:
                            if legacy_resp.status not in [200, 201]:
                                logger.error(f"  [X] Legacy milestone schema insert also failed: {await legacy_resp.text()}")

            logger.info("  ✅ Inserted successfully into Supabase")
            
            # Add a small buffer between organic requests to emulate human processing
            await asyncio.sleep(5)

    logger.info("🎉 BATCH JOB COMPLETE")

@app.post("/batch-scrape")
async def start_batch_job(req: BatchScrapeRequest, background_tasks: BackgroundTasks, _=Depends(verify_cron_secret)):
    """Trigger an autonomous background batch sync of multiple cards"""
    # Kick off the intensive playwright/gemini pipeline in the background so the HTTP request returns instantly
    background_tasks.add_task(process_batch_job, req)
    return {
        "success": True, 
        "message": f"Background sync job accepted for {len(req.card_names)} cards.",
        "status": "Processing in background"
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run(app, host="0.0.0.0", port=port)
