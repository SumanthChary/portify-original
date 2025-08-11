
import { ArrowRight } from "lucide-react";
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
    
    // Navigate to extraction page after brief delay
    setTimeout(() => {
      setLoading(false);
      toast.success("Migration tools ready!");
      navigate("/extract");
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
    <section className="relative overflow-hidden bg-hero-gradient pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-16">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 space-y-8 animate-fadeIn z-10">
            <div className="flex">
              <span className="tag-badge">AI-Powered Migration</span>
            </div>
            
            <h1 className="font-bold">
              Move Your Digital Products <span className="text-coral">Anywhere, Instantly.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-coolGray leading-relaxed">
              Easily transfer products between platforms like Gumroad, Payhip, and more with AI. No code, no hassle, no data loss.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 pt-3">
              <Button 
                size="lg" 
                className="bg-cta-gradient hover:opacity-90 font-medium text-base px-8 py-6"
                onClick={handleStartTransfer}
                disabled={loading}
              >
                {loading ? "Connecting..." : "Start Transfer"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-coral text-coral hover:bg-coral hover:text-white text-base px-8 py-6"
              >
                Watch Demo
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
                <span className="font-semibold">Trusted by 100+ creators</span> to migrate their digital products
              </p>
            </div>
          </div>
          
          <div className="md:col-span-6 w-full h-[600px] relative z-0 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto">
              <img 
                src="/lovable-uploads/869df871-0215-476c-83a7-3e038e4ab284.png"
                alt="Mobile app showing product migration from Gumroad to Payhip"
                className="w-full h-auto object-contain animate-float"
              />
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
