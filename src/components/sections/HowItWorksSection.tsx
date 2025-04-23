
import { ArrowRight, Check, Database, Cloud, Upload } from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Connect your source",
    description: "Link your Gumroad, Payhip or other platform account securely.",
    color: "bg-coral/10 text-coral"
  },
  {
    icon: Upload,
    title: "Select products & destination",
    description: "Choose which products to move and where they should go.",
    color: "bg-mint/20 text-mint"
  },
  {
    icon: Cloud,
    title: "Let our AI migrate content & images",
    description: "Our AI handles the transfer, including optimizing descriptions and images.",
    color: "bg-lushGreen/10 text-lushGreen"
  },
  {
    icon: Check,
    title: "Done! Preview and publish",
    description: "Review your migrated products and publish when ready.",
    color: "bg-redAccent/10 text-redAccent"
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            How It <span className="text-coral">Works</span>
          </h2>
          <p className="text-lg text-coolGray">
            Migrating your digital products has never been easier. Our simple process gets you from A to B without the headache.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 h-full card-hover">
                <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center mb-5`}>
                  <step.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-coolGray">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="text-gray-300" size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="inline-block bg-mint/10 text-mint px-4 py-2 rounded-full text-sm font-medium">
            Average migration time: Under 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
