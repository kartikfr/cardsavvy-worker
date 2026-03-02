"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Search, ExternalLink } from "lucide-react";

export default function QueueReviewPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In production, we'd GET /api/admin/queue fetching 'MAPPED_AWAITING_REVIEW' 
        // from Supabase `ingestion_queue`

        // Simulating the DB read
        setTimeout(() => {
            setItems([
                {
                    id: "fake-queue-1",
                    source_url: "https://www.hdfcbank.com/infinia",
                    bank_name: "HDFC Bank",
                    status: "MAPPED_AWAITING_REVIEW",
                    created_at: new Date().toISOString(),
                    mapped_card_data: {
                        name: "Infinia Credit Card",
                        reward_type: "POINTS",
                        base_reward_rate: 0.033,
                        annual_fee: 12500
                    }
                },
                {
                    id: "fake-queue-2",
                    source_url: "https://www.sbicard.com/elite",
                    bank_name: "SBI Card",
                    status: "ERROR",
                    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hr ago
                    error_log: "AI Model timed out parsing complex HTML table structure."
                }
            ]);
            setLoading(false);
        }, 800);
    }, []);

    const handleApprove = async (id: string) => {
        // Calling `POST /api/admin/approve` which would:
        // 1. Move data into `cards` table.
        // 2. Add entry to `card_audit_logs`.
        // 3. Trigger cache invalidation webhook.
        // 4. Update status to 'COMPLETED'.
        setItems((prev) => prev.filter(i => i.id !== id));
        alert("Card rule approved and merged to live database! Cache invalidated.");
    };

    return (
        <div className="max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Ingestion Queue</h1>
                    <p className="text-muted-foreground mt-2">Review AI-mapped card data before pushing to the core recommendation engine.</p>
                </div>
                <button className="bg-neutral-800 text-foreground px-4 py-2 hover:bg-neutral-700 font-medium rounded-md shadow flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" /> Trigger Worker Now
                </button>
            </div>

            <div className="flex items-center gap-4 bg-card border border-border px-4 py-3 rounded-xl mb-6 shadow-sm">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search URLs or Banks..."
                    className="bg-transparent border-none outline-none w-full text-sm disabled:opacity-50"
                    disabled={loading}
                />
            </div>

            {loading ? (
                <div className="space-y-4">
                    <div className="h-48 bg-card border border-border animate-pulse rounded-xl w-full"></div>
                    <div className="h-48 bg-card border border-border animate-pulse rounded-xl w-full"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {items.length === 0 && (
                        <div className="p-12 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                            No queue items currently awaiting review!
                        </div>
                    )}

                    {items.map(item => (
                        <div key={item.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">

                            {/* Info Column */}
                            <div className="md:w-1/3 p-6 border-r border-border bg-neutral-50 dark:bg-neutral-900/50">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${item.status === 'ERROR' ? 'bg-destructive/10 text-destructive' : 'bg-brand-gold/10 text-brand-gold'
                                        }`}>
                                        {item.status.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {new Date(item.created_at).toLocaleTimeString()}
                                    </span>
                                </div>

                                <h3 className="font-semibold text-lg mb-1">{item.bank_name || "Unknown Bank"}</h3>
                                <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-green hover:underline flex items-center gap-1 mb-6 break-all">
                                    {item.source_url.replace("https://", "")} <ExternalLink className="w-3 h-3" />
                                </a>

                                {item.status === 'ERROR' && (
                                    <div className="mb-4 p-3 bg-red-950/30 border border-red-900/50 rounded-md">
                                        <p className="text-xs text-red-400 font-mono break-words">{item.error_log}</p>
                                    </div>
                                )}
                            </div>

                            {/* AI Mapped Data Output Column */}
                            <div className="md:w-2/3 p-6 flex flex-col">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">AI Mapped Data Output</h4>

                                {item.mapped_card_data ? (
                                    <pre className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 text-brand-green font-mono text-xs overflow-x-auto flex-grow mb-6">
                                        {JSON.stringify(item.mapped_card_data, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="flex-grow flex items-center justify-center bg-neutral-900 rounded-lg border border-neutral-800 mb-6 text-muted-foreground text-sm italic">
                                        No structured output available.
                                    </div>
                                )}

                                <div className="mt-auto flex justify-end gap-3 pt-4 border-t border-border">
                                    <button
                                        onClick={() => alert('Item rejected and sent back to manual crawl queue.')}
                                        className="flex items-center gap-2 px-4 py-2 border border-border text-foreground hover:bg-neutral-800 rounded-md text-sm font-medium transition-colors"
                                    >
                                        <XCircle className="w-4 h-4 text-destructive" /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(item.id)}
                                        disabled={item.status === 'ERROR'}
                                        className="flex items-center gap-2 px-6 py-2 bg-brand-green hover:bg-brand-green/90 text-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-bold transition-colors"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Approve & Merge
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
