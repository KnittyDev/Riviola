import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { MarqueeSection } from "@/components/MarqueeSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { PricingSection } from "@/components/PricingSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AnimateOnScroll className="w-full">
          <MarqueeSection />
        </AnimateOnScroll>
        <AnimateOnScroll className="w-full">
          <FeaturesSection />
        </AnimateOnScroll>
        <AnimateOnScroll className="w-full">
          <PricingSection />
        </AnimateOnScroll>
        <AnimateOnScroll className="w-full">
          <CTASection />
        </AnimateOnScroll>
      </main>
      <Footer />
    </>
  );
}
