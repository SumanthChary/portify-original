
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import gumroadService, { GumroadProduct } from "@/services/GumroadService";
import WebhookSetup, { N8N_WEBHOOK_URL } from "./WebhookSetup";
import MigrationControls from "./MigrationControls";
import ProductsList from "./ProductsList";
import WorkflowVisualizer from "./WorkflowVisualizer";

const MigrationDashboard = () => {
  const [products, setProducts] = useState<GumroadProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [migratingProducts, setMigratingProducts] = useState<string[]>([]);
  const [completedProducts, setCompletedProducts] = useState<string[]>([]);
  const [isWebhookTested, setIsWebhookTested] = useState(false);

  useEffect(() => {
    // Products are now fetched through the SimpleMigration flow with user-provided API keys
    // No default connection test since API keys are user-provided
  }, []);

  const fetchGumroadProducts = async () => {
    setIsLoading(true);
    try {
      // This function is now only called from the SimpleMigration flow
      // with proper user credentials via edge functions
      toast.info("Please use the Simple Migration flow to connect your Gumroad account");
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch your Gumroad products. Please use the Simple Migration flow.");
    } finally {
      setIsLoading(false);
    }
  };

  const startMigration = async (productId: string) => {
    if (!N8N_WEBHOOK_URL) {
      toast.error("Webhook URL is missing");
      return;
    }

    setMigratingProducts(prev => [...prev, productId]);
    toast.loading(`Starting migration for product ${productId}...`);

    try {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error("Product not found");

      const payload = {
        id: product.id,
        title: product.name,
        description: product.description || '',
        price: typeof product.price === 'number' ? product.price : Number(product.price) || 0,
        image_url: product.image || '',
        url: product.url || '',
        timestamp: new Date().toISOString()
      };

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorText = await response.text();
        try {
          const json = JSON.parse(errorText);
          errorText = JSON.stringify(json, null, 2);
        } catch (err) {
          console.error('Error parsing error response:', err);
        }
        if (response.type === 'opaque') {
          errorText = 'Possible CORS or network error. Check n8n CORS settings.';
        }
        console.error(`Webhook error: HTTP ${response.status} - ${errorText}`);
        toast.error(`Migration failed: HTTP ${response.status} - ${errorText}`);
        setMigratingProducts(prev => prev.filter(id => id !== productId));
        return;
      }

      setTimeout(() => {
        setMigratingProducts(prev => prev.filter(id => id !== productId));
        setCompletedProducts(prev => [...prev, productId]);
        toast.success(`Successfully migrated product: ${product.name}`);
      }, 3000);

    } catch (error) {
      console.error("Migration failed:", error);
      toast.error("Migration failed. " + (error instanceof Error ? error.message : 'Unknown error. Check network and n8n CORS settings.'));
      setMigratingProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const startAllMigrations = () => {
    if (!N8N_WEBHOOK_URL) {
      toast.error("Webhook URL is missing");
      return;
    }

    if (!isWebhookTested) {
      toast.warning("Please test the webhook connection first");
      return;
    }

    products.forEach(product => {
      if (!migratingProducts.includes(product.id) && !completedProducts.includes(product.id)) {
        startMigration(product.id);
      }
    });
  };

  return (
    <div className="section-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Product Migration Dashboard</h1>
        <p className="text-lg text-coolGray">
          Migrate your Gumroad products to Payhip using our n8n automation workflow.
        </p>
      </div>

      <WebhookSetup 
        isWebhookTested={isWebhookTested}
        setIsWebhookTested={setIsWebhookTested}
      />

      <WorkflowVisualizer />

      <div className="mt-8">
        <MigrationControls
          products={products}
          migratingProducts={migratingProducts}
          completedProducts={completedProducts}
          isWebhookTested={isWebhookTested}
          onMigrateAll={startAllMigrations}
        />

        <ProductsList
          products={products}
          isLoading={isLoading}
          migratingProducts={migratingProducts}
          completedProducts={completedProducts}
          isWebhookTested={isWebhookTested}
          onMigrate={startMigration}
        />
      </div>
      
      <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Need Help Setting Up n8n?</h2>
        <p className="text-coolGray mb-4">
          Follow our step-by-step guide to create the perfect n8n workflow for migrating your products.
        </p>
        <Link to="/n8n-guide">
          <Button className="bg-coral hover:bg-coral/90">
            View n8n Setup Guide
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MigrationDashboard;
