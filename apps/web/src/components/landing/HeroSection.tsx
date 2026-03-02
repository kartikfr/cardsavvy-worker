"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import { HeroCanvas } from "@/components/3d/HeroCanvas";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
    { value: "50+", label: "Cards Compared", icon: "💳" },
    { value: "₹28,500", label: "Max Savings / Year", icon: "💰" },
    { value: "2 min", label: "To Complete", icon: "⚡" },
    { value: "0", label: "Rupees to Use", icon: "🆓" },
];

const SCROLLING_CARDS = [
    "HDFC Diners Club Black", "Axis Reserve", "SBI Card PRIME", "Amex Platinum Travel",
    "ICICI Amazon Pay", "IndusInd Tiger", "HDFC Regalia Gold", "Axis Atlas",
    "Tata Neu HDFC", "HDFC Millennia", "ICICI Coral", "Flipkart Axis",
];

export function HeroSection() {
    const containerRef = useRef<HTMLElement>(null);
    const tickerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(".hero-eyebrow", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
            .fromTo(".hero-heading", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, "-=0.3")
            .fromTo(".hero-sub", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.5")
            .fromTo(".hero-cta-group", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.4")
            .fromTo(".hero-stats", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 }, "-=0.3")
            .fromTo(".hero-right", { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, "-=1.2");

        gsap.fromTo(".card-item", { y: 50, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out",
            scrollTrigger: { trigger: ".stagger-grid", start: "top 80%" }
        });
    }, { scope: containerRef });

    // Infinite marquee via CSS only
    return (
        <main ref={containerRef} className="relative bg-[#080808] overflow-hidden">
            {/* ── Animated mesh background ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-brand-green/8 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/6 blur-[140px]" />
                <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px"
                    }} />
            </div>

            {/* ── Hero section ── */}
            <section className="relative z-10 min-h-[100dvh] flex flex-col pt-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 py-16 lg:py-0">

                    {/* Left: Copy */}
                    <div className="w-full lg:w-[55%] flex flex-col items-start text-left max-w-2xl">
                        {/* Eyebrow badge */}
                        <div className="hero-eyebrow inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 md:mb-8"
                            style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.25)" }}>
                            <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                            <span className="text-xs font-semibold text-brand-green tracking-wide">India's smartest card engine</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                        </div>

                        {/* Main heading */}
                        <h1 className="hero-heading font-display font-extrabold tracking-tight text-white leading-[1.08] mb-5 md:mb-6"
                            style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)" }}>
                            Find the credit card<br />
                            that{" "}
                            <span className="relative inline-block">
                                <span className="text-brand-green">saves you the most.</span>
                                <svg className="absolute -bottom-1 left-0 w-full h-2 opacity-40" viewBox="0 0 200 8" fill="none">
                                    <path d="M0 6 Q100 0 200 6" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>

                        <p className="hero-sub text-base md:text-lg text-white/50 max-w-xl mb-8 md:mb-10 leading-relaxed">
                            Tell us how you spend across 9 categories. Our engine calculates your exact net annual savings across 50+ premium Indian credit cards — down to the single Rupee.
                        </p>

                        {/* CTAs */}
                        <div className="hero-cta-group flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 w-full sm:w-auto mb-10 md:mb-14">
                            <Link href="/find-my-card"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand-green text-black font-bold px-7 py-4 rounded-xl text-base md:text-lg hover:bg-green-400 transition-all active:scale-95 shadow-xl shadow-brand-green/20">
                                Calculate My Savings
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-white/40 font-mono">
                                <Shield className="w-4 h-4" />
                                Free · No login · No card needed
                            </div>
                        </div>

                        {/* Micro-stats */}
                        <div className="hero-stats w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {STATS.map((s) => (
                                <div key={s.label} className="flex flex-col gap-1 p-3 rounded-xl border"
                                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                                    <span className="text-xl">{s.icon}</span>
                                    <span className="font-mono font-bold text-white text-lg leading-none">{s.value}</span>
                                    <span className="text-white/40 text-xs leading-tight">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: 3D Card */}
                    <div className="hero-right w-full lg:w-[45%] flex items-center justify-center relative">
                        <HeroCanvas />
                    </div>
                </div>

                {/* ── Scrolling card ticker ── */}
                <div className="relative w-full py-5 border-t border-b overflow-hidden"
                    style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex gap-6 animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
                        {[...SCROLLING_CARDS, ...SCROLLING_CARDS].map((name, i) => (
                            <span key={i} className="inline-flex items-center gap-2.5 text-sm font-medium text-white/40 shrink-0">
                                <span className="w-2 h-2 rounded-full bg-brand-green/50 shrink-0" />
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
