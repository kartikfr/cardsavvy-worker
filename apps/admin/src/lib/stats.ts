import { createAdminClient } from "@/lib/supabase/server";

interface DashboardStats {
    totalCards: number;
    activeCards: number;
    pendingQueue: number;
    sessionsToday: number;
    totalAffiliateClicks: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const supabase = await createAdminClient();
        const today = new Date().toISOString().split("T")[0];

        const [cardsRes, queueRes, sessionsRes, clicksRes] = await Promise.all([
            supabase.from("cards").select("id, is_active", { count: "exact" }),
            supabase.from("ingestion_queue").select("id", { count: "exact" }).eq("status", "pending"),
            supabase.from("recommendation_sessions").select("id", { count: "exact" }).gte("created_at", `${today}T00:00:00`),
            supabase.from("affiliate_clicks").select("id", { count: "exact" }),
        ]);

        const totalCards = cardsRes.count ?? 0;
        const activeCards = cardsRes.data?.filter((c: any) => c.is_active).length ?? 0;

        return {
            totalCards,
            activeCards,
            pendingQueue: queueRes.count ?? 0,
            sessionsToday: sessionsRes.count ?? 0,
            totalAffiliateClicks: clicksRes.count ?? 0,
        };
    } catch {
        return { totalCards: 0, activeCards: 0, pendingQueue: 0, sessionsToday: 0, totalAffiliateClicks: 0 };
    }
}
