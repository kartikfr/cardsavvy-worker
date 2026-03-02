"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CardSavingResult } from "@cardsavvy/engine";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CountUp from "react-countup";
import { ArrowRight, Info, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

// Utility for formatting INR
const formatINR = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export default function ResultsPage() {
    const searchParams = useSearchParams();
    const sessionToken = searchParams.get("session");
    const [results, setResults] = useState<(CardSavingResult & { rank: number })[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app we would ping another GET endpoint `/api/recommend?session=...` 
        // to pull the session from the DB if it is valid. 
        // For MVP demonstration, assuming the POST response redirect hits here and 
        // we would actually inject state via zustand or server-side render this page.

        // Simulating the fetch for UI purposes 
        const timer = setTimeout(() => {
            setResults([
                {
                    rank: 1,
                    card: {
                        id: "fake-1",
                        name: "Premium Savings Card",
                        bank_name: "HDFC Bank",
                        joining_fee: 2500,
                        annual_fee: 2500,
                        fee_waiver_spend: 300000,
                        reward_type: "POINTS",
                        base_reward_rate: 0.033,
                        point_value_inr: 0.5,
                    },
                    netAnnualSaving: 24500,
                    netFirstYearSaving: 22000,
                    totalRewardsInr: 27000,
                    effectiveAnnualFee: 2500,
                    feeWaiverApplied: false,
                    joiningFeeAmortized: 2500,
                    milestoneBonus: 0,
                    categoryBreakdown: []
                },
                {
                    rank: 2,
                    card: {
                        id: "fake-2",
                        name: "Cashback Platinum",
                        bank_name: "SBI Card",
                        joining_fee: 1000,
                        annual_fee: 1000,
                        fee_waiver_spend: 200000,
                        reward_type: "CASHBACK",
                        base_reward_rate: 0.05,
                        point_value_inr: 1,
                    },
                    netAnnualSaving: 18000,
                    netFirstYearSaving: 17000,
                    totalRewardsInr: 18000,
                    effectiveAnnualFee: 0,
                    feeWaiverApplied: true,
                    joiningFeeAmortized: 1000,
                    milestoneBonus: 0,
                    categoryBreakdown: []
                }
            ]);
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [sessionToken]);

    if (!sessionToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Invalid Session</h2>
                    <p className="text-muted-foreground mb-6">Please calculate your savings first.</p>
                    <Button onClick={() => window.location.href = '/find-my-card'}>Go to Spend Form</Button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center md:text-left mb-12">
                    <Badge variant="outline" className="mb-4 text-brand-green border-brand-green bg-brand-green/10">Analysis Complete</Badge>
                    <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">Your Top Recommendations</h1>
                    <p className="text-muted-foreground text-lg mt-3">Based on your spend profile, here are the cards that maximize your returns.</p>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <Skeleton className="w-full md:w-64 h-40 rounded-xl" />
                                    <div className="flex-1 space-y-4">
                                        <Skeleton className="h-8 w-1/2" />
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-24 w-full mt-4" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {results?.map((res, idx) => (
                            <Card
                                key={res.card.id}
                                className={`overflow-hidden relative transition-all duration-500 hover:shadow-xl ${idx === 0 ? "border-brand-green shadow-brand-green/10 shadow-lg" : "border-border"}`}
                            >
                                {/* Winner Badge for Rank 1 */}
                                {idx === 0 && (
                                    <div className="absolute top-0 right-0 bg-brand-green text-black text-xs font-bold px-4 py-1.5 rounded-bl-xl z-20 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5" /> #1 BEST OVERALL
                                    </div>
                                )}

                                <div className="absolute top-4 left-4 z-20">
                                    <div className="w-8 h-8 rounded-full bg-foreground text-background font-mono font-bold flex items-center justify-center text-sm">
                                        {res.rank}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row">
                                    {/* Left Col: Art and Basic Info */}
                                    <div className="md:w-1/3 p-6 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col items-center justify-center border-r border-border relative">
                                        <div className="w-56 h-36 relative mb-6 rounded-xl overflow-hidden shadow-2xl">
                                            {/* Placeholder for Card Art */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black p-4 flex flex-col justify-end">
                                                <span className="text-white/50 text-xs font-mono">{res.card.bank_name}</span>
                                                <span className="text-white font-medium">{res.card.name}</span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-xl text-center mb-1">{res.card.name}</h3>
                                        <p className="text-muted-foreground text-sm text-center mb-4">{res.card.bank_name} • {res.card.reward_type}</p>

                                        <Button className="w-full bg-brand-green text-black hover:bg-brand-green/90 font-semibold shadow-brand-green/20 shadow-lg">
                                            Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>

                                    {/* Right Col: Savings Breakdown */}
                                    <div className="md:w-2/3 p-6 md:p-8 flex flex-col">
                                        <div className="mb-8">
                                            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Net Annual Savings</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl md:text-6xl font-display font-extrabold text-brand-green tracking-tighter">
                                                    ₹<CountUp end={res.netAnnualSaving} duration={2} separator="," />
                                                </span>
                                                <span className="text-muted-foreground font-mono">/ yr</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-8 gap-y-6 mt-auto">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                                    Total Rewards Value <Info className="w-3.5 h-3.5" />
                                                </p>
                                                <p className="font-mono text-lg font-medium text-foreground">+{formatINR(res.totalRewardsInr)}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Effective Annual Fee</p>
                                                <div className="flex items-center gap-2">
                                                    {res.feeWaiverApplied ? (
                                                        <>
                                                            <p className="font-mono text-lg font-medium text-muted-foreground line-through">
                                                                {formatINR(res.card.annual_fee)}
                                                            </p>
                                                            <Badge variant="outline" className="text-brand-green border-brand-green bg-brand-green/10">Waived</Badge>
                                                        </>
                                                    ) : (
                                                        <p className="font-mono text-lg font-medium text-destructive">
                                                            -{formatINR(res.effectiveAnnualFee)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {res.milestoneBonus > 0 && (
                                                <div className="col-span-2 pt-4 border-t border-border">
                                                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1 text-brand-gold">
                                                        <CheckCircle2 className="w-4 h-4" /> Bonus Milestone Unlocked
                                                    </p>
                                                    <p className="font-mono text-lg font-medium text-foreground">+{formatINR(res.milestoneBonus)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

// Just an aesthetic icon definition missing from above
function Sparkles(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
}
