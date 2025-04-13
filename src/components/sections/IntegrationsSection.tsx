
const platforms = [
  "Gumroad",
  "Payhip",
  "Podia",
  "Teachable",
  "Kajabi",
  "Shopify",
  "Thinkific",
  "LemonSqueezy"
];

const IntegrationsSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Platform <span className="text-coral">Integrations</span>
          </h2>
          <p className="text-lg text-coolGray">
            We connect with all major digital product platforms to ensure smooth migrations.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="bg-offwhite rounded-xl h-24 flex items-center justify-center shadow-sm border border-gray-100 card-hover"
            >
              <span className="font-semibold text-lg">{platform}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-coolGray">
            Don't see your platform? <a href="#" className="text-coral font-medium">Request an integration</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
