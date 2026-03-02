import Link from "next/link";
import { Calculator, Search, CreditCard, ArrowRight, Zap } from "lucide-react";

const HOW_IT_WORKS = [
    {
        step: "01",
        icon: Calculator,
        title: "Tell us how you spend",
        desc: "Adjust 9 category sliders — groceries, dining, flights, fuel & more. Takes under 2 minutes.",
        accent: "#22c55e",
    },
    {
        step: "02",
        icon: Search,
        title: "Engine calculates",
        desc: "We run your profile against 50+ Indian credit cards, calculating exact net annual savings to the rupee.",
        accent: "#60a5fa",
    },
    {
        step: "03",
        icon: CreditCard,
        title: "You save money",
        desc: "Get a ranked list personalised to you — not a generic 'best card' list. Your spend, your savings.",
        accent: "#f59e0b",
    },
];

export function HowItWorks() {
    return (
        <section className="py-20 md:py-28 relative border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {/* Subtle gradient */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.04) 0%, transparent 60%)" }} />

            <div className="container mx-auto px-4 sm:px-6 md:px-10 relative">
                {/* Trust bar */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-16 md:mb-20">
                    {[
                        { val: "50+", label: "Cards Compared" },
                        { val: "₹0", label: "Cost to Use" },
                        { val: "No Login", label: "Required" },
                        { val: "2 Min", label: "To Complete" },
                    ].map((s) => (
                        <div key={s.label} className="text-center">
                            <p className="font-mono font-bold text-2xl md:text-3xl text-white">{s.val}</p>
                            <p className="text-xs md:text-sm text-white/35 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Section header */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
                        style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.2)" }}>
                        <Zap className="w-3.5 h-3.5 text-brand-green" />
                        <span className="text-xs font-mono text-brand-green uppercase tracking-widest">How it works</span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                        3 steps to your best card
                    </h2>
                </div>

                {/* Steps — stacked on mobile, 3-col on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-14 md:mb-16">
                    {HOW_IT_WORKS.map((item, idx) => (
                        <div key={item.step} className="relative flex flex-col md:items-center md:text-center group">
                            {/* Step number connector (desktop only) */}
                            {idx < 2 && (
                                <div className="hidden md:block absolute top-7 left-[calc(50%+3.5rem)] w-[calc(100%-7rem)] h-px"
                                    style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.1), transparent)" }} />
                            )}
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:-translate-y-1 duration-300 shrink-0"
                                style={{ background: `${item.accent}12`, border: `1.5px solid ${item.accent}25` }}>
                                <item.icon className="w-6 h-6" style={{ color: item.accent }} />
                            </div>
                            <span className="font-mono text-xs font-bold mb-2 tracking-widest" style={{ color: item.accent }}>{item.step}</span>
                            <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                            <p className="text-white/45 text-sm leading-relaxed max-w-xs">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/find-my-card"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-green text-black font-bold px-8 py-4 rounded-xl text-base hover:bg-green-400 transition-colors">
                        Start My Savings Report <ArrowRight className="w-5 h-5" />
                    </Link>
                    <p className="text-xs text-white/30 font-mono">Free forever · No account needed</p>
                </div>
            </div>
        </section>
    );
}
