
import { ArrowRight, Database, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const HeroSection = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartDemo = () => {
    setLoading(true);
    toast.loading("Preparing demo portal...");
    
    setTimeout(() => {
      setLoading(false);
      toast.success("Demo portal ready!");
      navigate("/enhanced-dashboard");
    }, 1000);
  };

  const handleBookDemo = () => {
    toast.success("Demo booking feature coming soon!");
  };

  // Trust indicators
  const trustSignals = [
    { icon: Shield, text: "GDPR Compliant" },
    { icon: Database, text: "Bank-Level Security" },
    { icon: Shield, text: "99.9% Uptime" }
  ];

  // Customer avatars for social proof
  const userAvatars = [
    "/lovable-uploads/47de44e2-5e07-475f-a2a7-adc9fee9da7e.png",
    "/lovable-uploads/5ef5a80f-ba3a-4e6a-8bc8-1a86f5f99158.png",
    "/lovable-uploads/a61275c0-a5e2-4725-a712-fdd02a47a21d.png",
    "/lovable-uploads/e196a544-4dee-4f89-9062-a5538c60cd62.png",
  ];

  return (
    <section className="relative overflow-hidden bg-hero-gradient pt-20 md:pt-24 lg:pt-32 pb-20">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 animate-fadeIn">
            {/* Problem-focused tag */}
            <div className="flex">
              <span className="tag-badge">Stop Manual Data Sharing</span>
            </div>
            
            {/* Conversion-optimized headline */}
            <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight">
              Stop Emailing Customer Data. 
              <span className="text-coral block mt-2">Create Secure Portals Instead.</span>
            </h1>
            
            {/* Clear value proposition */}
            <p className="text-xl md:text-2xl text-coolGray leading-relaxed max-w-2xl">
              Connect your database and instantly create beautiful, secure customer portals. 
              <span className="font-semibold text-darktext">Each customer sees only their data. No coding required.</span>
            </p>
            
            {/* Immediate value demonstration */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-darktext">See how it works:</h3>
              <div className="flex items-center text-sm text-coolGray space-x-2">
                <span className="bg-coral/10 text-coral px-3 py-1 rounded-full font-medium">Connect Database</span>
                <ArrowRight className="h-4 w-4" />
                <span className="bg-mint/20 text-mint px-3 py-1 rounded-full font-medium">Beautiful Portal</span>
                <ArrowRight className="h-4 w-4" />
                <span className="bg-lushGreen/10 text-lushGreen px-3 py-1 rounded-full font-medium">Happy Customers</span>
              </div>
            </div>
            
            {/* CTA buttons with clear hierarchy */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-cta-gradient hover:opacity-90 font-semibold text-lg px-10 py-7 text-white shadow-xl"
                onClick={handleStartDemo}
                disabled={loading}
              >
                {loading ? "Starting Demo..." : "Try Live Demo"}
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-coral text-coral hover:bg-coral hover:text-white text-lg px-10 py-7 font-semibold"
                onClick={handleBookDemo}
              >
                Book Demo Call
              </Button>
            </div>
            
            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-6 pt-6">
              {trustSignals.map((signal, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <signal.icon className="h-5 w-5 text-coral" />
                  <span className="text-sm font-medium text-coolGray">{signal.text}</span>
                </div>
              ))}
            </div>
            
            {/* Social proof */}
            <div className="flex items-center pt-4">
              <div className="flex -space-x-3">
                {userAvatars.map((avatar, i) => (
                  <div 
                    key={i} 
                    className="w-12 h-12 rounded-full border-3 border-white overflow-hidden shadow-lg"
                    style={{ zIndex: 4 - i }}
                  >
                    <img 
                      src={avatar}
                      alt={`Customer avatar ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=User${i + 1}&background=random`;
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="ml-6">
                <p className="text-lg font-semibold text-darktext">
                  Trusted by 500+ companies
                </p>
                <p className="text-sm text-coolGray">
                  to secure customer data access
                </p>
              </div>
            </div>
          </div>
          
          {/* Hero visual - transformation demonstration */}
          <div className="lg:col-span-5 w-full h-[700px] relative z-0 flex items-center justify-center">
            <div className="w-full max-w-lg mx-auto">
              {/* Transformation visual */}
              <div className="space-y-8">
                {/* Before: Messy database */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-red-700 mb-2">Before: Manual Data Sharing</h4>
                  <div className="text-xs text-red-600 space-y-1">
                    <div>📧 Constant email requests</div>
                    <div>⏰ 10+ hours/week wasted</div>
                    <div>🔓 Insecure attachments</div>
                    <div>😤 Frustrated customers</div>
                  </div>
                </div>
                
                {/* Arrow with time */}
                <div className="text-center">
                  <ArrowRight className="h-8 w-8 text-coral mx-auto mb-2" />
                  <span className="text-coral font-semibold">5 minutes later</span>
                </div>
                
                {/* After: Beautiful portal */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-green-700 mb-2">After: Secure Customer Portal</h4>
                  <div className="text-xs text-green-600 space-y-1">
                    <div>✅ 24/7 self-service access</div>
                    <div>🔒 Bank-level security</div>
                    <div>😊 Happy customers</div>
                    <div>📈 60% fewer support tickets</div>
                  </div>
                </div>
              </div>
              
              {/* Main hero image */}
              <div className="mt-8">
                <img 
                  src="/lovable-uploads/869df871-0215-476c-83a7-3e038e4ab284.png"
                  alt="Customer portal transformation demo"
                  className="w-full h-auto object-contain animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-offwhite to-transparent"></div>
      <div className="absolute top-1/4 right-10 w-80 h-80 bg-mint/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-coral/5 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection;
