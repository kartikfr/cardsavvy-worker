import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import slugify from "slugify";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const supabase = await createAdminClient();

        const {
            name, bank_name, network, card_tier, joining_fee, annual_fee,
            fee_waiver_spend, fee_waiver_type, reward_type, reward_currency_name,
            base_reward_rate, point_value_inr, earnkaro_id, card_page_url,
            category_rules = [], milestones = []
        } = body;
        const normalizedBaseRewardRate = base_reward_rate ?? 0.01;
        const normalizedPointValue = point_value_inr ?? 0.5;

        const slug = slugify(name, { lower: true, strict: true });

        console.log(`[Save API] Attempting to insert card into Supabase: ${slug} at URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

        // Insert main card record
        const { data: card, error: cardError } = await supabase
            .from("cards")
            .insert({
                slug,
                name,
                bank_name,
                network: network ?? "VISA",
                card_tier: card_tier ?? "STANDARD",
                joining_fee: joining_fee ?? 0,
                annual_fee: annual_fee ?? 0,
                fee_waiver_spend,
                fee_waiver_type,
                reward_type: reward_type ?? "POINTS",
                reward_currency_name,
                base_reward_rate: normalizedBaseRewardRate,
                point_value_inr: normalizedPointValue,
                earnkaro_id,
                card_page_url,
                // EarnKaro affiliate link pattern
                affiliate_url: earnkaro_id
                    ? `https://www.earnkaro.com/clickthrough/${earnkaro_id}`
                    : null,
                is_active: true,
                is_featured: false,
            })
            .select("id")
            .single();

        if (cardError) throw new Error(cardError.message);

        const cardId = card.id;

        // Insert category rules
        if (category_rules.length > 0) {
            const rulesPayload = category_rules.map((r: any) => ({
                card_id: cardId,
                category: r.category,
                effective_rate: (r.multiplier * normalizedBaseRewardRate * normalizedPointValue),
                multiplier: r.multiplier,
                max_monthly_spend: r.max_monthly_spend ?? null,
            }));

            const { error: rulesError } = await supabase.from("card_category_rules").insert(rulesPayload);
            if (rulesError) {
                const legacyRulesPayload = category_rules.map((r: any) => ({
                    card_id: cardId,
                    category: r.category,
                    reward_rate: (r.multiplier * normalizedBaseRewardRate * normalizedPointValue),
                    is_accelerated: (r.multiplier ?? 1) > 1,
                    notes: r.max_monthly_spend ? `max_monthly_spend=${r.max_monthly_spend}` : null,
                }));
                const { error: legacyRulesError } = await supabase
                    .from("card_category_rules")
                    .insert(legacyRulesPayload);

                if (legacyRulesError) {
                    throw new Error(`Category rules insert failed: ${rulesError.message} | fallback failed: ${legacyRulesError.message}`);
                }
            }
        }

        // Insert milestones
        if (milestones.length > 0) {
            const milestonesPayload = milestones.map((m: any) => ({
                card_id: cardId,
                spend_threshold: m.spend_threshold,
                bonus_points: m.bonus_points ?? 0,
                bonus_cash_inr: m.bonus_cash_inr ?? null,
                bonus_description: m.bonus_description ?? "",
            }));

            const { error: milestonesError } = await supabase.from("card_milestones").insert(milestonesPayload);
            if (milestonesError) {
                const legacyMilestonesPayload = milestones.map((m: any) => ({
                    card_id: cardId,
                    milestone_type: "SPEND_BONUS",
                    spend_threshold: m.spend_threshold,
                    threshold_period: "YEAR",
                    benefit_points: m.bonus_points ?? 0,
                    benefit_inr_value: m.bonus_cash_inr ?? 0,
                    fee_waived_amount: 0,
                    description: m.bonus_description ?? "",
                }));
                const { error: legacyMilestonesError } = await supabase
                    .from("card_milestones")
                    .insert(legacyMilestonesPayload);

                if (legacyMilestonesError) {
                    throw new Error(`Milestones insert failed: ${milestonesError.message} | fallback failed: ${legacyMilestonesError.message}`);
                }
            }
        }

        // Invalidate Redis cache
        try {
            const { Redis } = await import("@upstash/redis");
            if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
                const redis = new Redis({
                    url: process.env.UPSTASH_REDIS_REST_URL,
                    token: process.env.UPSTASH_REDIS_REST_TOKEN,
                });
                // Clear all recommend caches when card DB changes
                await redis.flushdb();
            }
        } catch { }

        return NextResponse.json({ success: true, card_id: cardId, slug });

    } catch (error: any) {
        console.error("Card save error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
