
import { TrendingDown, Star, Shield, Clock, BarChart, HeadphonesIcon } from "lucide-react";

const businessBenefits = [
  {
    icon: TrendingDown,
    title: "Reduce support tickets by 60%",
    description: "Customers find their own data instead of contacting support",
    stat: "60%",
    color: "bg-green-500"
  },
  {
    icon: Star,
    title: "Look professional with branded portals",
    description: "Custom branding makes you look like a major enterprise",
    stat: "★★★★★",
    color: "bg-purple-500"
  },
  {
    icon: Shield,
    title: "Keep customer data secure and compliant",
    description: "GDPR-compliant with audit logs and access controls",
    stat: "100%",
    color: "bg-blue-500"
  }
];

const customerBenefits = [
  {
    icon: Clock,
    title: "Access their data 24/7",
    description: "No more waiting for business hours or email responses"
  },
  {
    icon: BarChart,
    title: "Download reports instantly",
    description: "Self-service access to invoices, statements, and analytics"
  },
  {
    icon: HeadphonesIcon,
    title: "No more waiting for email responses",
    description: "Immediate access to the information they need"
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-50/50 to-green-50/30">
      <div className="section-container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Customer Portal <span className="text-coral">Benefits</span>
          </h2>
          <p className="text-xl text-coolGray">
            Not just features, but real outcomes for your business and customers
          </p>
        </div>
        
        {/* Business Benefits */}
        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            For Your <span className="text-green-600">Business</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {businessBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 card-hover text-center"
              >
                <div className={`w-20 h-20 ${benefit.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <benefit.icon size={32} className="text-white" />
                </div>
                
                <div className="text-4xl font-bold text-darktext mb-4">
                  {benefit.stat}
                </div>
                
                <h4 className="text-xl font-bold mb-4 text-darktext">
                  {benefit.title}
                </h4>
                
                <p className="text-coolGray leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Customer Benefits */}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            For Your <span className="text-coral">Customers</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {customerBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 card-hover"
              >
                <div className="bg-coral/10 text-coral w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <benefit.icon size={24} />
                </div>
                
                <h4 className="text-xl font-bold mb-4 text-darktext">
                  {benefit.title}
                </h4>
                
                <p className="text-coolGray leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Success metrics */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-coral mb-2">50,000+</div>
              <div className="text-coolGray">Secure customer logins daily</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-coolGray">Companies trust Portify</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-coolGray">Uptime guarantee</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
