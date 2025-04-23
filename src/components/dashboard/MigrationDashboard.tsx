import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import gumroadService, { GumroadProduct } from "@/services/GumroadService";
import ProductCard from "./ProductCard";
import WorkflowVisualizer from "./WorkflowVisualizer";

const N8N_WEBHOOK_URL = "https://portify.app.n8n.cloud/webhook/migrate-gumroad";

const MigrationDashboard = () => {
  const [products, setProducts] = useState<GumroadProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [migratingProducts, setMigratingProducts] = useState<string[]>([]);
  const [completedProducts, setCompletedProducts] = useState<string[]>([]);
  const [isWebhookTested, setIsWebhookTested] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  useEffect(() => {
    fetchGumroadProducts();
  }, []);

  const fetchGumroadProducts = async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await gumroadService.getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch your Gumroad products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhook = async () => {
    setIsTestingWebhook(true);
    toast.loading("Testing webhook connection...");

    try {
      // Send a test request to the webhook with the expected payload
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Product",
          status: "Success",
          image_url: "https://example.com/image.jpg",
          description: "Test product description",
          price: 100,
          permalink: "test-product",
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setIsWebhookTested(true);
        toast.success("Webhook connection successful!");
      } else {
        toast.error("Failed to connect to webhook. Please check the URL and try again.");
      }
    } catch (error) {
      console.error("Webhook test failed:", error);
      toast.error("Failed to connect to webhook. Please check the URL and try again.");
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const startMigration = async (productId: string) => {
    if (!N8N_WEBHOOK_URL) {
      toast.error("Webhook URL is missing");
      return;
    }

    if (!isWebhookTested) {
      toast.warning("Please test the webhook connection first");
      return;
    }

    setMigratingProducts(prev => [...prev, productId]);
    toast.loading(`Starting migration for product ${productId}...`);

    try {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error("Product not found");

      // Send a flat product payload to n8n webhook
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          permalink: product.url || "",
          image_url: product.image,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
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
      toast.error("Migration failed. Please check your webhook URL and try again. " + (error instanceof Error ? error.message : ''));
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

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">n8n Webhook Setup</h2>
        <p className="mb-4 text-coolGray">
          Your n8n webhook URL is:
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={N8N_WEBHOOK_URL}
            readOnly
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
          <Button 
            variant="outline" 
            onClick={testWebhook}
            disabled={isTestingWebhook}
            className="inline-flex items-center"
          >
            {isTestingWebhook ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : isWebhookTested ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Verified
              </>
            ) : (
              <>
                <Info className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-coolGray">
          <p className="flex items-center">
            <Info className="h-4 w-4 mr-1 text-mint" />
            Don't have an n8n instance? <a href="https://n8n.io" target="_blank" rel="noopener noreferrer" className="text-coral ml-1 hover:underline">Sign up for free at n8n.io</a>
          </p>
        </div>
      </div>

      <WorkflowVisualizer />

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold">Your Gumroad Products</h2>
          <Button 
            onClick={startAllMigrations}
            disabled={products.length === 0 || !N8N_WEBHOOK_URL || !isWebhookTested}
            className="mt-2 sm:mt-0 bg-cta-gradient hover:opacity-90"
          >
            Migrate All Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-coral border-r-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-lg text-coolGray">No products found in your Gumroad account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                status={
                  completedProducts.includes(product.id)
                    ? "completed"
                    : migratingProducts.includes(product.id)
                    ? "migrating"
                    : "pending"
                }
                onMigrate={() => startMigration(product.id)}
                webhookReady={!!N8N_WEBHOOK_URL && isWebhookTested}
              />
            ))}
          </div>
        )}
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
