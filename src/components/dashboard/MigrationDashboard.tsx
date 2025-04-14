
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import gumroadService, { GumroadProduct } from "@/services/GumroadService";
import ProductCard from "./ProductCard";
import WorkflowVisualizer from "./WorkflowVisualizer";

const MigrationDashboard = () => {
  const [products, setProducts] = useState<GumroadProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [migratingProducts, setMigratingProducts] = useState<string[]>([]);
  const [completedProducts, setCompletedProducts] = useState<string[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");

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

  const startMigration = async (productId: string) => {
    if (!webhookUrl) {
      toast.error("Please enter an n8n webhook URL to start the migration");
      return;
    }

    setMigratingProducts(prev => [...prev, productId]);
    toast.loading(`Starting migration for product ${productId}...`);

    try {
      // Here we would trigger the n8n webhook
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error("Product not found");

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gumroadToken: gumroadService.getAccessToken(),
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            url: product.url
          }
        }),
      });

      // Simulate migration process
      setTimeout(() => {
        setMigratingProducts(prev => prev.filter(id => id !== productId));
        setCompletedProducts(prev => [...prev, productId]);
        toast.success(`Successfully migrated product: ${product.name}`);
      }, 3000);

    } catch (error) {
      console.error("Migration failed:", error);
      toast.error("Migration failed. Please check your webhook URL and try again.");
      setMigratingProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const startAllMigrations = () => {
    if (!webhookUrl) {
      toast.error("Please enter an n8n webhook URL to start the migration");
      return;
    }

    products.forEach(product => {
      if (!migratingProducts.includes(product.id) && !completedProducts.includes(product.id)) {
        startMigration(product.id);
      }
    });
  };

  return (
    <div className="section-container">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Product Migration Dashboard</h1>
        <p className="text-lg text-coolGray">
          Migrate your Gumroad products to Payhip using our n8n automation workflow.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">n8n Webhook Setup</h2>
        <p className="mb-4 text-coolGray">
          Enter your n8n webhook URL to connect the workflow:
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-n8n-instance.com/webhook/..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md"
          />
          <Button 
            variant="outline" 
            onClick={fetchGumroadProducts}
            disabled={isLoading}
            className="inline-flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Products
          </Button>
        </div>
      </div>

      <WorkflowVisualizer />

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold">Your Gumroad Products</h2>
          <Button 
            onClick={startAllMigrations}
            disabled={products.length === 0 || !webhookUrl}
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationDashboard;
