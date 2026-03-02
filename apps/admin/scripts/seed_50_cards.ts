import fetch from "node-fetch";

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

const ADMIN_API_URL = "http://localhost:3001/api/admin";

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeAndSaveCard(cardName: string): Promise<boolean> {
    console.log(`\n======================================================`);
    console.log(`[1] Scraping: ${cardName}`);
    try {
        const scrapeRes = await fetch(`${ADMIN_API_URL}/scrape`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ card_name: cardName }),
        });

        if (!scrapeRes.ok) {
            const err = await scrapeRes.text();
            throw new Error(`Scrape failed (${scrapeRes.status}): ${err}`);
        }

        const scrapeData: any = await scrapeRes.json();
        const cardToSave = scrapeData.card;

        if (!cardToSave || !cardToSave.name) {
            throw new Error("Invalid output received from scraper");
        }

        console.log(`[2] Successfully scraped: ${cardToSave.name} (${cardToSave.bank_name})`);

        const saveRes = await fetch(`${ADMIN_API_URL}/cards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cardToSave),
        });

        if (!saveRes.ok) {
            const err = await saveRes.text();
            throw new Error(`Save failed (${saveRes.status}): ${err}`);
        }

        console.log("[3] Inserted directly into DB and Redis");
        return true;
    } catch (error: any) {
        console.error(`Error processing \"${cardName}\": ${error.message}`);
        return false;
    }
}

async function runBatch() {
    console.log(`Starting bulk seed of ${TOP_50_INDIAN_CARDS.length} cards...`);

    let successCount = 0;

    for (let i = 0; i < TOP_50_INDIAN_CARDS.length; i++) {
        const cardName = TOP_50_INDIAN_CARDS[i];
        console.log(`\nProgress: ${i + 1}/${TOP_50_INDIAN_CARDS.length}`);

        const success = await scrapeAndSaveCard(cardName);
        if (success) successCount++;

        if (i < TOP_50_INDIAN_CARDS.length - 1) {
            console.log("Sleeping for 3s to respect rate limits...");
            await sleep(3000);
        }
    }

    console.log(`\nBulk Seed Complete. Processed: ${successCount}/${TOP_50_INDIAN_CARDS.length}`);
}

runBatch().catch(console.error);
