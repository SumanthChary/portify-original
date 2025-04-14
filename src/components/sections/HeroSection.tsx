
import { ArrowRight, ExternalLink } from "lucide-react";
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
              {/* MacBook Design */}
              <div className="macbook-container">
                {/* MacBook Body */}
                <div className="macbook-body bg-gray-100 rounded-t-xl border-t border-l border-r border-gray-300 p-3">
                  {/* Screen */}
                  <div className="macbook-screen bg-white rounded-lg overflow-hidden shadow-inner border border-gray-200">
                    {/* Screen Content */}
                    <div className="h-[350px] relative overflow-hidden">
                      {/* Mac Status Bar */}
                      <div className="h-6 w-full bg-gray-800 flex items-center justify-between px-4">
                        <div className="flex space-x-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-white text-xs">Portify</div>
                        <div className="text-white text-xs">9:41 AM</div>
                      </div>
                      
                      {/* Dashboard Content */}
                      <div className="px-5 py-6">
                        <div className="text-lg font-semibold mb-3">Product Migration Dashboard</div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-sm font-medium mb-1">Gumroad</div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                              <span className="text-xs text-gray-600">Connected</span>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-sm font-medium mb-1">Payhip</div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                              <span className="text-xs text-gray-600">Not connected</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium">Migration Progress</div>
                            <div className="text-xs text-gray-600">6/12 Products</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-coral h-2 rounded-full w-1/2"></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Live connection to Gumroad API
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* MacBook Bottom */}
                <div className="macbook-bottom bg-gray-100 h-3 rounded-b-xl mx-auto w-[90%] border-b border-l border-r border-gray-300 shadow-lg"></div>
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
