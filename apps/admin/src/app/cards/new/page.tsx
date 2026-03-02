"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ChevronRight, Save, AlertCircle, CheckCircle2 } from "lucide-react";

interface ScrapedCard {
    name: string;
    bank_name: string;
    network: string;
    card_tier: string;
    joining_fee: number;
    annual_fee: number;
    fee_waiver_spend: number | null;
    fee_waiver_type: string | null;
    reward_type: string;
    reward_currency_name: string | null;
    base_reward_rate: number;
    point_value_inr: number;
    earnkaro_id: string | null;
    card_page_url: string | null;
    category_rules: { category: string; multiplier: number; max_monthly_spend: number | null }[];
    milestones: { spend_threshold: number; bonus_points: number; bonus_description: string }[];
    affiliate_url: string | null;
}

export default function NewCardPage() {
    const router = useRouter();
    const [cardName, setCardName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scrapedData, setScrapedData] = useState<ScrapedCard | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleScrape = async () => {
        if (!cardName.trim()) return;
        setIsLoading(true);
        setError(null);
        setScrapedData(null);

        try {
            const res = await fetch("/api/admin/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ card_name: cardName }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Scrape failed");
            setScrapedData(data.card);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!scrapedData) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scrapedData),
            });
            if (!res.ok) throw new Error("Save failed");
            setSaveSuccess(true);
            setTimeout(() => router.push("/cards"), 1500);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const formField = (label: string, field: keyof ScrapedCard, type: "text" | "number" = "text") => {
        if (!scrapedData) return null;
        return (
            <div key={field}>
                <label className="block text-xs text-muted-foreground mb-1 font-mono uppercase tracking-wider">{label}</label>
                <input
                    type={type}
                    value={(scrapedData[field] as any) ?? ""}
                    onChange={(e) => setScrapedData((prev: any) => ({
                        ...prev,
                        [field]: type === "number" ? parseFloat(e.target.value) : e.target.value
                    }))}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white font-mono"
                    style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)" }}
                />
            </div>
        );
    };

    return (
        <div className="p-8 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Add New Card</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Type a card name → Gemini AI automatically scrapes and structures all card data
                </p>
            </div>

            {/* Step 1: Card name input */}
            <div className="rounded-xl border p-6 mb-6" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center text-black text-xs font-bold">1</div>
                    <h2 className="font-semibold text-white">Enter Card Name</h2>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                        placeholder="e.g. HDFC Diners Club Black, Axis Reserve, SBI Card PRIME..."
                        className="flex-1 px-4 py-3 rounded-lg text-sm text-white placeholder-muted-foreground"
                        style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)" }}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleScrape}
                        disabled={isLoading || !cardName.trim()}
                        className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-40"
                        style={{ background: "#22c55e", color: "#000" }}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isLoading ? "Scraping..." : "Auto-Fill with AI"}
                    </button>
                </div>
                {isLoading && (
                    <div className="mt-4 p-4 rounded-lg bg-brand-green/5 border border-brand-green/20">
                        <div className="flex items-center gap-2 text-brand-green text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Gemini is searching Google for "{cardName}" and extracting card data...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Error state */}
            {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-400/5 p-4 mb-6">
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                </div>
            )}

            {/* Step 2: Review + Edit AI output */}
            {scrapedData && (
                <div className="rounded-xl border p-6 mb-6" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center text-black text-xs font-bold">2</div>
                        <h2 className="font-semibold text-white">Review AI-Extracted Data</h2>
                        <span className="text-xs text-muted-foreground ml-auto">Edit any field before saving</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {formField("Card Name", "name")}
                        {formField("Bank Name", "bank_name")}
                        {formField("Network (VISA/MC/AMEX)", "network")}
                        {formField("Card Tier", "card_tier")}
                        {formField("Reward Type", "reward_type")}
                        {formField("Joining Fee (₹)", "joining_fee", "number")}
                        {formField("Annual Fee (₹)", "annual_fee", "number")}
                        {formField("Base Reward Rate", "base_reward_rate", "number")}
                        {formField("Point Value in INR", "point_value_inr", "number")}
                        {formField("EarnKaro ID", "earnkaro_id")}
                        {formField("Card Page URL", "card_page_url")}
                        {formField("Fee Waiver Spend (₹)", "fee_waiver_spend", "number")}
                    </div>

                    {/* Category Rules Preview */}
                    {scrapedData.category_rules.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-white mb-3">Category Reward Rules ({scrapedData.category_rules.length})</h3>
                            <div className="space-y-1.5">
                                {scrapedData.category_rules.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg"
                                        style={{ background: "#0d0d0d" }}>
                                        <span className="text-muted-foreground font-mono uppercase text-xs">{r.category}</span>
                                        <span className="text-brand-green font-mono font-bold">{r.multiplier}x</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Milestone bonuses */}
                    {scrapedData.milestones.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-white mb-3">Milestone Bonuses ({scrapedData.milestones.length})</h3>
                            <div className="space-y-1.5">
                                {scrapedData.milestones.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg"
                                        style={{ background: "#0d0d0d" }}>
                                        <span className="text-muted-foreground text-xs">Spend ₹{m.spend_threshold.toLocaleString("en-IN")}</span>
                                        <span className="text-amber-400 font-mono text-xs">{m.bonus_description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Save */}
            {scrapedData && (
                <div className="rounded-xl border p-6" style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center text-black text-xs font-bold">3</div>
                        <h2 className="font-semibold text-white">Save to Database</h2>
                    </div>
                    {saveSuccess ? (
                        <div className="flex items-center gap-2 text-brand-green text-sm">
                            <CheckCircle2 className="w-5 h-5" /> Card saved successfully! Redirecting...
                        </div>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-brand-green text-black font-semibold px-6 py-3 rounded-lg text-sm hover:bg-green-400 transition-colors disabled:opacity-40"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? "Saving..." : "Save Card to Database"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
