
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
    toast.loading("Preparing transfer tools...");
    
    // Navigate to dashboard after brief delay
    setTimeout(() => {
      setLoading(false);
      toast.success("Transfer tools ready!");
      navigate("/dashboard");
    }, 1000);
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
          <div className="md:col-span-7 space-y-8 animate-fadeIn z-10">
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
          </div>
          
          <div className="md:col-span-12 lg:absolute lg:right-0 lg:w-3/4 h-[500px] md:h-[550px] relative z-0">
            <div className="w-full h-full overflow-hidden rounded-2xl shadow-card">
              <iframe 
                src='https://my.spline.design/100followers-31R86Kqyer3Oj4ZYtF1wxRQ5/' 
                frameBorder='0' 
                width='100%' 
                height='100%'
                title="Spline 3D Design"
                className="rounded-2xl"
              ></iframe>
            </div>
            
            {/* Transparent overlay for text and CTA on the 3D model */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-offwhite/90 via-offwhite/70 to-transparent lg:w-2/3 p-8 rounded-l-2xl">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Seamless <span className="text-coral">Product Migration</span>
                </h2>
                <p className="text-lg mb-6">Transform how you manage digital products with our AI-powered platform</p>
                <Button 
                  className="bg-cta-gradient hover:opacity-90"
                  onClick={handleStartTransfer}
                >
                  Get Started Now
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enlarged testimonial section */}
        <div className="mt-12 md:mt-8 lg:mt-4">
          <div className="flex items-center pt-4">
            <div className="flex -space-x-3">
              {userAvatars.map((avatar, i) => (
                <div 
                  key={i} 
                  className="w-12 h-12 rounded-full border-2 border-white overflow-hidden"
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
            <p className="ml-4 text-md md:text-lg font-medium text-coolGray">
              <span className="font-bold">Trusted by 100+ creators</span> to migrate their digital products
            </p>
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
