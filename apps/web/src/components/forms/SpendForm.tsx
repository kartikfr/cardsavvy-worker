"use client";

import { useState } from "react";
import { useFormStore } from "@/lib/store/useFormStore";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Fuel, ShoppingCart, Utensils, Globe, Plane, Home, Tv, MoreHorizontal } from "lucide-react";
import type { SpendProfile } from "@cardsavvy/engine";
import { useRouter } from "next/navigation";

// Utility for formatting INR
const formatINR = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const CATEGORIES: { id: keyof SpendProfile["monthly"], label: string, icon: React.ReactNode, max: number }[] = [
    { id: "groceries", label: "Groceries & Supermarkets", icon: <ShoppingCart className="w-5 h-5" />, max: 100000 },
    { id: "dining", label: "Dining & Delivery", icon: <Utensils className="w-5 h-5" />, max: 50000 },
    { id: "online_shopping", label: "Online Shopping", icon: <Globe className="w-5 h-5" />, max: 150000 },
    { id: "travel_flights", label: "Flights", icon: <Plane className="w-5 h-5" />, max: 200000 },
    { id: "fuel", label: "Fuel", icon: <Fuel className="w-5 h-5" />, max: 30000 },
    { id: "travel_hotels", label: "Hotels", icon: <Home className="w-5 h-5" />, max: 150000 },
    { id: "utilities", label: "Utility Bills", icon: <Home className="w-5 h-5" />, max: 50000 },
    { id: "ott", label: "Streaming & OTT", icon: <Tv className="w-5 h-5" />, max: 5000 },
    { id: "other", label: "Other Retail", icon: <MoreHorizontal className="w-5 h-5" />, max: 100000 },
];

export function SpendForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { profile, updateMonthlySpend, updatePreference } = useFormStore();

    const totalMonthlySpend = Object.values(profile.monthly).reduce((a, b) => a + b, 0);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ spend_profile: profile })
            });
            const data = await res.json();
            if (data.session_token) {
                router.push(`/results?session=${data.session_token}`);
            }
        } catch (e) {
            console.error(e);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto min-h-[600px] flex flex-col pt-8 pb-20">

            {/* Progress Bar */}
            <div className="w-full mb-12 px-4">
                <div className="flex justify-between text-xs font-mono font-medium text-muted-foreground mb-3 px-1">
                    <span className={step >= 1 ? "text-brand-green" : ""}>01 SPEND</span>
                    <span className={step >= 2 ? "text-brand-green" : ""}>02 PERKS</span>
                    <span className={step >= 3 ? "text-brand-green" : ""}>03 PROFILE</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-brand-green"
                        initial={{ width: "33%" }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    />
                </div>
            </div>

            <div className="flex-grow relative px-4">
                <AnimatePresence mode="wait">

                    {/* STEP 1: SPEND */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            <div className="text-center md:text-left mb-8">
                                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">How much do you spend monthly?</h2>
                                <p className="text-muted-foreground text-lg">Adjust the sliders to build your unique spend profile.</p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 mb-8 sticky top-4 z-20 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-muted-foreground">Est. Total Monthly Spend</span>
                                    <span className="font-display text-3xl font-bold text-brand-green">{formatINR(totalMonthlySpend)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {CATEGORIES.map((cat) => (
                                    <div key={cat.id} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 font-medium text-sm text-foreground">
                                                <span className="text-muted-foreground">{cat.icon}</span>
                                                {cat.label}
                                            </label>
                                            <div className="relative relative w-24">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">₹</span>
                                                <Input
                                                    type="number"
                                                    value={profile.monthly[cat.id] || ""}
                                                    onChange={(e) => updateMonthlySpend(cat.id, Number(e.target.value) || 0)}
                                                    className="pl-7 h-9 text-right font-mono bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                                />
                                            </div>
                                        </div>
                                        <Slider
                                            value={[profile.monthly[cat.id]]}
                                            max={cat.max}
                                            step={500}
                                            onValueChange={(val) => updateMonthlySpend(cat.id, val[0])}
                                            className="[&_[role=slider]]:bg-brand-green [&_[role=slider]]:border-brand-green bg-neutral-200 dark:bg-neutral-800"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-8">
                                <Button size="lg" onClick={() => setStep(2)} className="bg-foreground text-background hover:bg-neutral-800 w-full md:w-auto h-12 px-8 text-base">
                                    Next: Card Preferences
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: PREFERENCES */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-10"
                        >
                            <div className="text-center md:text-left mb-8">
                                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">What kind of rewards do you prefer?</h2>
                                <p className="text-muted-foreground text-lg">We&apos;ll prioritize cards that match these reward types.</p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Reward Type</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: "ANY", label: "No Preference", desc: "Show me the absolute highest INR value" },
                                        { id: "CASHBACK", label: "Pure Cashback", desc: "Direct statement credit, no points" },
                                        { id: "POINTS", label: "Reward Points", desc: "Flexible redemptions for vouchers & goods" },
                                        { id: "MILES", label: "Travel Miles", desc: "Air miles and hotel loyalty transfers" }
                                    ].map((opt) => (
                                        <div
                                            key={opt.id}
                                            onClick={() => updatePreference("reward_type", opt.id)}
                                            className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${profile.preferences.reward_type === opt.id
                                                ? "border-brand-green bg-brand-green/5"
                                                : "border-border bg-card hover:border-neutral-300 dark:hover:border-neutral-700"
                                                }`}
                                        >
                                            <h4 className={`font-semibold mb-1 ${profile.preferences.reward_type === opt.id ? "text-brand-green" : "text-foreground"}`}>{opt.label}</h4>
                                            <p className="text-sm text-muted-foreground">{opt.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Annual Fee Willingness</h3>
                                <Select
                                    value={profile.preferences.max_annual_fee === null ? "null" : profile.preferences.max_annual_fee.toString()}
                                    onValueChange={(val) => updatePreference("max_annual_fee", val === "null" ? null : Number(val))}
                                >
                                    <SelectTrigger className="w-full text-lg h-14 bg-card">
                                        <SelectValue placeholder="Select fee preference" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">Show me all cards (Calculate Net Value)</SelectItem>
                                        <SelectItem value="0">Zero Fee Only (Lifetime Free)</SelectItem>
                                        <SelectItem value="1000">Up to ₹1,000 / year</SelectItem>
                                        <SelectItem value="3000">Up to ₹3,000 / year</SelectItem>
                                        <SelectItem value="10000">Up to ₹10,000 / year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-between pt-8">
                                <Button variant="ghost" size="lg" onClick={() => setStep(1)} className="text-muted-foreground h-12">
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button size="lg" onClick={() => setStep(3)} className="bg-foreground text-background hover:bg-neutral-800 h-12 px-8 text-base">
                                    Almost Done
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: ELIGIBILITY */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-10"
                        >
                            <div className="text-center md:text-left mb-8">
                                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">Just to check eligibility</h2>
                                <p className="text-muted-foreground text-lg">Some premium cards have minimum income requirements.</p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Monthly Net Income (Optional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: "LOW", label: "Below ₹50k" },
                                        { id: "MID", label: "₹50k - ₹1.5L" },
                                        { id: "HIGH", label: "Above ₹1.5L" }
                                    ].map((opt) => (
                                        <div
                                            key={opt.id}
                                            onClick={() => updatePreference("income_bracket", opt.id)}
                                            className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all ${profile.preferences.income_bracket === opt.id
                                                ? "border-brand-green bg-brand-green/5 text-brand-green font-semibold"
                                                : "border-border bg-card hover:border-neutral-300 dark:hover:border-neutral-700 text-muted-foreground"
                                                }`}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between pt-12">
                                <Button variant="ghost" size="lg" onClick={() => setStep(2)} className="text-muted-foreground h-12" disabled={isSubmitting}>
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-brand-green hover:bg-brand-green/90 text-neutral-950 font-semibold h-14 px-8 text-base shadow-lg shadow-brand-green/20"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                                            Calculating...
                                        </div>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 w-5 h-5" />
                                            Show My Savings
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
