
import { Briefcase, FileText, PaintBucket, BookOpen } from "lucide-react";

const useCases = [
  {
    icon: FileText,
    title: "Digital Product Sellers",
    description: "Move PDFs, templates, and digital downloads between platforms effortlessly.",
    color: "bg-coral/10 text-coral"
  },
  {
    icon: BookOpen,
    title: "Course Creators",
    description: "Transfer courses, videos, and educational content without losing structure.",
    color: "bg-mint/20 text-mint"
  },
  {
    icon: PaintBucket,
    title: "Designers & Creatives",
    description: "Migrate design assets, templates, and creative resources in bulk.",
    color: "bg-lushGreen/10 text-lushGreen"
  },
  {
    icon: Briefcase,
    title: "Coaches & Consultants",
    description: "Move programs, workbooks, and client resources between platforms.",
    color: "bg-redAccent/10 text-redAccent"
  }
];

const benefits = [
  {
    emoji: "✅",
    text: "Move 50+ products in 1 click"
  },
  {
    emoji: "🔁",
    text: "Switch platforms effortlessly"
  },
  {
    emoji: "🔐",
    text: "No data loss guarantee"
  },
  {
    emoji: "📦",
    text: "Works with PDFs, ZIPs, images, links"
  }
];

const UseCasesSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-offwhite">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Who It's <span className="text-coral">For</span>
          </h2>
          <p className="text-lg text-coolGray">
            Whether you're a solopreneur or part of a team, DigitalMigratePro helps you move your digital assets without hassle.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {useCases.map((useCase, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 card-hover">
              <div className={`w-12 h-12 rounded-full ${useCase.color} flex items-center justify-center mb-5`}>
                <useCase.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
              <p className="text-coolGray">{useCase.description}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center">
                <div className="text-2xl mr-3">{benefit.emoji}</div>
                <div className="font-medium">{benefit.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
