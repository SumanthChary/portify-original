
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import gumroadService from "@/services/GumroadService";

const CtaSection = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check if already connected
    const isConnected = gumroadService.isAuthenticated();
    setConnected(isConnected);
    
    // Check if this is a redirect from OAuth flow
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      setConnecting(true);
      toast.loading("Connecting to Gumroad...");
      
      gumroadService.handleAuthCallback(code).then((success) => {
        setConnected(success);
        setConnecting(false);
        
        if (success) {
          toast.success("Successfully connected to Gumroad!");
        } else {
          toast.error("Failed to connect to Gumroad. Please try again.");
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, []);

  const handleConnect = () => {
    setConnecting(true);
    
    // Start the OAuth flow
    try {
      gumroadService.startOAuthFlow();
    } catch (error) {
      console.error("Failed to start OAuth flow", error);
      setConnecting(false);
      toast.error("Failed to connect to Gumroad. Please try again.");
    }
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
            disabled={connecting || connected}
          >
            {connecting ? "Connecting..." : connected ? "Connected to Gumroad" : "Connect with Gumroad"}
            {!connected && <ArrowRight className="ml-2 h-5 w-5" />}
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
