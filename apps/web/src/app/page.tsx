import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedCards } from "@/components/landing/FeaturedCards";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Nav bar adds 64px, push content below it */}
      <div className="pt-16">
        <HeroSection />
        <HowItWorks />
        <FeaturedCards />
        <Footer />
      </div>
    </div>
  );
}
