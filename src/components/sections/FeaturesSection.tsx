
import { PackageOpen, FileSearch, Image, Upload, Calendar, Database } from "lucide-react";

const features = [
  {
    icon: PackageOpen,
    title: "Bulk Transfer with Preview",
    description: "Transfer multiple products at once and preview before publishing.",
    color: "bg-coral/10 text-coral"
  },
  {
    icon: FileSearch,
    title: "Auto SEO Rewrite",
    description: "AI automatically optimizes product descriptions for better search visibility.",
    color: "bg-mint/20 text-mint"
  },
  {
    icon: Image,
    title: "Image Compression",
    description: "Smart compression keeps image quality while reducing file sizes.",
    color: "bg-lushGreen/10 text-lushGreen"
  },
  {
    icon: Upload,
    title: "One-Click Deploy",
    description: "Deploy all migrated products to your destination with a single click.",
    color: "bg-redAccent/10 text-redAccent"
  },
  {
    icon: Calendar,
    title: "Scheduled Migration",
    description: "Set up migrations to run automatically at your preferred time.",
    color: "bg-coral/10 text-coral"
  },
  {
    icon: Database,
    title: "Backup & Restore",
    description: "Keep backups of your products before and after migration.",
    color: "bg-mint/20 text-mint"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Powerful <span className="text-coral">Features</span>
          </h2>
          <p className="text-lg text-coolGray">
            We've packed DigitalMigratePro with everything you need to make your product migration smooth and efficient.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 gradient-hover card-hover"
            >
              <div className={`w-12 h-12 rounded-full ${feature.color} flex items-center justify-center mb-5`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-coolGray">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
