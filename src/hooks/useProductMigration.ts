import { useState } from "react";
import { toast } from "sonner";
import { GumroadProduct } from "@/types/gumroad.types";
import gumroadService from "@/services/GumroadService";

export const useProductMigration = () => {
  const [migratingProducts, setMigratingProducts] = useState<string[]>([]);
  const [completedProducts, setCompletedProducts] = useState<string[]>([]);
  const [failedProducts, setFailedProducts] = useState<string[]>([]);
  const [migrationResults, setMigrationResults] = useState<Record<string, any>>({});
  const [migrationLogs, setMigrationLogs] = useState<Record<string, string[]>>({});
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});

  const addLog = (productId: string, message: string) => {
    setMigrationLogs(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), `${new Date().toISOString()} - ${message}`]
    }));
  };

  const startMigration = async (product: GumroadProduct, webhookUrl: string) => {
    if (!webhookUrl) {
      toast.error("Please enter an n8n webhook URL to start the migration");
      return;
    }

    if (migratingProducts.includes(product.id)) {
      toast.info(`Migration for ${product.name} is already in progress`);
      return;
    }

    if (completedProducts.includes(product.id)) {
      toast.info(`${product.name} has already been migrated`);
      return;
    }

    setMigratingProducts(prev => [...prev, product.id]);
    addLog(product.id, `Starting migration for product: ${product.name}`);
    toast.loading(`Starting migration for ${product.name}...`);

    setRetryCount(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));

    try {
      const payload = {
        title: product.name,
        description: product.description,
        price: product.price,
        image: product.image || ""
      };

      console.log("Sending payload to n8n:", payload);
      addLog(product.id, `Sending data to webhook: ${webhookUrl}`);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let responseData;
      try {
        responseData = await response.json();
        addLog(product.id, `Received response: ${JSON.stringify(responseData)}`);
      } catch (e) {
        responseData = { success: response.ok };
        addLog(product.id, `Non-JSON response received, status: ${response.ok ? 'Success' : 'Failed'}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Migration response:", responseData);

      setMigrationResults(prev => ({
        ...prev,
        [product.id]: responseData
      }));

      setMigratingProducts(prev => prev.filter(id => id !== product.id));
      setCompletedProducts(prev => [...prev, product.id]);
      addLog(product.id, `Migration successful`);
      toast.success(`Successfully migrated: ${product.name}`);

    } catch (error) {
      console.error("Migration failed:", error);
      
      let errorMessage = `Migration failed for ${product.name}. Please check your webhook URL and n8n workflow.`;
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "Migration failed: Could not connect to n8n webhook. Please verify that your n8n instance is running and the webhook is active.";
      } else if (error instanceof Error) {
        errorMessage = `Migration error: ${error.message}`;
      }
      
      addLog(product.id, `Error: ${errorMessage}`);
      toast.error(errorMessage);
      
      setMigratingProducts(prev => prev.filter(id => id !== product.id));
      setFailedProducts(prev => [...prev, product.id]);
    }
  };

  const startAllMigrations = async (products: GumroadProduct[], webhookUrl: string) => {
    if (!webhookUrl) {
      toast.error("Please enter an n8n webhook URL to start the migration");
      return;
    }

    const productsToMigrate = products.filter(
      product => !migratingProducts.includes(product.id) && !completedProducts.includes(product.id)
    );

    if (productsToMigrate.length === 0) {
      toast.info("No new products to migrate");
      return;
    }

    toast.info(`Starting migration for ${productsToMigrate.length} products`);
    
    for (const product of productsToMigrate) {
      await startMigration(product, webhookUrl);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const resetMigrationStatus = (productId: string) => {
    setCompletedProducts(prev => prev.filter(id => id !== productId));
    setFailedProducts(prev => prev.filter(id => id !== productId));
    
    const newResults = { ...migrationResults };
    delete newResults[productId];
    setMigrationResults(newResults);
    
    addLog(productId, `Migration status reset - ready to try again`);
  };

  return {
    migratingProducts,
    completedProducts,
    failedProducts,
    migrationResults,
    migrationLogs,
    retryCount,
    startMigration,
    startAllMigrations,
    resetMigrationStatus
  };
};
