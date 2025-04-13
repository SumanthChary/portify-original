
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import gumroadService from "@/services/GumroadService";

const CtaSection = () => {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    
    // In a real implementation, you would authenticate with Gumroad here
    // For demo purposes, we're just setting a fake API key
    setTimeout(() => {
      gumroadService.setApiKey("demo_api_key");
      setConnecting(false);
      console.log("Gumroad connected in CTA section");
    }, 1500);
  };

  return (
    <section className="py-16 sm:py-20 bg-darktext text-white">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Migrating Your <span className="text-coral">Products Today</span>
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join hundreds of creators who've simplified their digital product migrations.
          </p>
          <Button 
            size="lg" 
            className="bg-cta-gradient hover:opacity-90 font-medium"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? "Connecting..." : "Connect with Gumroad"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-6 text-gray-400">
            No credit card required. Start with our free plan today.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
