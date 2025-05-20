
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Spline from '@splinetool/react-spline';

const HeroSection = () => {
  const [loading, setLoading] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const navigate = useNavigate();

  const handleStartTransfer = () => {
    setLoading(true);
    toast.loading("Preparing transfer tools...");
    
    // Navigate to dashboard after brief delay
    setTimeout(() => {
      setLoading(false);
      toast.success("Transfer tools ready!");
      navigate("/dashboard");
    }, 1000);
  };

  const handleSplineLoad = () => {
    setSplineLoaded(true);
  };

  // User avatar images for testimonial section
  const userAvatars = [
    "/lovable-uploads/d7df8f5a-8395-447b-838f-d7e59b2ca3ff.png",
    "/lovable-uploads/a03edee2-6568-436e-974d-3d544d149b85.png",
    "/lovable-uploads/6326653b-23d5-431a-a677-b7895e49945c.png",
    "/lovable-uploads/d2c10872-2782-4957-a633-8ffbf2e2900f.png",
  ];

  return (
    <section className="relative overflow-hidden bg-hero-gradient pt-20 md:pt-24 lg:pt-28 pb-16">
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
          
          <div className="md:col-span-6 w-full h-[500px] relative z-0">
            {!splineLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mb-4"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            )}
            
            <div className="w-full h-full overflow-hidden">
              <Spline
                scene="https://prod.spline.design/0-TNuSDDX8B7pLdU/scene.splinecode"
                className="w-full h-full"
                onLoad={handleSplineLoad}
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
