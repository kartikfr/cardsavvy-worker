import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PlusCircle, Edit, Eye, EyeOff, Star } from "lucide-react";

export default async function CardsPage() {
    const supabase = await createAdminClient();
    let cards: any[] = [];

    try {
        const { data } = await supabase
            .from("cards")
            .select("id, name, bank_name, card_tier, reward_type, annual_fee, is_active, is_featured, earnkaro_id, slug, updated_at")
            .order("bank_name");
        cards = data ?? [];
    } catch { }

    const tierColors: Record<string, string> = {
        ULTRA_PREMIUM: "text-purple-400 bg-purple-400/10",
        PREMIUM: "text-amber-400 bg-amber-400/10",
        STANDARD: "text-blue-400 bg-blue-400/10",
        ENTRY: "text-gray-400 bg-gray-400/10",
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Card Ledger</h1>
                    <p className="text-sm text-muted-foreground mt-1">{cards.length} cards total</p>
                </div>
                <Link
                    href="/cards/new"
                    className="flex items-center gap-2 bg-brand-green text-black font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-green-400 transition-colors"
                >
                    <PlusCircle className="w-4 h-4" />
                    Add via AI
                </Link>
            </div>

            {cards.length === 0 ? (
                <div className="rounded-xl border p-16 text-center" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                        <PlusCircle className="w-6 h-6 text-brand-green" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No cards yet</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                        Add your first credit card using the AI scraper. Just type the card name and Gemini will fill in all the details automatically.
                    </p>
                    <Link
                        href="/cards/new"
                        className="inline-flex items-center gap-2 bg-brand-green text-black font-semibold px-6 py-3 rounded-lg text-sm hover:bg-green-400 transition-colors"
                    >
                        <PlusCircle className="w-4 h-4" /> Add First Card
                    </Link>
                </div>
            ) : (
                <div className="rounded-xl border overflow-hidden" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                                <th className="px-4 py-3 text-xs text-muted-foreground font-mono uppercase tracking-wider">Card</th>
                                <th className="px-4 py-3 text-xs text-muted-foreground font-mono uppercase tracking-wider">Tier</th>
                                <th className="px-4 py-3 text-xs text-muted-foreground font-mono uppercase tracking-wider">Annual Fee</th>
                                <th className="px-4 py-3 text-xs text-muted-foreground font-mono uppercase tracking-wider">EarnKaro ID</th>
                                <th className="px-4 py-3 text-xs text-muted-foreground font-mono uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs text-muted-foreground font-mono uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map((card, idx) => (
                                <tr
                                    key={card.id}
                                    className="border-b last:border-0 hover:bg-white/2 transition-colors"
                                    style={{ borderColor: "rgba(255,255,255,0.05)" }}
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-white">{card.name}</p>
                                        <p className="text-xs text-muted-foreground">{card.bank_name} · {card.reward_type}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-mono px-2 py-1 rounded-full ${tierColors[card.card_tier] ?? "text-gray-400 bg-gray-400/10"}`}>
                                            {card.card_tier}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-white">
                                        ₹{(card.annual_fee ?? 0).toLocaleString("en-IN")}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                        {card.earnkaro_id ?? "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${card.is_active ? "text-brand-green bg-brand-green/10" : "text-red-400 bg-red-400/10"}`}>
                                                {card.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {card.is_active ? "Active" : "Inactive"}
                                            </span>
                                            {card.is_featured && (
                                                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-amber-400 bg-amber-400/10">
                                                    <Star className="w-3 h-3" /> Featured
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/cards/${card.id}/edit`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
                                            <Edit className="w-3.5 h-3.5" /> Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
