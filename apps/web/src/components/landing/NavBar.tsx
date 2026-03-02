"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu, X, ArrowRight } from "lucide-react";

export function NavBar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const links = [
        { href: "/", label: "Home" },
        { href: "/find-my-card", label: "Find My Card" },
    ];

    return (
        <>
            <header className="fixed top-0 w-full z-50 backdrop-blur-xl border-b"
                style={{ background: "rgba(8,8,8,0.85)", borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="w-7 h-7 rounded-md bg-brand-green flex items-center justify-center transition-transform group-hover:scale-110">
                            <Zap className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-display font-bold text-lg text-white tracking-tight">CardSavvy</span>
                        <span className="text-brand-green font-mono text-[9px] tracking-widest uppercase hidden sm:block ml-0.5 opacity-60">India</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-7">
                        {links.map((link) => (
                            <Link key={link.href} href={link.href}
                                className={`text-sm font-medium transition-colors ${pathname === link.href ? "text-white" : "text-white/40 hover:text-white"}`}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        {/* CTA */}
                        <Link href="/find-my-card"
                            className="hidden sm:inline-flex items-center gap-1.5 bg-brand-green text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-green-400 transition-colors">
                            <Zap className="w-3.5 h-3.5" />
                            Calculate Savings
                        </Link>

                        {/* Mobile: hamburger */}
                        <button
                            onClick={() => setOpen(!open)}
                            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile drawer */}
                {open && (
                    <div className="md:hidden border-t px-4 py-5 space-y-2"
                        style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.06)" }}>
                        {links.map((link) => (
                            <Link key={link.href} href={link.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === link.href ? "bg-white/8 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                                {link.label}
                                <ArrowRight className="w-4 h-4 opacity-40" />
                            </Link>
                        ))}
                        <div className="pt-2">
                            <Link href="/find-my-card" onClick={() => setOpen(false)}
                                className="flex items-center justify-center gap-2 w-full bg-brand-green text-black font-bold px-4 py-4 rounded-xl text-base hover:bg-green-400 transition-colors">
                                <Zap className="w-4 h-4" />
                                Calculate My Savings
                            </Link>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
