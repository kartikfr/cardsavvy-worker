const TOP_50_INDIAN_CARDS = [
    "HDFC Infinia Metal Edition",
    "HDFC Diners Club Black",
    "HDFC Regalia Gold",
    "HDFC Millennia",
    "Swiggy HDFC Bank",
    "Tata Neu Infinity HDFC",

    "SBI Cashback Card",
    "SBI Card PRIME",
    "SBI Card ELITE",
    "SimplyCLICK SBI Card",
    "BPCL SBI Card OCTANE",

    "Axis Bank Magnus",
    "Axis Bank Atlas",
    "Axis Bank Reserve",
    "Flipkart Axis Bank",
    "Axis Bank Ace",
    "Axis Bank Vistara Infinite",

    "Amazon Pay ICICI Bank",
    "ICICI Emeralde",
    "ICICI Sapphiro",
    "ICICI Rubyx",
    "MakeMyTrip ICICI Bank Signature",

    "American Express Platinum Travel",
    "American Express Platinum Charge",
    "American Express Gold",
    "American Express SmartEarn",
    "American Express MRCC",

    "IndusInd Bank Pinnacle",
    "IndusInd Bank Legend",
    "IndusInd Bank Tiger",
    "EazyDiner IndusInd Bank",

    "Standard Chartered Ultimate",
    "Standard Chartered Smart",
    "IDFC FIRST Wealth",
    "IDFC FIRST Select",
    "IDFC FIRST Classic",

    "AU Small Finance Bank Zenith",
    "AU Small Finance Bank Vetta",
    "AU Small Finance Bank LIT",

    "Yes Private Prime",
    "Yes First Preferred",

    "RBL Bank World Safari",
    "RBL Bank Icon",
    "OneCard",
    "Kotak White Card",
    "Kotak Zen",
    "Kotak League",

    "HSBC Cashback",
    "Citi PremierMiles",
    "Tata Neu Plus HDFC"
];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

async function scrapeWithGemini(cardName) {
    const prompt = `You are a BFSI data extraction expert. Extract comprehensive credit card data for the Indian credit card: "${cardName}".

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
    }`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    let attempts = 0;
    while (attempts < 15) {
        attempts++;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (res.status === 429) {
            console.log(`    [!] Rate limited by Gemini API. Waiting 65s... (Attempt ${attempts}/15)`);
            await sleep(65000);
            continue;
        }

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Gemini API error: ${res.status} - ${errText}`);
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("No text returned by Gemini");

        const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleanText);
    }
    throw new Error("Max retries exceeded for Gemini API");
}

async function saveToSupabase(cardToSave) {
    const slug = slugify(cardToSave.name);

    const cardPayload = {
        slug,
        name: cardToSave.name,
        bank_name: cardToSave.bank_name,
        network: cardToSave.network || "VISA",
        card_tier: cardToSave.card_tier || "STANDARD",
        joining_fee: cardToSave.joining_fee || 0,
        annual_fee: cardToSave.annual_fee || 0,
        fee_waiver_spend: cardToSave.fee_waiver_spend || null,
        fee_waiver_type: cardToSave.fee_waiver_type || null,
        reward_type: cardToSave.reward_type || "POINTS",
        reward_currency_name: cardToSave.reward_currency_name || null,
        base_reward_rate: cardToSave.base_reward_rate || 0.01,
        point_value_inr: cardToSave.point_value_inr || 0.5,
        earnkaro_id: cardToSave.earnkaro_id || null,
        card_page_url: cardToSave.card_page_url || null,
        affiliate_url: cardToSave.earnkaro_id ? `https://www.earnkaro.com/clickthrough/${cardToSave.earnkaro_id}` : null,
        is_active: true,
        is_featured: false,
    };

    const cardRes = await fetch(`${SUPABASE_URL}/rest/v1/cards?select=id`, {
        method: "POST",
        headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        },
        body: JSON.stringify(cardPayload)
    });

    if (!cardRes.ok) {
        const err = await cardRes.text();
        throw new Error(`Failed to insert card record: ${cardRes.status} ${err}`);
    }

    const cardData = await cardRes.json();
    const cardId = cardData[0]?.id;
    if (!cardId) throw new Error("Card inserted but id not returned");

    const rules = cardToSave.category_rules || [];
    if (rules.length > 0) {
        const rulesPayload = rules.map(r => ({
            card_id: cardId,
            category: r.category,
            effective_rate: r.multiplier * cardPayload.base_reward_rate * cardPayload.point_value_inr,
            multiplier: r.multiplier,
            max_monthly_spend: r.max_monthly_spend || null
        }));

        const rulesRes = await fetch(`${SUPABASE_URL}/rest/v1/card_category_rules`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(rulesPayload)
        });

        if (!rulesRes.ok) console.error("    [!] Failed to insert category rules:", await rulesRes.text());
    }

    const milestones = cardToSave.milestones || [];
    if (milestones.length > 0) {
        const msPayload = milestones.map(m => ({
            card_id: cardId,
            spend_threshold: m.spend_threshold,
            bonus_points: m.bonus_points || 0,
            bonus_cash_inr: m.bonus_cash_inr || null,
            bonus_description: m.bonus_description || ""
        }));

        const msRes = await fetch(`${SUPABASE_URL}/rest/v1/card_milestones`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(msPayload)
        });

        if (!msRes.ok) console.error("    [!] Failed to insert milestones:", await msRes.text());
    }
}

async function runBatch() {
    if (!SUPABASE_URL || !GEMINI_API_KEY || !SUPABASE_ANON_KEY) {
        throw new Error("Missing required env vars. Set GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL), and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).");
    }

    console.log(`Starting standalone bulk seed of ${TOP_50_INDIAN_CARDS.length} cards...`);
    console.log(`Target Supabase: ${SUPABASE_URL}`);

    let successCount = 0;

    for (let i = 0; i < TOP_50_INDIAN_CARDS.length; i++) {
        const cardName = TOP_50_INDIAN_CARDS[i];
        console.log(`\n======================================================`);
        console.log(`[${i + 1}/${TOP_50_INDIAN_CARDS.length}] Processing: ${cardName}`);

        try {
            const cardData = await scrapeWithGemini(cardName);
            console.log(`  -> Scraped metadata for "${cardData.name}" (${cardData.bank_name})`);

            await saveToSupabase(cardData);
            console.log(`  ✅ Successfully inserted into Supabase DB`);
            successCount++;
        } catch (error) {
            console.error(`  ❌ Failed: ${error.message}`);
        }

        if (i < TOP_50_INDIAN_CARDS.length - 1) {
            console.log("  zZz Sleeping for 5s to avoid rate limits...");
            await sleep(5000);
        }
    }

    console.log(`\n🎉 Bulk Seed Complete. Processed: ${successCount}/${TOP_50_INDIAN_CARDS.length}`);
}

runBatch().catch(console.error);
