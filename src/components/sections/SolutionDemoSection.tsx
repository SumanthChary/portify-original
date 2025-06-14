
import { Database, Palette, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "01",
    icon: Database,
    title: "Connect Database",
    description: "Link your existing database or CRM in 30 seconds",
    visual: "🔗 MySQL, PostgreSQL, MongoDB...",
    color: "bg-blue-500"
  },
  {
    step: "02", 
    icon: Palette,
    title: "Configure Portal",
    description: "Customize branding, choose data fields, set permissions",
    visual: "🎨 Your brand, your colors",
    color: "bg-purple-500"
  },
  {
    step: "03",
    icon: Share2,
    title: "Share with Customers",
    description: "Send secure login links - customers access their data instantly",
    visual: "🚀 Portal goes live immediately",
    color: "bg-green-500"
  }
];

const SolutionDemoSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
      
      <div className="section-container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Watch Portify Create a <span className="text-coral">Customer Portal</span> in 60 Seconds
          </h2>
          <p className="text-xl text-coolGray mb-8">
            No coding, no complexity - just results
          </p>
          
          {/* Demo video placeholder */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-8 mb-12 shadow-2xl">
            <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p className="text-lg font-semibold">60-Second Demo Video</p>
                <p className="text-gray-300">See the complete transformation</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 3-Step Process */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full card-hover">
                  {/* Step number */}
                  <div className="text-sm font-bold text-coral mb-4">{step.step}</div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <step.icon size={28} className="text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4 text-darktext">{step.title}</h3>
                  <p className="text-coolGray mb-6 leading-relaxed">{step.description}</p>
                  
                  {/* Visual indicator */}
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <span className="text-2xl">{step.visual}</span>
                  </div>
                </div>
                
                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="text-coral w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="bg-cta-gradient hover:opacity-90 font-semibold text-lg px-12 py-6 text-white shadow-xl"
          >
            Start Building Your Portal Now
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
          <p className="text-coolGray mt-4">No credit card required • 5-minute setup</p>
        </div>
      </div>
    </section>
  );
};

export default SolutionDemoSection;
