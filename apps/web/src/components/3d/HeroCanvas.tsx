"use client";

import { useEffect, useRef } from "react";

// Pure CSS/JS 3D credit card animation — no Three.js dependency
// Mouse-tracking tilt + ambient floating animation
export function HeroCanvas() {
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const card = cardRef.current;
        if (!container || !card) return;

        let animFrame: number;
        let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

        const onMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            targetX = -((e.clientY - cy) / rect.height) * 18;
            targetY = ((e.clientX - cx) / rect.width) * 18;
        };

        const onMouseLeave = () => {
            targetX = 0;
            targetY = 0;
        };

        const animate = () => {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;
            card.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
            animFrame = requestAnimationFrame(animate);
        };

        container.addEventListener("mousemove", onMouseMove);
        container.addEventListener("mouseleave", onMouseLeave);
        animFrame = requestAnimationFrame(animate);

        return () => {
            container.removeEventListener("mousemove", onMouseMove);
            container.removeEventListener("mouseleave", onMouseLeave);
            cancelAnimationFrame(animFrame);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="h-[400px] w-full lg:h-[600px] relative z-10 flex items-center justify-center"
        >
            {/* Ambient glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 bg-brand-green/10 rounded-full blur-[100px]" />
            </div>

            {/* 3D Card */}
            <div
                ref={cardRef}
                style={{ transition: "none", willChange: "transform" }}
                className="relative w-[340px] h-[215px] select-none"
            >
                {/* Card body */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
                    style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)" }}>

                    {/* Holographic shimmer */}
                    <div className="absolute inset-0 opacity-20"
                        style={{ background: "linear-gradient(105deg, transparent 40%, rgba(34,197,94,0.3) 50%, transparent 60%)" }} />

                    {/* Top row */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                        <div>
                            <div className="text-brand-green font-mono text-[10px] tracking-[0.2em] uppercase opacity-80">CardSavvy</div>
                            <div className="text-white/40 text-[10px] mt-0.5">Premium Card</div>
                        </div>
                        <div className="flex gap-[-6px]">
                            <div className="w-8 h-8 rounded-full bg-red-500/70 border border-white/10" />
                            <div className="w-8 h-8 rounded-full bg-amber-400/70 border border-white/10 -ml-3" />
                        </div>
                    </div>

                    {/* Chip */}
                    <div className="absolute top-16 left-6">
                        <div className="w-10 h-8 rounded-md border border-amber-400/40"
                            style={{ background: "linear-gradient(135deg, #d4af37 0%, #f5e642 50%, #d4af37 100%)" }} />
                    </div>

                    {/* Card number */}
                    <div className="absolute bottom-12 left-6 right-6">
                        <div className="font-mono text-white/80 text-sm tracking-[0.2em]">
                            •••• •••• •••• 4829
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div className="absolute bottom-5 left-6 right-6 flex justify-between items-end">
                        <div>
                            <div className="text-white/40 text-[8px] uppercase tracking-widest">Card Holder</div>
                            <div className="text-white/90 text-xs font-medium tracking-wide">Karthik R.</div>
                        </div>
                        <div className="text-right">
                            <div className="text-white/40 text-[8px] uppercase tracking-widest">Expires</div>
                            <div className="text-white/90 text-xs font-mono">12/28</div>
                        </div>
                    </div>

                    {/* Border shine */}
                    <div className="absolute inset-0 rounded-2xl border border-white/10" />
                </div>
            </div>

            {/* Floating stat badges */}
            <div className="absolute left-4 bottom-16 hidden lg:block animate-float" style={{ animationDelay: "0s" }}>
                <div className="bg-card/90 backdrop-blur-md border border-brand-green/20 px-4 py-3 rounded-xl shadow-xl">
                    <p className="text-xs text-muted-foreground mb-1">Highest Savings</p>
                    <p className="font-mono font-bold text-brand-green">₹28,500/yr</p>
                </div>
            </div>
            <div className="absolute right-4 top-20 hidden lg:block animate-float" style={{ animationDelay: "2s" }}>
                <div className="bg-card/90 backdrop-blur-md border border-border px-4 py-3 rounded-xl shadow-xl">
                    <p className="text-xs text-muted-foreground mb-1">Cards Compared</p>
                    <p className="font-mono font-bold text-foreground">50+ Active</p>
                </div>
            </div>
        </div>
    );
}
