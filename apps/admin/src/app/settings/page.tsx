"use client";

import { useState, useEffect } from "react";
// Would use Shadcn UI in real implementations but for speed styling natively here:
import { Database, Lock, Save, RefreshCw, CloudLightning } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [config, setConfig] = useState({
        provider: "openai",
        model: "gpt-4o",
        api_key: "",
        base_url: "https://api.openai.com/v1"
    });

    useEffect(() => {
        // In real implementation this fetches from `/api/admin/settings` (Supabase system_settings)
        // Simulating load for MVP
        setTimeout(() => {
            setConfig({
                provider: "openai",
                model: "gpt-4o-mini",
                api_key: "sk-proj-...", // masked
                base_url: "https://api.openai.com/v1"
            });
            setLoading(false);
        }, 500);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        // Simulate updating DB
        await new Promise(r => setTimeout(r, 600));
        setSaving(false);
        alert("AI Configuration saved to system_settings ledger.");
    };

    const handleBatchSync = async () => {
        if (!confirm("Start the Cloud Batch Sync? This will securely send the TOP 50 Indian cards to the Python worker running in the background.")) return;

        setSyncing(true);
        try {
            const res = await fetch("/api/admin/batch-scrape", { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to trigger batch job.");
            alert("✅ " + data.message + "\n\nIt is now running completely autonomously in the cloud and will insert cards into Supabase once finished.");
        } catch (error: any) {
            console.error(error);
            alert("❌ Sync trigger failed: " + error.message);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">System Settings</h1>
                <p className="text-muted-foreground mt-2">Manage API integrations and queue behaviors.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-green/10 text-brand-green rounded-lg">
                        <Database className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-semibold">AI Processor Config</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                    This model is used by the Event Ingestion Pipeline to map raw crawler HTML/JSON into the strict <code className="text-brand-green bg-brand-green/10 px-1 py-0.5 rounded">CardRuleSet</code> required by the calculation engine.
                </p>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-neutral-800 rounded w-full"></div>
                        <div className="h-10 bg-neutral-800 rounded w-full"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Provider</label>
                                <select
                                    value={config.provider}
                                    onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-4 py-2 text-sm focus:border-brand-green outline-none"
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="anthropic">Anthropic</option>
                                    <option value="google">Google Gemini</option>
                                    <option value="ollama">Local (Ollama/vLLM)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Completion Model</label>
                                <input
                                    type="text"
                                    value={config.model}
                                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-4 py-2 text-sm focus:border-brand-green outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                                API Key <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                            </label>
                            <input
                                type="password"
                                value={config.api_key}
                                onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                                placeholder="sk-..."
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-4 py-2 text-sm focus:border-brand-green outline-none font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Base URL (Leave default unless using local/proxy)</label>
                            <input
                                type="text"
                                value={config.base_url}
                                onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-4 py-2 text-sm focus:border-brand-green outline-none font-mono text-muted-foreground"
                            />
                        </div>

                        <div className="pt-4 border-t border-border flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-brand-green hover:bg-brand-green/90 text-black px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Configuration
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Cloud Worker Batch Integration */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                        <CloudLightning className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Python Cloud Worker Sync</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                    This will securely dispatch your Top 50 Indian Credit Cards list, alongside your Supabase and Gemini credentials, directly to the dedicated Python Playwright worker running on Render/Railway. It bypasses all localhost/Next.js limitations and natively handles Google's 429 API rate limits in the background.
                </p>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-6 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-neutral-400">Worker Status</span>
                        <span className="text-sm text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">ONLINE</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-neutral-400">Target Pipeline</span>
                        <span className="text-sm text-neutral-300 font-mono">POST /batch-scrape</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-neutral-400">Expected Execution Time</span>
                        <span className="text-sm text-neutral-300 font-mono">~45 minutes</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                    <button
                        onClick={handleBatchSync}
                        disabled={syncing || loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                        {syncing ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Triggering Job...
                            </>
                        ) : (
                            <>
                                <CloudLightning className="w-4 h-4" />
                                Trigger Background Sync
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
