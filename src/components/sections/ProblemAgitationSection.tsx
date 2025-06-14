
import { AlertTriangle, Clock, Shield, DollarSign } from "lucide-react";

const painPoints = [
  {
    icon: AlertTriangle,
    title: "Customers constantly ask for order history, invoices, reports",
    description: "Every day brings new requests for data that should be self-service.",
    color: "bg-red-50 border-red-200 text-red-700"
  },
  {
    icon: Clock,
    title: "Your team wastes 10+ hours/week pulling data",
    description: "Manual data extraction steals time from important business tasks.",
    color: "bg-orange-50 border-orange-200 text-orange-700"
  },
  {
    icon: Shield,
    title: "Email attachments aren't secure or professional",
    description: "Sensitive data shared via email creates security risks and looks unprofessional.",
    color: "bg-yellow-50 border-yellow-200 text-yellow-700"
  },
  {
    icon: DollarSign,
    title: "Building custom portals costs $50k and takes months",
    description: "Traditional development is expensive, slow, and requires ongoing maintenance.",
    color: "bg-red-50 border-red-200 text-red-700"
  }
];

const ProblemAgitationSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-red-50/50 to-orange-50/30">
      <div className="section-container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-darktext">
            Tired of <span className="text-red-600">Manually Sending</span> Customer Data?
          </h2>
          <p className="text-xl text-coolGray leading-relaxed">
            Most businesses waste countless hours on manual data sharing. Here's what you're probably dealing with:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {painPoints.map((pain, index) => (
            <div
              key={index}
              className={`rounded-2xl border-2 p-8 ${pain.color} card-hover transition-all duration-300`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <pain.icon size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-3 leading-tight">
                    {pain.title}
                  </h3>
                  <p className="opacity-90 leading-relaxed">
                    {pain.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cost emphasis */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-red-100 border border-red-200 text-red-800 px-8 py-4 rounded-xl">
            <p className="text-lg font-semibold">
              💸 This inefficiency is costing you <span className="text-red-600">$2,000+/month</span> in wasted time
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemAgitationSection;
