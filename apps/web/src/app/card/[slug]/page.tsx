import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plane, Coffee, ShoppingCart, Fuel } from "lucide-react";

export async function generateStaticParams() {
    const supabase = await createClient();
    const { data: cards } = await supabase.from('cards').select('slug').limit(50);

    if (!cards) return [];

    return cards.map((c: { slug: string }) => ({
        slug: c.slug,
    }));
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    travel_flights: <Plane className="w-5 h-5 text-brand-green" />,
    travel_hotels: <Plane className="w-5 h-5 text-brand-green" />,
    dining: <Coffee className="w-5 h-5 text-brand-green" />,
    groceries: <ShoppingCart className="w-5 h-5 text-brand-green" />,
    fuel: <Fuel className="w-5 h-5 text-brand-green" />
};

export default async function CardDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: card, error } = await supabase
        .from("cards")
        .select(`
      *,
      card_category_rules (*),
      card_milestones (*)
    `)
        .eq("slug", slug)
        .single();

    if (error || !card) {
        notFound();
    }

    // Formatting utils inline for MVP
    const fmtINR = (val: number) => `₹${val.toLocaleString("en-IN")}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": card.name,
        "brand": {
            "@type": "Brand",
            "name": card.bank_name
        },
        "description": `Maximize your ${card.reward_type} with the ${card.name} by ${card.bank_name}.`,
        "offers": {
            "@type": "Offer",
            "price": card.joining_fee,
            "priceCurrency": "INR"
        },
        "annualPercentageRate": 42 // placeholder standard Indian CC APR
    };

    return (
        <main className="min-h-screen bg-background pt-24 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto px-4 max-w-5xl">

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
                    <div className="w-full md:w-1/2 flex justify-center">
                        <div className="relative w-80 h-52 bg-gradient-to-br from-neutral-800 to-black rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform">
                            {card.image_url ? (
                                <Image src={card.image_url} alt={card.name} fill className="object-contain" />
                            ) : (
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    <span className="text-white/50 text-sm font-mono tracking-widest uppercase">{card.bank_name}</span>
                                    <span className="text-white font-medium text-xl mt-1">{card.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 text-center md:text-left">
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                            <Badge variant="outline" className="border-brand-green text-brand-green bg-brand-green/5 font-mono">{card.network}</Badge>
                            <Badge variant="secondary" className="font-mono uppercase">{card.card_tier}</Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">{card.name}</h1>
                        <p className="text-xl text-muted-foreground mb-8">Issued by {card.bank_name}</p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="bg-brand-green text-black hover:bg-brand-green/90 font-bold px-8 h-14 text-lg">
                                Apply Now <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

                    {/* Fees */}
                    <div className="bg-card border border-border rounded-xl p-8">
                        <h3 className="text-xl font-bold mb-6 font-display">Fees & Charges</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-border/50">
                                <span className="text-muted-foreground">Joining Fee</span>
                                <span className="font-mono font-medium text-lg">{fmtINR(card.joining_fee)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-border/50">
                                <span className="text-muted-foreground">Annual Fee</span>
                                <span className="font-mono font-medium text-lg">{fmtINR(card.annual_fee)}</span>
                            </div>
                            {card.fee_waiver_spend && (
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-muted-foreground">Fee Waiver</span>
                                    <span className="text-right">
                                        <Badge variant="outline" className="font-mono bg-brand-green/10 text-brand-green border-brand-green/30">
                                            spend {fmtINR(card.fee_waiver_spend)}
                                        </Badge>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Base Rewards */}
                    <div className="bg-card border border-border rounded-xl p-8">
                        <h3 className="text-xl font-bold mb-6 font-display">Reward Value</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-border/50">
                                <span className="text-muted-foreground">Reward Type</span>
                                <span className="font-medium">{card.reward_type}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-border/50">
                                <span className="text-muted-foreground">Base Earning Rate</span>
                                <span className="font-mono font-medium text-brand-green">
                                    {card.reward_type === 'CASHBACK'
                                        ? `${card.base_reward_rate * 100}%`
                                        : `${card.base_reward_rate.toFixed(3)} pts / ₹1`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-muted-foreground">Point Value</span>
                                <span className="font-mono font-medium">{fmtINR(card.point_value_inr)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accelerated Rewards */}
                {card.card_category_rules && card.card_category_rules.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-2xl font-bold mb-6 font-display px-2">Accelerated Categories</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {card.card_category_rules.map((rule: any) => (
                                <div key={rule.id} className="bg-card border border-border rounded-xl p-6 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
                                            {CATEGORY_ICONS[rule.category] || <Sparkles className="w-5 h-5 text-brand-green" />}
                                        </div>
                                        {rule.is_accelerated && (
                                            <Badge className="bg-brand-gold text-black hover:bg-brand-gold">Accelerated</Badge>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-lg capitalize mb-1">{rule.category.replace('_', ' ')}</h4>
                                    <p className="font-mono text-xl text-brand-green font-bold mb-4">
                                        {card.reward_type === 'CASHBACK' ? `${rule.reward_rate * 100}%` : `${rule.reward_rate.toFixed(3)} pts / ₹1`}
                                    </p>
                                    {rule.notes && <p className="text-sm text-muted-foreground mt-auto">{rule.notes}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Milestones */}
                {card.card_milestones && card.card_milestones.length > 0 && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6 font-display px-2">Milestone Benefits</h3>
                        <div className="space-y-4">
                            {card.card_milestones.map((ms: any) => (
                                <div key={ms.id} className="bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <Badge variant="outline" className="mb-2 font-mono uppercase text-xs">{ms.threshold_period}</Badge>
                                        <h4 className="font-bold text-lg">Spend {fmtINR(ms.spend_threshold)}</h4>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="font-medium text-foreground">
                                            {ms.milestone_type === 'FEE_WAIVER' && `Waive ${fmtINR(ms.fee_waived_amount)} fee`}
                                            {ms.milestone_type === 'BONUS_POINTS' && `${ms.benefit_points} Bonus Points`}
                                            {ms.milestone_type === 'BONUS_VOUCHER' && `₹${ms.benefit_inr_value} Voucher`}
                                        </p>
                                        {ms.description && <p className="text-sm text-muted-foreground mt-1">{ms.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

function Sparkles(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
}
