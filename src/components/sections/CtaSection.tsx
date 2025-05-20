
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";

const CtaSection = () => {
  const { user } = useAuth();

  return (
    <section className="py-20 sm:py-24 bg-darktext text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-coral via-mint to-lushGreen"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-coral/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-mint/10 rounded-full blur-3xl"></div>
      
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
            Start Migrating Your <span className="text-coral">Products Today</span>
          </h2>
          <p className="text-xl mb-10 text-gray-300 leading-relaxed">
            Join hundreds of creators who've simplified their digital product migrations with our seamless platform.
          </p>
          {user ? (
            <Link to="/dashboard">
              <Button 
                size="lg" 
                className="bg-cta-gradient hover:opacity-90 font-medium px-8 py-6 text-base shadow-lg"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-cta-gradient hover:opacity-90 font-medium px-8 py-6 text-base shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
          <p className="mt-8 text-gray-400">
            No credit card required. Start with our free plan today.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
