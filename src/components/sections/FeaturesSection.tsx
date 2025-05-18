
import { motion } from "framer-motion";
import { PackageOpen, FileSearch, Image, Upload, Calendar, Database, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: PackageOpen,
    title: "Bulk Transfer with Preview",
    description: "Transfer multiple products at once and preview before publishing.",
    color: "bg-coral/10 text-coral"
  },
  {
    icon: FileSearch,
    title: "AI SEO Optimization",
    description: "AI automatically optimizes product descriptions for better search visibility.",
    color: "bg-mint/20 text-mint"
  },
  {
    icon: Image,
    title: "Smart Image Compression",
    description: "Smart compression keeps image quality while reducing file sizes by up to 70%.",
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
    title: "Instant Backup & Restore",
    description: "Keep backups of your products before and after migration with one click.",
    color: "bg-mint/20 text-mint"
  },
  {
    icon: Zap,
    title: "Performance Optimization",
    description: "Automatic performance tuning for all migrated digital products.",
    color: "bg-lushGreen/10 text-lushGreen"
  },
  {
    icon: Shield,
    title: "Security Enhancements",
    description: "Built-in security scanning and enhancement for all migrated content.",
    color: "bg-redAccent/10 text-redAccent"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/3 w-96 h-96 bg-mint/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/3 w-96 h-96 bg-coral/5 rounded-full blur-3xl"></div>
      
      <div className="section-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="tag-badge mb-4">Advanced Capabilities</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Powerful <span className="text-coral">Enterprise-Grade</span> Features
          </h2>
          <p className="text-lg text-coolGray">
            A complete suite of tools designed for seamless product migration with AI-powered optimization.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              variants={item}
            >
              <div className={`w-12 h-12 rounded-full ${feature.color} flex items-center justify-center mb-5`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-coolGray">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-coral/10 to-mint/10 px-6 py-3 rounded-xl">
            <Zap className="text-coral h-5 w-5" />
            <span className="text-sm font-medium">New features added monthly • Always improving</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
