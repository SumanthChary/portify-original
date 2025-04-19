
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import gumroadService from "@/services/GumroadService";
import { sendProductsToWebhook } from "@/services/MigrationService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MigrationAgent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleMigration = async () => {
    setIsLoading(true);
    toast.loading("Starting product migration...");

    try {
      // Check if connected to Gumroad
      if (!gumroadService.isAuthenticated()) {
        gumroadService.startOAuthFlow();
        return;
      }

      // Fetch products from Gumroad
      const products = await gumroadService.getProducts();
      
      if (!products.length) {
        toast.error("No products found in your Gumroad account");
        return;
      }

      // Send products to webhook
      const result = await sendProductsToWebhook(
        products,
        "user@example.com" // In a real app, get this from auth context
      );

      toast.success(`Successfully sent ${products.length} products to migration service`);
      
      // If preview URL is returned, navigate to it
      if (result.preview_url) {
        navigate(result.preview_url);
      }

    } catch (error) {
      console.error('Migration failed:', error);
      toast.error("Failed to migrate products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-offwhite">
        <div className="section-container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Gumroad Product Migration
            </h1>
            <p className="text-lg text-coolGray mb-8">
              Automatically migrate your Gumroad products to Payhip with our migration assistant.
            </p>
            
            <Button
              onClick={handleMigration}
              disabled={isLoading}
              className="bg-cta-gradient hover:opacity-90 text-white py-6 px-8 text-lg"
            >
              {isLoading ? (
                <>
                  <span className="inline-block h-5 w-5 mr-3 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></span>
                  Migrating Products...
                </>
              ) : (
                "Start Migration"
              )}
            </Button>
            
            <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">How It Works</h2>
              <ol className="text-left text-coolGray space-y-3">
                <li>1. Connect your Gumroad account</li>
                <li>2. We fetch your product data securely</li>
                <li>3. Product information is prepared for migration</li>
                <li>4. Preview your products before final transfer</li>
                <li>5. Confirm to complete the migration to Payhip</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MigrationAgent;
