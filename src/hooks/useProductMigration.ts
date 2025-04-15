import { useState } from "react";
import { toast } from "sonner";
import { GumroadProduct } from "@/types/gumroad.types";
import gumroadService from "@/services/GumroadService";

export const useProductMigration = () => {
  const [migratingProducts, setMigratingProducts] = useState<string[]>([]);
  const [completedProducts, setCompletedProducts] = useState<string[]>([]);

  const startMigration = async (product: GumroadProduct, webhookUrl: string) => {
    if (!webhookUrl) {
      toast.error("Please enter an n8n webhook URL to start the migration");
      return;
    }

    setMigratingProducts(prev => [...prev, product.id]);
    toast.loading(`Starting migration for product ${product.id}...`);

    try {
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
            url: product.url,
            image: product.image
          },
          user_id: "user_" + Date.now(),
          email: "user@example.com"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Simulate migration process
      setTimeout(() => {
        setMigratingProducts(prev => prev.filter(id => id !== product.id));
        setCompletedProducts(prev => [...prev, product.id]);
        toast.success(`Successfully migrated product: ${product.name}`);
      }, 3000);

    } catch (error) {
      console.error("Migration failed:", error);
      toast.error("Migration failed. Please check your webhook URL and try again.");
      setMigratingProducts(prev => prev.filter(id => id !== product.id));
    }
  };

  const startAllMigrations = (products: GumroadProduct[], webhookUrl: string) => {
    products.forEach(product => {
      if (!migratingProducts.includes(product.id) && !completedProducts.includes(product.id)) {
        startMigration(product, webhookUrl);
      }
    });
  };

  return {
    migratingProducts,
    completedProducts,
    startMigration,
    startAllMigrations
  };
};
