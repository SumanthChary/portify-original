
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GumroadProduct } from "@/types/gumroad.types";
import gumroadService from "@/services/GumroadService";

export const useProducts = () => {
  const [products, setProducts] = useState<GumroadProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
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

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, isLoading, fetchProducts };
};
