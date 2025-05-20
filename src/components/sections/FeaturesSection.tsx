
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
    <section id="features" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-mint/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-coral/5 rounded-full blur-3xl"></div>
      
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="section-title">
            Powerful <span className="text-coral">Features</span>
          </h2>
          <p className="section-description">
            We've packed DigitalMigratePro with everything you need to make your product migration smooth and efficient.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className={`feature-icon ${feature.color}`}>
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
