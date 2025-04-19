
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";

const CtaSection = () => {
  const { user } = useAuth();

  return (
    <section className="py-16 sm:py-20 bg-darktext text-white">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Migrating Your <span className="text-coral">Products Today</span>
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join hundreds of creators who've simplified their digital product migrations.
          </p>
          {user ? (
            <Link to="/dashboard">
              <Button 
                size="lg" 
                className="bg-cta-gradient hover:opacity-90 font-medium"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-cta-gradient hover:opacity-90 font-medium"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
          <p className="mt-6 text-gray-400">
            No credit card required. Start with our free plan today.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
