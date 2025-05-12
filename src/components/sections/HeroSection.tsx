
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, Suspense } from "react";
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-offwhite to-mint/5 pt-16 md:pt-20 lg:pt-28">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 lg:col-span-5 space-y-6 animate-fadeIn">
            <div className="flex">
              <span className="tag-badge">AI-Powered Migration</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Move Your Digital Products <span className="text-coral">Anywhere, Instantly.</span>
            </h1>
            
            <p className="text-lg text-coolGray">
              Easily transfer products between platforms like Gumroad, Payhip, and more with AI. No code, no hassle, no data loss.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                size="lg" 
                className="bg-cta-gradient text-white hover:opacity-90 font-medium"
                onClick={handleStartTransfer}
                disabled={loading}
              >
                {loading ? "Connecting..." : "Start Transfer"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral hover:text-white">
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                ))}
              </div>
              <p className="ml-4 text-sm text-coolGray">
                <span className="font-medium">Used by 100+ creators</span> to migrate their digital products
              </p>
            </div>
          </div>
          
          <div className="md:col-span-6 lg:col-span-7 animate-slideUp" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-xl border border-gray-200">
                {/* Fallback while Spline loads */}
                {!splineLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="animate-pulse text-gray-400">Loading 3D model...</div>
                  </div>
                )}
                
                <Suspense fallback={<div className="w-full h-full bg-white flex items-center justify-center">Loading...</div>}>
                  <Spline
                    scene="https://prod.spline.design/09-kWqGz5641trLg/scene.splinecode"
                    className="bg-white w-full h-full"
                    onLoad={handleSplineLoad}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-offwhite to-transparent"></div>
    </section>
  );
};

export default HeroSection;
