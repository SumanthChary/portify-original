
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WorkflowVisualizer from "./WorkflowVisualizer";
import WebhookSetup from "./WebhookSetup";
import ProductsSection from "./ProductsSection";
import { useWebhook } from "@/hooks/useWebhook";
import { useProducts } from "@/hooks/useProducts";
import { useProductMigration } from "@/hooks/useProductMigration";

const MigrationDashboard = () => {
  const { webhookUrl, setWebhookUrl, isWebhookTested, isTestingWebhook, testWebhook, validateWebhookUrl } = useWebhook();
  const { products, isLoading } = useProducts();
  const { migratingProducts, completedProducts, failedProducts, startMigration, startAllMigrations, resetMigrationStatus } = useProductMigration();

  return (
    <div className="section-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Product Migration Dashboard</h1>
        <p className="text-lg text-coolGray">
          Migrate your Gumroad products to Payhip using our n8n automation workflow.
        </p>
      </div>

      <WebhookSetup
        webhookUrl={webhookUrl}
        onWebhookUrlChange={setWebhookUrl}
        isTestingWebhook={isTestingWebhook}
        isWebhookTested={isWebhookTested}
        onTestWebhook={testWebhook}
        validateWebhookUrl={validateWebhookUrl}
      />

      <WorkflowVisualizer />

      <ProductsSection
        products={products}
        isLoading={isLoading}
        migratingProducts={migratingProducts}
        completedProducts={completedProducts}
        failedProducts={failedProducts}
        onMigrate={(product) => startMigration(product, webhookUrl)}
        onMigrateAll={() => startAllMigrations(products, webhookUrl)}
        onResetStatus={resetMigrationStatus}
        webhookReady={!!webhookUrl && isWebhookTested}
      />
      
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
