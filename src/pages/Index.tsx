
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import UseCasesSection from "@/components/sections/UseCasesSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import SecuritySection from "@/components/sections/SecuritySection";
import CtaSection from "@/components/sections/CtaSection";
import IntegrationsSection from "@/components/sections/IntegrationsSection";
import FaqSection from "@/components/sections/FaqSection";
import AcquisitionSection from "@/components/sections/AcquisitionSection";

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add animation after component mount
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Header />
      <main className={`flex-grow transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <HeroSection />
        <AcquisitionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <UseCasesSection />
        <TestimonialsSection />
        <IntegrationsSection />
        <SecuritySection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
