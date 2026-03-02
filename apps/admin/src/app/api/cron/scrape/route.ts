import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// In a full implementation, we'd trigger a python script or call a serverless function here
// For MVP, we simulate the 'crawler' fetching data and pushing to the queue

export async function POST(req: Request) {
    // 1. Verify cron secret to ensure only authorized schedulers (like Vercel Cron) can trigger this
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = await createClient();

        // Simulated list of URLs the crawler is supposed to hit today
        const targets = [
            "https://www.hdfcbank.com/personal/pay/cards/credit-cards/infinia",
            "https://www.sbicard.com/en/personal/credit-cards/lifestyle/sbi-card-elite.page"
        ];

        const insertedJobs = [];

        for (const target of targets) {
            // 2. Here we would theoretically HTTP GET the raw HTML using a headless browser
            // We simulate the raw payload being retrieved:
            const rawPayload = {
                html_snippet: "<h1>HDFC Infinia</h1><p>Reward rate: 3.3%</p>",
                crawled_at: new Date().toISOString()
            };

            // 3. Push to `ingestion_queue` (Publisher Pattern)
            const { data, error } = await supabase
                .from("ingestion_queue")
                .insert({
                    source_url: target,
                    raw_payload: rawPayload,
                    status: "PENDING"
                })
                .select()
                .single();

            if (error) throw error;
            insertedJobs.push(data.id);
        }

        // 4. Optionally, trigger the Ingestion Worker immediately (or rely on a separate cron)
        // fetch('https://.../api/worker/ingest', { method: 'POST' })

        return NextResponse.json({
            success: true,
            message: "Scraper cron completed",
            queued_jobs: insertedJobs.length
        });

    } catch (error) {
        console.error("Cron Error: ", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
