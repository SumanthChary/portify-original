
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
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
              <Button size="lg" className="bg-cta-gradient text-white hover:opacity-90 font-medium">
                Start Transfer
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
              <div className="w-full h-[300px] sm:h-[400px] md:h-[450px] bg-white rounded-lg shadow-xl p-4 border border-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-2xl font-semibold">Product Migration Dashboard</p>
                  <p className="text-sm mt-2">Visualization of the app interface</p>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-coral text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg">
                Powered by OpenAI
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
