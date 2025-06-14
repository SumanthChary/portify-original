
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ProblemAgitationSection from "@/components/sections/ProblemAgitationSection";
import SolutionDemoSection from "@/components/sections/SolutionDemoSection";
import BenefitsSection from "@/components/sections/BenefitsSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import UseCasesSection from "@/components/sections/UseCasesSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import SecuritySection from "@/components/sections/SecuritySection";
import CtaSection from "@/components/sections/CtaSection";
import IntegrationsSection from "@/components/sections/IntegrationsSection";
import FaqSection from "@/components/sections/FaqSection";
import VideoSection from "@/components/sections/VideoSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <ProblemAgitationSection />
        <SolutionDemoSection />
        <BenefitsSection />
        <VideoSection />
        <HowItWorksSection />
        <UseCasesSection />
        <FeaturesSection />
        <IntegrationsSection />
        <TestimonialsSection />
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
