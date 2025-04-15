
import { useState } from "react";
import { toast } from "sonner";
import { GumroadProduct } from "@/types/gumroad.types";
import gumroadService from "@/services/GumroadService";

export const useProductMigration = () => {
  const [migratingProducts, setMigratingProducts] = useState<string[]>([]);
  const [completedProducts, setCompletedProducts] = useState<string[]>([]);
  const [failedProducts, setFailedProducts] = useState<string[]>([]);
  const [migrationResults, setMigrationResults] = useState<Record<string, any>>({});

  const startMigration = async (product: GumroadProduct, webhookUrl: string) => {
    if (!webhookUrl) {
      toast.error("Please enter an n8n webhook URL to start the migration");
      return;
    }

    // Check if product is already being migrated
    if (migratingProducts.includes(product.id)) {
      toast.info(`Migration for ${product.name} is already in progress`);
      return;
    }

    // Check if product is already migrated
    if (completedProducts.includes(product.id)) {
      toast.info(`${product.name} has already been migrated`);
      return;
    }

    setMigratingProducts(prev => [...prev, product.id]);
    toast.loading(`Starting migration for ${product.name}...`);

    try {
      // Prepare payload for n8n webhook
      const payload = {
        gumroadToken: gumroadService.getAccessToken(),
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          url: product.url,
          image: product.image || ""
        },
        user_id: "user_" + Date.now(),
        email: "user@example.com" // In a real app, use the actual user email
      };

      console.log("Sending payload to n8n:", payload);

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
      } catch (e) {
        // Some webhooks might not return JSON
        responseData = { success: response.ok };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Migration response:", responseData);

      // Store the migration result for this product
      setMigrationResults(prev => ({
        ...prev,
        [product.id]: responseData
      }));

      // Update product status
      setMigratingProducts(prev => prev.filter(id => id !== product.id));
      setCompletedProducts(prev => [...prev, product.id]);
      toast.success(`Successfully migrated: ${product.name}`);

    } catch (error) {
      console.error("Migration failed:", error);
      
      // Improved error messaging
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error(
          "Migration failed: Could not connect to n8n webhook. Please verify that your n8n instance is running and the webhook is active."
        );
      } else {
        toast.error(`Migration failed for ${product.name}. Please check your webhook URL and n8n workflow.`);
      }
      
      setMigratingProducts(prev => prev.filter(id => id !== product.id));
      setFailedProducts(prev => [...prev, product.id]);
    }
  };

  const startAllMigrations = async (products: GumroadProduct[], webhookUrl: string) => {
    if (!webhookUrl) {
      toast.error("Please enter an n8n webhook URL to start the migration");
      return;
    }

    // Filter out products that are already migrating or completed
    const productsToMigrate = products.filter(
      product => !migratingProducts.includes(product.id) && !completedProducts.includes(product.id)
    );

    if (productsToMigrate.length === 0) {
      toast.info("No new products to migrate");
      return;
    }

    toast.info(`Starting migration for ${productsToMigrate.length} products`);
    
    // Migrate products one by one with a small delay to avoid overwhelming the webhook
    for (const product of productsToMigrate) {
      await startMigration(product, webhookUrl);
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const resetMigrationStatus = (productId: string) => {
    setCompletedProducts(prev => prev.filter(id => id !== productId));
    setFailedProducts(prev => prev.filter(id => id !== productId));
    
    // Also remove from migration results
    const newResults = { ...migrationResults };
    delete newResults[productId];
    setMigrationResults(newResults);
  };

  return {
    migratingProducts,
    completedProducts,
    failedProducts,
    migrationResults,
    startMigration,
    startAllMigrations,
    resetMigrationStatus
  };
};
