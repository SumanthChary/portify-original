
import { useState } from "react";
import { ArrowRight, CheckCircle, Zap, BarChart4, Code, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const AcquisitionSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const acquisitionPoints = [
    {
      title: "Ready for Market",
      description: "99% complete SaaS product with clean codebase and comprehensive documentation",
      icon: CheckCircle
    },
    {
      title: "Modern Tech Stack",
      description: "Built with React, TypeScript, Tailwind CSS and Supabase for scalable performance",
      icon: Code
    },
    {
      title: "Revenue Ready",
      description: "Integrated payment system and subscription management ready to generate revenue",
      icon: DollarSign
    },
    {
      title: "Growth Potential",
      description: "Positioned in a growing market with significant expansion opportunities",
      icon: BarChart4
    },
    {
      title: "Quick Implementation",
      description: "Deploy immediately with minimal configuration and technical debt",
      icon: Zap
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-offwhite to-mint/5">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="tag-badge mb-3">Acquisition Opportunity</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-coral">Exceptional Value</span> for Acquirers
          </h2>
          <p className="text-lg text-coolGray">
            A turnkey SaaS solution with everything in place - ready to be acquired and scaled
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="rounded-xl overflow-hidden shadow-xl bg-white border border-gray-100">
            <div className="flex overflow-x-auto scrollbar-none">
              {acquisitionPoints.map((point, index) => (
                <button 
                  key={index} 
                  className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === index 
                      ? 'border-coral text-coral' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  {point.title}
                </button>
              ))}
            </div>
            
            <div className="p-6 h-64">
              {acquisitionPoints.map((point, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col h-full ${activeTab === index ? 'block' : 'hidden'}`}
                >
                  <div className="mb-4 inline-flex">
                    <div className="bg-coral/10 text-coral rounded-full p-3">
                      <point.icon size={24} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
                  <p className="text-coolGray mb-6">{point.description}</p>
                  <div className="mt-auto">
                    <Button variant="outline" className="border-coral text-coral hover:bg-coral hover:text-white">
                      Learn more <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden bg-darktext text-white p-8">
            <h3 className="text-2xl font-bold mb-6">Acquisition Highlights</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-coral rounded-full p-1 mr-3 mt-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-coral">Rapid Time-to-Market</h4>
                  <p className="text-gray-300">Launch immediately with minimal development required</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-coral rounded-full p-1 mr-3 mt-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-coral">Clean Codebase</h4>
                  <p className="text-gray-300">Modern architecture with best practices and no technical debt</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-coral rounded-full p-1 mr-3 mt-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-coral">Complete Documentation</h4>
                  <p className="text-gray-300">Thorough technical and user documentation for easy onboarding</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-coral rounded-full p-1 mr-3 mt-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-coral">Scalable Infrastructure</h4>
                  <p className="text-gray-300">Built to handle growth with optimized performance</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button className="bg-cta-gradient text-white hover:opacity-90 w-full font-medium">
                Request Acquisition Details
              </Button>
              <p className="text-xs text-gray-400 mt-2 text-center">Serious inquiries only • NDA required</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcquisitionSection;
