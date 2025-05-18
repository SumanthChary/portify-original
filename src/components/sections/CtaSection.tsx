
import { ArrowRight, DollarSign, Clock, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const CtaSection = () => {
  const { user } = useAuth();

  const benefits = [
    {
      icon: DollarSign,
      title: "Fast ROI",
      description: "Immediate revenue potential with existing integrations"
    },
    {
      icon: Clock,
      title: "Quick Launch",
      description: "Deploy to market in days, not months"
    },
    {
      icon: ThumbsUp,
      title: "Tested & Ready",
      description: "Fully functional and thoroughly tested platform"
    }
  ];

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-darktext to-darktext/90 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-40 left-1/4 w-64 h-64 rounded-full bg-coral/10 blur-3xl opacity-10"></div>
        <div className="absolute bottom-40 right-10 w-80 h-80 rounded-full bg-mint/20 blur-3xl opacity-10"></div>
      </div>

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-coral/20 text-coral rounded-full text-sm font-medium mb-4">Limited Time Opportunity</span>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Acquire a <span className="text-coral">Ready-to-Launch</span> SaaS Platform
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Skip months of development and jump straight to market with this acquisition-ready digital product migration platform.
            </motion.p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 2) }}
                  viewport={{ once: true }}
                >
                  <div className="bg-coral/20 text-coral rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">{benefit.title}</h3>
                  <p className="text-gray-300 text-center text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-cta-gradient hover:opacity-90 font-medium group rounded-full px-8 py-6 text-lg h-auto"
                >
                  Request Acquisition Details
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              {user ? (
                <Link to="/dashboard">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10 rounded-full px-8 py-6 text-lg h-auto"
                  >
                    Explore Platform
                  </Button>
                </Link>
              ) : (
                <Link to="/products">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10 rounded-full px-8 py-6 text-lg h-auto"
                  >
                    View Product Demo
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
          
          <div className="text-center mt-12 pt-8 border-t border-white/10">
            <p className="text-gray-400">
              Serious inquiries only • NDA required • Acquisition price available upon request
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
