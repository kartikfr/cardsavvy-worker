import { createAdminClient } from "@/lib/supabase/server";
import { BarChart3, TrendingUp, MousePointerClick, Zap } from "lucide-react";

export default async function AnalyticsPage() {
    const supabase = await createAdminClient();

    let topCards: any[] = [];
    let recentSessions: any[] = [];
    let totalSessions = 0;

    try {
        const [topCardsRes, sessionsRes, totalRes] = await Promise.all([
            supabase
                .from("affiliate_clicks")
                .select("card_id, cards(name, bank_name)")
                .limit(10),
            supabase
                .from("recommendation_sessions")
                .select("id, created_at, spend_profile")
                .order("created_at", { ascending: false })
                .limit(10),
            supabase.from("recommendation_sessions").select("id", { count: "exact" }),
        ]);
        topCards = topCardsRes.data ?? [];
        recentSessions = sessionsRes.data ?? [];
        totalSessions = totalRes.count ?? 0;
    } catch { }

    return (
        <div className="p-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <p className="text-sm text-muted-foreground mt-1">Recommendation sessions and affiliate performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border p-5" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-brand-green" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Total Sessions</span>
                    </div>
                    <p className="text-3xl font-bold font-mono text-white">{totalSessions}</p>
                    <p className="text-xs text-muted-foreground mt-1">All time recommendation runs</p>
                </div>
                <div className="rounded-xl border p-5" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 mb-3">
                        <MousePointerClick className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Affiliate Clicks</span>
                    </div>
                    <p className="text-3xl font-bold font-mono text-white">{topCards.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Via EarnKaro links</p>
                </div>
                <div className="rounded-xl border p-5" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Conversion</span>
                    </div>
                    <p className="text-3xl font-bold font-mono text-white">
                        {totalSessions > 0 ? `${((topCards.length / totalSessions) * 100).toFixed(1)}%` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Sessions → affiliate clicks</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Sessions */}
                <div className="rounded-xl border" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <h2 className="font-semibold text-white text-sm">Recent Sessions</h2>
                    </div>
                    {recentSessions.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">No sessions yet</div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                            {recentSessions.map((s) => (
                                <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                                    <span className="text-xs font-mono text-muted-foreground">{s.id.slice(0, 12)}...</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(s.created_at).toLocaleDateString("en-IN")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Clicked Cards */}
                <div className="rounded-xl border" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <h2 className="font-semibold text-white text-sm">Top Affiliate Clicks</h2>
                    </div>
                    {topCards.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">No clicks yet</div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                            {topCards.map((c, i) => (
                                <div key={i} className="px-5 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white font-medium">{(c.cards as any)?.name ?? "Unknown Card"}</p>
                                        <p className="text-xs text-muted-foreground">{(c.cards as any)?.bank_name}</p>
                                    </div>
                                    <MousePointerClick className="w-4 h-4 text-purple-400" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
