
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const userAvatars = [
  "/lovable-uploads/47de44e2-5e07-475f-a2a7-adc9fee9da7e.png",
  "/lovable-uploads/5ef5a80f-ba3a-4e6a-8bc8-1a86f5f99158.png",
  "/lovable-uploads/a61275c0-a5e2-4725-a712-fdd02a47a21d.png",
  "/lovable-uploads/e196a544-4dee-4f89-9062-a5538c60cd62.png",
];

const HeroSection = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartTransfer = () => {
    setLoading(true);
    toast.loading("Preparing your migration dashboard...");
    setTimeout(() => {
      setLoading(false);
      toast.success("Let's go! 🚀");
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <section className="relative bg-hero-gradient pb-12 pt-5 sm:pt-8 md:pt-10 lg:pt-14 overflow-hidden">
      {/* FEATURED BY trust bar (optional SaaS touch, can be commented if unwanted) */}
      <div className="w-full flex justify-center py-2 mb-2">
        <span className="rounded-full bg-white/90 border border-gray-100 px-4 py-1 text-xs sm:text-sm text-coolGray shadow-sm font-semibold">
          ✅ 2,847 products migrated this week
        </span>
      </div>
      <div className="section-container pt-2 sm:pt-6">
        <div className="flex flex-col md:flex-row-reverse items-center md:items-stretch gap-8">
          {/* HERO IMAGE */}
          <div className="w-full md:w-1/2 max-w-xl mx-auto md:mx-0 flex items-end justify-center relative">
            {/* 
              Responsive image/shadow/visual:  
              On mobile: smaller, below headline.  
              On desktop: floats right, bigger. 
            */}
            <div className="relative w-full">
              <img
                src="/lovable-uploads/869df871-0215-476c-83a7-3e038e4ab284.png"
                alt="Migration to Payhip"
                className="shadow-soft rounded-3xl border border-gray-100 bg-white/60 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto object-contain animate-float"
                style={{ minHeight: 220 }}
                loading="eager"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 border border-gray-100 shadow px-5 py-2 rounded-2xl flex items-center gap-2 max-w-[85%]">
                <img src="https://cdn-icons-png.flaticon.com/512/3178/3178283.png" alt="Gumroad" className="w-5 h-5" />
                <span className="text-xs sm:text-sm font-semibold text-coral">347 products</span>
                <span className="mx-1 text-gray-400 text-base">→</span>
                <img src="https://cdn-icons-png.flaticon.com/512/3437/3437362.png" alt="Payhip" className="w-5 h-5" />
                <span className="ml-1 text-lushGreen text-xs font-medium">Payhip</span>
                {/* Visual tick */}
                <span className="ml-2 text-lushGreen font-bold text-base">✔️</span>
                <span className="ml-2 text-xs text-gray-400">4 min 23 sec</span>
              </div>
            </div>
          </div>

          {/* TEXT SECTION */}
          <div className="flex-1 flex flex-col justify-center md:justify-start gap-8 md:gap-10">
            {/* VALUE BADGE/AI angle */}
            <span className="tag-badge self-start mb-1">AI-Powered Migration</span>
            {/* HEADLINE */}
            <h1 className="font-bold text-[2.1rem] sm:text-4xl md:text-[2.6rem] lg:text-5xl leading-[1.15] max-w-2xl">
              <span className="block">Migrate Your Entire Gumroad Store</span>
              <span className="block text-coral">
                To Payhip In Under 5 Minutes
              </span>
            </h1>
            {/* SUBHEAD */}
            <p className="text-base sm:text-lg md:text-xl text-coolGray leading-relaxed max-w-xl">
              Don&apos;t waste weeks manually re-creating every product title, description, image, and file.<br className="hidden sm:inline" />
              Our AI copies everything automatically—
              <span className="font-medium text-coral">saving you 100+ hours</span> of tedious work.
            </p>
            {/* BULLETS row */}
            <ul className="space-y-2 max-w-xl">
              <li className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-lushGreen font-bold text-lg">⚡</span>
                <span>All product data transferred <b>automatically</b></span>
              </li>
              <li className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-coral font-bold text-lg">🔒</span>
                <span><b>Zero data loss</b> guarantee</span>
              </li>
              <li className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-mint font-bold text-lg">⏱️</span>
                <span>Complete in <b>under 10 minutes</b></span>
              </li>
            </ul>
            {/* SOCIAL PROOF + CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 mt-2">
              {/* USERS' AVATARS with label (on mobile: row below CTAs, on desktop: left of CTAs) */}
              <div className="flex gap-2 items-center">
                <div className="flex -space-x-2">
                  {userAvatars.map((a, i) => (
                    <img
                      key={i}
                      src={a}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover shadow"
                      alt={`User ${i + 1}`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-coolGray ml-2 font-medium">
                  Trusted by <b>100+ creators</b>
                </span>
              </div>
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-cta-gradient hover:opacity-90 font-bold text-base px-8 py-4 w-full sm:w-auto shadow-xl"
                  onClick={handleStartTransfer}
                  disabled={loading}
                >
                  {loading ? "Connecting..." : "Start My 5-Minute Migration"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-coral text-coral hover:bg-coral hover:text-white text-base px-8 py-4 w-full sm:w-auto"
                  onClick={() => window.scrollBy({ top: 700, left: 0, behavior: 'smooth' })}
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            {/* QUICK TRUST MESSAGE on mobile/desktop */}
            <div className="mt-4 block sm:hidden">
              <span className="text-xs text-coolGray">
                <b>2,847 products</b> migrated this week · 
                <b> Zero headaches.</b>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Decorative gradients */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-offwhite to-transparent"></div>
      <div className="absolute top-1/4 right-6 w-40 h-40 bg-mint/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-6 w-44 h-44 bg-coral/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection;

