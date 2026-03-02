import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t py-12" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                    {/* Brand */}
                    <div className="max-w-xs">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded bg-brand-green flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-black" />
                            </div>
                            <span className="font-display font-bold text-white">CardSavvy</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            India's smartest credit card recommendation engine. Free, no login, no spam.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex gap-12 text-sm">
                        <div>
                            <p className="text-white font-medium mb-3">Product</p>
                            <div className="space-y-2">
                                <Link href="/find-my-card" className="block text-muted-foreground hover:text-white transition-colors text-sm">Find My Card</Link>
                                <Link href="/#featured" className="block text-muted-foreground hover:text-white transition-colors text-sm">Top Cards</Link>
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-medium mb-3">Legal</p>
                            <div className="space-y-2">
                                <span className="block text-muted-foreground text-sm text-xs">Not financial advice</span>
                                <span className="block text-muted-foreground text-sm text-xs">Affiliate disclaimer</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="text-xs text-muted-foreground">© 2025 CardSavvy. All rights reserved.</p>
                    <p className="text-xs text-muted-foreground max-w-md text-center">
                        <strong className="text-white/50">Disclaimer:</strong> Information provided is for educational purposes only and does not constitute financial advice. Card data sourced from public issuer websites. Apply links may include affiliate commissions.
                    </p>
                </div>
            </div>
        </footer>
    );
}
