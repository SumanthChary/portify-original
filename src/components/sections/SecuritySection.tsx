
import { Shield, Lock, FileCheck, Database } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "End-to-End Encrypted",
    description: "All data transfers use industry-standard encryption to protect your information."
  },
  {
    icon: Lock,
    title: "We Don't Store Credentials",
    description: "Your platform logins are never stored on our servers - we use secure OAuth."
  },
  {
    icon: FileCheck,
    title: "GDPR-Compliant",
    description: "Fully compliant with data protection regulations, including GDPR and CCPA."
  },
  {
    icon: Database,
    title: "Secure Infrastructure",
    description: "Built on enterprise-grade infrastructure with regular security audits."
  }
];

const SecuritySection = () => {
  return (
    <section className="py-16 sm:py-24 bg-offwhite">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Security & <span className="text-coral">Privacy</span>
          </h2>
          <p className="text-lg text-coolGray">
            Your data security is our top priority. We've implemented multiple layers of protection to keep your information safe.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex items-start"
            >
              <div className="bg-coral/10 text-coral rounded-full p-3 mr-5">
                <feature.icon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-coolGray">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
