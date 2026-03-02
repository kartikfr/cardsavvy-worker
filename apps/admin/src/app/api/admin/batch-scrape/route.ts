import { NextResponse } from "next/server";
import { TOP_50_INDIAN_CARDS } from "@/lib/constants/cards";
import { resolveGeminiApiKey } from "@/lib/ai/gemini";

export async function POST(_req: Request) {
    try {
        const workerUrl = process.env.PYTHON_WORKER_URL || process.env.PYTHON_SCRAPER_URL;
        if (!workerUrl) {
            return NextResponse.json(
                { error: "Worker URL is not configured. Set PYTHON_WORKER_URL (or PYTHON_SCRAPER_URL)." },
                { status: 500 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        // Inproduction this MUST be the service role key to bypass RLS, or anon if public inserts allowed
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const geminiKey = await resolveGeminiApiKey();

        if (!supabaseUrl || !supabaseKey || !geminiKey) {
            return NextResponse.json(
                { error: "Missing required Supabase or Gemini configuration." },
                { status: 500 }
            );
        }

        const payload = {
            card_names: TOP_50_INDIAN_CARDS,
            gemini_api_key: geminiKey,
            supabase_url: supabaseUrl,
            supabase_service_key: supabaseKey
        };

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        const cronSecret = process.env.CRON_SECRET?.trim();
        if (cronSecret) {
            headers.Authorization = `Bearer ${cronSecret}`;
        }

        const res = await fetch(`${workerUrl}/batch-scrape`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Worker returned ${res.status}: ${err}`);
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Batch trigger failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
