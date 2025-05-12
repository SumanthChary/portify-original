
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

// Define the Product type to match the database structure
type Product = {
  id: string;
  product_title: string;
  image_url?: string;
  price?: string; // Changed from number to string to match database
  status?: string;
  product_type?: string;
  created_at: string;
  description?: string;
  gumroad_product_id?: string;
  permalink?: string;
  updated_at?: string;
  user_email?: string;
};

interface UseProductsDataProps {
  preview?: string;
  previewId?: string;
}

export const useProductsData = ({ preview, previewId }: UseProductsDataProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('migrations')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        console.log('Fetched products:', data); // DEBUG LOG
        if (data) setProducts(data as Product[]);
        setLoading(false);
      });
  }, []);

  const refreshProducts = async () => {
    setLoading(true);
    supabase
      .from('migrations')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        console.log('Refreshed products:', data); // DEBUG LOG
        if (data) setProducts(data as Product[]);
        setLoading(false);
      });
  };

  return { products, loading, refreshProducts };
};
