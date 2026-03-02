import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

const PLACEHOLDER_CARDS = [
    { id: "p1", name: "HDFC Diners Club Black", bank_name: "HDFC Bank", card_tier: "ULTRA_PREMIUM", reward_type: "POINTS", annual_fee: 10000, slug: null, gradient: "from-slate-900 via-blue-950 to-slate-900", accent: "#60a5fa" },
    { id: "p2", name: "Axis Reserve", bank_name: "Axis Bank", card_tier: "ULTRA_PREMIUM", reward_type: "MILES", annual_fee: 50000, slug: null, gradient: "from-neutral-900 via-purple-950 to-neutral-900", accent: "#a78bfa" },
    { id: "p3", name: "SBI Card PRIME", bank_name: "SBI Card", card_tier: "PREMIUM", reward_type: "CASHBACK", annual_fee: 2999, slug: null, gradient: "from-slate-900 via-emerald-950 to-slate-900", accent: "#34d399" },
    { id: "p4", name: "Amex Platinum Travel", bank_name: "American Express", card_tier: "PREMIUM", reward_type: "MILES", annual_fee: 5000, slug: null, gradient: "from-neutral-900 via-amber-950 to-neutral-900", accent: "#fbbf24" },
    { id: "p5", name: "ICICI Amazon Pay", bank_name: "ICICI Bank", card_tier: "STANDARD", reward_type: "CASHBACK", annual_fee: 0, slug: null, gradient: "from-slate-900 via-orange-950 to-slate-900", accent: "#fb923c" },
    { id: "p6", name: "Flipkart Axis Bank", bank_name: "Axis Bank", card_tier: "STANDARD", reward_type: "CASHBACK", annual_fee: 500, slug: null, gradient: "from-neutral-900 via-rose-950 to-neutral-900", accent: "#fb7185" },
];

const TIER_BADGE: Record<string, string> = {
    ULTRA_PREMIUM: "⬡ Ultra Premium",
    PREMIUM: "◆ Premium",
    STANDARD: "● Standard",
    ENTRY: "○ Entry",
};

export async function FeaturedCards() {
    const supabase = await createClient();
    let cards: any[] = [];

    try {
        const { data } = await supabase
            .from("cards")
            .select("id, slug, name, bank_name, network, card_tier, joining_fee, annual_fee, reward_type, image_url")
            .eq("is_active", true)
            .limit(6);
        if (data && data.length > 0) cards = data;
    } catch { }

    const displayCards = cards.length > 0
        ? cards.map((c, i) => ({ ...c, ...(PLACEHOLDER_CARDS[i] ?? PLACEHOLDER_CARDS[0]) }))
        : PLACEHOLDER_CARDS;

    return (
        <section className="py-20 md:py-28 relative" id="featured">
            <div className="container mx-auto px-4 sm:px-6 md:px-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4 text-xs font-mono text-brand-green"
                            style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.2)" }}>
                            <Star className="w-3 h-3 fill-current" /> Top-rated Indian cards
                        </div>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                            50+ cards ranked by<br className="hidden sm:block" />
                            <span className="text-brand-green"> your actual savings</span>
                        </h2>
                    </div>
                    <Link href="/find-my-card"
                        className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors group shrink-0">
                        See your personal ranking
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 stagger-grid">
                    {displayCards.map((card: any, idx) => (
                        <div key={card.id ?? idx}
                            className="card-item group relative rounded-2xl overflow-hidden border cursor-pointer"
                            style={{ borderColor: "rgba(255,255,255,0.08)", background: "#111111" }}>

                            {/* Card art area */}
                            <div className={`relative h-44 bg-gradient-to-br ${card.gradient ?? "from-slate-900 to-neutral-900"} overflow-hidden`}>
                                {/* Shimmer overlay on hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />

                                {/* Mock card visual */}
                                <div className="absolute inset-4 rounded-xl border flex flex-col justify-between p-4"
                                    style={{ borderColor: `${card.accent ?? "#22c55e"}20`, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)" }}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: card.accent ?? "#22c55e" }}>{card.bank_name}</p>
                                        </div>
                                        {/* Mastercard-style circles */}
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-red-500/70" />
                                            <div className="w-6 h-6 rounded-full bg-amber-400/70" />
                                        </div>
                                    </div>
                                    {/* Chip */}
                                    <div>
                                        <div className="w-8 h-6 rounded mb-3" style={{ background: `linear-gradient(135deg, ${card.accent ?? "#22c55e"}40, ${card.accent ?? "#22c55e"}20)`, border: `1px solid ${card.accent ?? "#22c55e"}30` }} />
                                        <p className="font-mono text-white/70 text-xs tracking-widest">•••• •••• •••• ••••</p>
                                    </div>
                                </div>

                                {/* Rank badge */}
                                {idx < 3 && (
                                    <div className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-md font-mono"
                                        style={{ background: card.accent ?? "#22c55e", color: "#000" }}>
                                        #{idx + 1}
                                    </div>
                                )}
                            </div>

                            {/* Card info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                        <h3 className="font-semibold text-white text-sm leading-snug">{card.name}</h3>
                                        <p className="text-xs text-white/40 mt-0.5">{card.bank_name}</p>
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-1 rounded-full shrink-0"
                                        style={{ background: `${card.accent ?? "#22c55e"}15`, color: card.accent ?? "#22c55e" }}>
                                        {card.reward_type}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                                    <div>
                                        <p className="text-[10px] text-white/30 uppercase font-mono tracking-wider">Annual Fee</p>
                                        <p className="font-mono font-bold text-white text-sm">
                                            {card.annual_fee === 0 ? "FREE" : `₹${Number(card.annual_fee).toLocaleString("en-IN")}`}
                                        </p>
                                    </div>
                                    <div className="text-[10px] font-mono text-white/30 uppercase">{TIER_BADGE[card.card_tier] ?? card.card_tier}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12">
                    <Link href="/find-my-card"
                        className="inline-flex items-center gap-2 bg-brand-green text-black font-bold px-8 py-4 rounded-xl text-base hover:bg-green-400 transition-colors shadow-xl shadow-brand-green/15">
                        Get My Personalised Ranking
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <p className="text-xs text-white/30 mt-3 font-mono">Based on your spend profile · Free · Instant</p>
                </div>
            </div>
        </section>
    );
}
