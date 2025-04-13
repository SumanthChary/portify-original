
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for trying out the platform",
    features: [
      "3 product transfers/month",
      "Basic AI rewriting",
      "Standard image compression",
      "Email support"
    ],
    cta: "Get Started",
    popular: false,
    color: "border-gray-200"
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Everything you need for regular migrations",
    features: [
      "Unlimited transfers",
      "Advanced AI rewriting",
      "Premium image compression",
      "Scheduled migrations",
      "API access",
      "Priority email support"
    ],
    cta: "Choose Pro",
    popular: true,
    color: "border-coral"
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For teams managing multiple accounts",
    features: [
      "Everything in Pro",
      "Multiple platform accounts",
      "Team management",
      "Advanced analytics",
      "Custom migrations",
      "Priority phone support"
    ],
    cta: "Choose Team",
    popular: false,
    color: "border-gray-200"
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-offwhite">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Simple, Transparent <span className="text-coral">Pricing</span>
          </h2>
          <p className="text-lg text-coolGray">
            Choose the plan that fits your needs. All plans come with a 14-day money-back guarantee.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-8 border-2 ${plan.color} relative ${
                plan.popular ? "transform md:-translate-y-4 shadow-xl" : "shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-cta-gradient text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg animate-pulse">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-coolGray ml-1">{plan.period}</span>}
                </div>
                <p className="text-coolGray mt-2">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-lushGreen mr-2 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${
                  plan.popular
                    ? "bg-cta-gradient hover:opacity-90"
                    : "bg-white text-coral border-2 border-coral hover:bg-coral hover:text-white"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-coolGray">
            Need a custom solution? <a href="#" className="text-coral font-medium">Contact us</a> for enterprise pricing.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
