
import { useState, useEffect, Suspense } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Spline from '@splinetool/react-spline';

const HeroSection = () => {
  const [loading, setLoading] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
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

  const toggleVideo = () => {
    setShowVideo(!showVideo);
  };

  // User avatar images for testimonial section
  const userAvatars = [
    "/lovable-uploads/d7df8f5a-8395-447b-838f-d7e59b2ca3ff.png",
    "/lovable-uploads/a03edee2-6568-436e-974d-3d544d149b85.png",
    "/lovable-uploads/6326653b-23d5-431a-a677-b7895e49945c.png",
    "/lovable-uploads/d2c10872-2782-4957-a633-8ffbf2e2900f.png",
  ];

  // Stats to display
  const stats = [
    { value: "99%", label: "Complete" },
    { value: "1-4", label: "Weeks to Sale" },
    { value: "5+", label: "Revenue Channels" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-offwhite to-mint/5 pt-16 md:pt-24 lg:pt-32 pb-12">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-40 left-10 w-64 h-64 rounded-full bg-coral/10 blur-3xl opacity-30"></div>
        <div className="absolute bottom-40 right-10 w-80 h-80 rounded-full bg-mint/20 blur-3xl opacity-30"></div>
      </div>
      
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 lg:col-span-5 space-y-6 animate-fadeIn">
            <div className="flex">
              <span className="tag-badge">Acquisition-Ready SaaS</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-gradient-primary">Ready-to-Scale</span> Digital Product <span className="text-coral">Migration Platform</span>
            </h1>
            
            <p className="text-lg text-coolGray">
              A 99% complete SaaS solution for seamless product transfer between platforms like Gumroad, Payhip, and more with advanced AI capabilities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                size="lg" 
                className="bg-cta-gradient text-white hover:opacity-90 font-medium group"
                onClick={handleStartTransfer}
                disabled={loading}
              >
                {loading ? "Connecting..." : "Explore Platform"}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-coral text-coral hover:bg-coral hover:text-white"
                onClick={toggleVideo}
              >
                {showVideo ? "Hide Demo" : "Watch Demo"}
              </Button>
            </div>
            
            <div className="flex items-center gap-6 pt-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-coral">{stat.value}</div>
                  <div className="text-xs text-coolGray mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center pt-4">
              <div className="flex -space-x-2">
                {userAvatars.map((avatar, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
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
                <span className="font-medium">Acquisition opportunity</span> for strategic buyers
              </p>
            </div>
          </div>
          
          <div className="md:col-span-6 lg:col-span-7 animate-slideUp relative" style={{ animationDelay: "0.3s" }}>
            {showVideo ? (
              <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                <div className="aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">Demo Video Placeholder</p>
                  </div>
                </div>
                <button 
                  className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white"
                  onClick={toggleVideo}
                >
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="w-full h-[480px] rounded-xl overflow-hidden shadow-2xl border border-gray-200">
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
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-8 py-3 rounded-full shadow-lg border border-gray-100 text-sm font-medium text-coral">
                  Interactive 3D Demo • Click and Drag to Explore
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default HeroSection;
