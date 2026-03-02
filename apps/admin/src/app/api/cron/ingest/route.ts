import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processScrapedDataWithAI } from "@/lib/ai/provider";

export async function POST(req: Request) {
    // 1. Cron Auth
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = await createClient();

        // 2. Fetch up to 5 oldest PENDING jobs from the Queue
        const { data: queueItems, error: fetchErr } = await supabase
            .from("ingestion_queue")
            .select("*")
            .eq("status", "PENDING")
            .order("created_at", { ascending: true })
            .limit(5);

        if (fetchErr || !queueItems || queueItems.length === 0) {
            return NextResponse.json({ message: "Queue is empty." });
        }

        const processedIds = [];

        // 3. Process sequentially (to avoid rate limits from LLMs initially, though Promise.all is faster)
        for (const item of queueItems) {

            // Mark as PROCESSING immediately to prevent duplicate pickup
            await supabase.from("ingestion_queue").update({ status: "PROCESSING" }).eq("id", item.id);

            try {
                // Pass the raw_payload to our dynamic AI provider (OpenAI, Anthropic, or Local)
                const aiResponse = await processScrapedDataWithAI(JSON.stringify(item.raw_payload));

                if (aiResponse.success) {
                    // Update queue item with structured output
                    await supabase.from("ingestion_queue").update({
                        status: "MAPPED_AWAITING_REVIEW",
                        mapped_card_data: aiResponse.mapped_card,
                        processed_at: new Date().toISOString()
                    }).eq("id", item.id);

                    processedIds.push(item.id);
                } else {
                    throw new Error("AI Processing returned failure.");
                }
            } catch (err: any) {
                // Log error on the specific row
                await supabase.from("ingestion_queue").update({
                    status: "ERROR",
                    error_log: err.message,
                    processed_at: new Date().toISOString()
                }).eq("id", item.id);
            }
        }

        return NextResponse.json({
            success: true,
            processed_count: processedIds.length
        });

    } catch (error) {
        console.error("Ingestion Worker Error: ", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
