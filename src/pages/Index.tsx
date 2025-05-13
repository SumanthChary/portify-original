
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import UseCasesSection from "@/components/sections/UseCasesSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import SecuritySection from "@/components/sections/SecuritySection";
import CtaSection from "@/components/sections/CtaSection";
import IntegrationsSection from "@/components/sections/IntegrationsSection";
import FaqSection from "@/components/sections/FaqSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <UseCasesSection />
        <FeaturesSection />
        <IntegrationsSection />
        <TestimonialsSection />
        <PricingSection />
        <SecuritySection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
