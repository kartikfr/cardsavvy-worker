"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CreditCard,
    Inbox,
    Settings,
    BarChart3,
    Zap,
} from "lucide-react";

const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/cards", icon: CreditCard, label: "Card Ledger" },
    { href: "/queue", icon: Inbox, label: "Ingestion Queue" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-60 min-h-screen border-r flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto"
            style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.08)" }}>
            {/* Logo */}
            <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-brand-green flex items-center justify-center">
                        <Zap className="w-4 h-4 text-black" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white tracking-tight">CardSavvy</p>
                        <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Admin</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? "bg-brand-green/10 text-brand-green"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                }`}
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Status footer */}
            <div className="px-4 py-4 border-t mx-3 mb-3 rounded-lg" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(34,197,94,0.05)" }}>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                    <span className="text-xs text-muted-foreground font-mono">System Online</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Gemini AI · Supabase · Redis</p>
            </div>
        </aside>
    );
}
