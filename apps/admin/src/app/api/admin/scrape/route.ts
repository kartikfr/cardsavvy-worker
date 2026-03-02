import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import slugify from "slugify";
import { resolveGeminiApiKey } from "@/lib/ai/gemini";

const CARD_EXTRACTION_PROMPT = (cardName: string) => `
You are a BFSI data extraction expert. Extract comprehensive credit card data for the Indian credit card: "${cardName}".

Return a JSON object with EXACTLY this structure (no markdown, no explanation, just JSON):
{
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
    {
      "category": "GROCERIES or DINING or ONLINE_SHOPPING or TRAVEL_FLIGHTS or TRAVEL_HOTELS or FUEL or UTILITIES or OTT or OTHER",
      "multiplier": 3.0,
      "max_monthly_spend": null or number
    }
  ],
  "milestones": [
    {
      "spend_threshold": 300000,
      "bonus_points": 10000,
      "bonus_description": "10,000 bonus reward points"
    }
  ]
}

Guidelines:
- base_reward_rate = base points earned per rupee spent
- point_value_inr = how much 1 reward point is worth in INR
- Only include categories where multiplier > 1
- Be accurate based on publicly available card documentation

Extract for: ${cardName}
`;

export async function POST(req: Request) {
  try {
    const { card_name } = await req.json();
    if (!card_name?.trim()) {
      return NextResponse.json({ error: "card_name is required" }, { status: 400 });
    }

    const geminiKey = await resolveGeminiApiKey();
    if (!geminiKey) {
      return NextResponse.json({ error: "No Gemini API key configured. Add it in Settings." }, { status: 503 });
    }

    // 1. Try Python Playwright scraper if configured
    const pythonScraperUrl = process.env.PYTHON_SCRAPER_URL || process.env.PYTHON_WORKER_URL;
    if (pythonScraperUrl) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        const cronSecret = process.env.CRON_SECRET?.trim();
        if (cronSecret) {
          headers.Authorization = `Bearer ${cronSecret}`;
        }

        const pyRes = await fetch(`${pythonScraperUrl}/scrape`, {
          method: "POST",
          headers,
          body: JSON.stringify({ card_name, gemini_api_key: geminiKey }),
          signal: AbortSignal.timeout(45000), // 45s timeout
        });
        if (pyRes.ok) {
          const pyData = await pyRes.json();
          const card = pyData.card;
          card.slug = slugify(card.name, { lower: true, strict: true });
          return NextResponse.json({ card, source: "playwright+gemini" });
        }
      } catch (pyErr) {
        console.warn("Python scraper unavailable, falling back to Gemini-only:", pyErr);
      }
    }

    // 2. Fallback: Gemini-only extraction
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(CARD_EXTRACTION_PROMPT(card_name));
    const text = result.response.text();

    let card: any;
    try {
      const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      card = JSON.parse(cleanText);
    } catch {
      return NextResponse.json({ error: "Gemini returned invalid JSON. Please try again." }, { status: 500 });
    }

    card.slug = slugify(card.name, { lower: true, strict: true });
    return NextResponse.json({ card, source: "gemini-2.5-flash" });

  } catch (error: any) {
    console.error("Scrape error:", error);
    return NextResponse.json({ error: error.message ?? "Internal error" }, { status: 500 });
  }
}
