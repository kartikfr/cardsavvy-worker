import { getDashboardStats } from "@/lib/stats";
import {
  CreditCard, Inbox, Zap, MousePointerClick,
  TrendingUp, AlertCircle, CheckCircle2, PlusCircle
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    {
      label: "Total Cards", value: stats.totalCards, sub: `${stats.activeCards} active`,
      icon: CreditCard, color: "text-blue-400", bg: "bg-blue-400/10"
    },
    {
      label: "Pending Queue", value: stats.pendingQueue, sub: "awaiting review",
      icon: Inbox, color: "text-amber-400", bg: "bg-amber-400/10",
      alert: stats.pendingQueue > 0
    },
    {
      label: "Sessions Today", value: stats.sessionsToday, sub: "recommendation runs",
      icon: Zap, color: "text-brand-green", bg: "bg-brand-green/10"
    },
    {
      label: "Affiliate Clicks", value: stats.totalAffiliateClicks, sub: "all time via EarnKaro",
      icon: MousePointerClick, color: "text-purple-400", bg: "bg-purple-400/10"
    },
  ];

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">CardSavvy engine control center</p>
        </div>
        <Link
          href="/cards/new"
          className="flex items-center gap-2 bg-brand-green text-black font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-green-400 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Card via AI
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border p-5 relative"
            style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
            {kpi.alert && (
              <div className="absolute top-3 right-3">
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
            )}
            <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-4`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-3xl font-bold font-mono text-white mb-1">{kpi.value}</p>
            <p className="text-sm font-medium text-white/80">{kpi.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="rounded-xl border p-6" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
          <h2 className="font-semibold text-white mb-1">Quick Actions</h2>
          <p className="text-xs text-muted-foreground mb-5">Most common operations</p>
          <div className="space-y-2">
            <Link href="/cards/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
              <div className="w-8 h-8 rounded-md bg-brand-green/10 flex items-center justify-center">
                <PlusCircle className="w-4 h-4 text-brand-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Add New Card (AI Scrape)</p>
                <p className="text-xs text-muted-foreground">Type card name → Gemini fetches all data</p>
              </div>
            </Link>
            <Link href="/queue" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
              <div className="w-8 h-8 rounded-md bg-amber-400/10 flex items-center justify-center">
                <Inbox className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Review Ingestion Queue</p>
                <p className="text-xs text-muted-foreground">{stats.pendingQueue} items waiting for approval</p>
              </div>
            </Link>
            <Link href="/cards" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
              <div className="w-8 h-8 rounded-md bg-blue-400/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Manage Card Ledger</p>
                <p className="text-xs text-muted-foreground">{stats.totalCards} cards total · {stats.activeCards} active</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border p-6" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
          <h2 className="font-semibold text-white mb-1">System Status</h2>
          <p className="text-xs text-muted-foreground mb-5">Infrastructure health</p>
          <div className="space-y-3">
            {[
              { label: "Supabase DB", status: "Online" },
              { label: "Upstash Redis Cache", status: "Online" },
              { label: "Gemini AI (Scraper)", status: "Ready" },
              { label: "EarnKaro Affiliate Tracking", status: "Active" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-brand-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DB Migration notice */}
      {stats.totalCards === 0 && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-400 mb-1">Database migrations not applied</h3>
              <p className="text-sm text-muted-foreground mb-3">
                No cards found in the database. Apply SQL migrations to get started.
              </p>
              <a
                href="https://app.supabase.com/project/tfuxzjxvkwjakcaqzexm/sql/new"
                target="_blank"
                className="text-sm font-medium text-amber-400 underline"
              >
                Open Supabase SQL Editor →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
