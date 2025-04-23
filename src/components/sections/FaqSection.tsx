
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does DigitalMigratePro connect to my platform accounts?",
    answer: "We use secure OAuth connections for most platforms, which means you authorize access without sharing your passwords with us. For platforms without OAuth, we use secure API keys that you can revoke at any time."
  },
  {
    question: "Is my data safe during the migration process?",
    answer: "Absolutely! We use end-to-end encryption for all data transfers. We never store your login credentials, and all migrations happen through secure channels. Additionally, we create backups of your data before migration."
  },
  {
    question: "What types of digital products can I migrate?",
    answer: "You can migrate virtually any type of digital product, including PDFs, ebooks, courses, videos, audio files, templates, design assets, software, and more. Our system handles common file types and preserves your folder structures."
  },
  {
    question: "How accurate is the AI rewriting feature?",
    answer: "Our AI rewriting feature uses advanced language models to optimize your product descriptions while preserving your original message and tone. It focuses on improving SEO and readability. You'll always have a chance to review and edit the AI suggestions before publishing."
  },
  {
    question: "Can I schedule migrations for a specific time?",
    answer: "Yes! With our Pro and Team plans, you can schedule migrations to run at specific dates and times. This is especially useful for coordinating product launches or platform transitions outside of business hours."
  },
  {
    question: "What happens if something goes wrong during migration?",
    answer: "We automatically create backups before starting any migration. If issues occur, you can restore from these backups with one click. Our support team is also available to help troubleshoot any problems that might arise."
  }
];

const FaqSection = () => {
  return (
    <section id="faq" className="py-16 sm:py-24 bg-offwhite">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Frequently <span className="text-coral">Asked Questions</span>
          </h2>
          <p className="text-lg text-coolGray">
            Got questions? We've got answers. If you don't see what you're looking for, contact our support team.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                <AccordionTrigger className="text-left font-medium py-5 hover:text-coral hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-coolGray pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-coolGray">
            Still have questions? <a href="#" className="text-coral font-medium">Contact our support team</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
