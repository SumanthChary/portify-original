
import { ArrowRight, CheckCircle, Clock, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const HeroSection = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartTransfer = () => {
    setLoading(true);
    toast.loading("Preparing migration tools...");
    
    // Navigate to dashboard after brief delay
    setTimeout(() => {
      setLoading(false);
      toast.success("Migration tools ready!");
      navigate("/enhanced-dashboard");
    }, 1000);
  };

  // User avatar images for testimonial section
  const userAvatars = [
    "/lovable-uploads/47de44e2-5e07-475f-a2a7-adc9fee9da7e.png", // Female profile
    "/lovable-uploads/5ef5a80f-ba3a-4e6a-8bc8-1a86f5f99158.png", // Male profile
    "/lovable-uploads/a61275c0-a5e2-4725-a712-fdd02a47a21d.png", // Male profile
    "/lovable-uploads/e196a544-4dee-4f89-9062-a5538c60cd62.png", // Male profile
  ];

  return (
    <section className="relative overflow-hidden bg-hero-gradient pt-20 md:pt-24 lg:pt-28 pb-16">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 space-y-8 animate-fadeIn z-10">
            <div className="flex">
              <span className="tag-badge">AI-Powered Migration</span>
            </div>
            
            {/* Social Proof Line */}
            <div className="flex items-center space-x-2 text-sm text-coolGray">
              <CheckCircle className="w-4 h-4 text-lushGreen" />
              <span className="font-medium">2,847 products successfully migrated this week</span>
            </div>
            
            <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
              Migrate <span className="text-coral">500+ Products</span> from Gumroad to Payhip <span className="text-coral">Without Spending 100+ Hours</span>
            </h1>
            
            <p className="text-lg md:text-xl text-coolGray leading-relaxed">
              Don't waste weeks manually re-creating every product title, description, image, and file. Our AI copies everything automatically - saving you 100+ hours of tedious work.
            </p>
            
            {/* Value Prop Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-lushGreen/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-lushGreen" />
                </div>
                <div>
                  <p className="font-semibold text-darktext">All Data Transferred</p>
                  <p className="text-sm text-coolGray">Automatically</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-coral" />
                </div>
                <div>
                  <p className="font-semibold text-darktext">Zero Data Loss</p>
                  <p className="text-sm text-coolGray">Guarantee</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <p className="font-semibold text-darktext">Complete in</p>
                  <p className="text-sm text-coolGray">Under 10 Minutes</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-5 pt-3">
              <Button 
                size="lg" 
                className="bg-cta-gradient hover:opacity-90 font-medium text-base px-8 py-6"
                onClick={handleStartTransfer}
                disabled={loading}
              >
                {loading ? "Starting Migration..." : "Migrate My Products Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-coral text-coral hover:bg-coral hover:text-white text-base px-8 py-6"
              >
                Watch 5-Minute Demo
              </Button>
            </div>
            
            <div className="flex items-center pt-4">
              <div className="flex -space-x-3">
                {userAvatars.map((avatar, i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                    style={{ zIndex: 4 - i }}
                  >
                    <img 
                      src={avatar}
                      alt={`User avatar ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=User${i + 1}&background=random`;
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="ml-4 text-sm text-coolGray">
                <span className="font-semibold">Trusted by 500+ creators</span> who saved 100+ hours each
              </p>
            </div>
          </div>
          
          <div className="md:col-span-6 w-full h-[600px] relative z-0 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto relative">
              {/* Enhanced Visual with Migration Stats */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-100">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-lushGreen rounded-full animate-pulse"></div>
                  <span className="font-medium text-darktext">347 products → Payhip ✅</span>
                </div>
              </div>
              
              <img 
                src="/lovable-uploads/869df871-0215-476c-83a7-3e038e4ab284.png"
                alt="Mobile app showing automated product migration from Gumroad to Payhip"
                className="w-full h-auto object-contain animate-float"
              />
              
              {/* Migration Timer Overlay */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-100">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-coral" />
                  <span className="font-medium text-darktext">Migration time: 4 minutes 23 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-offwhite to-transparent"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-10 w-64 h-64 bg-mint/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-10 w-72 h-72 bg-coral/5 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection;
