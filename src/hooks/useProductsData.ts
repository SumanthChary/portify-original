import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Product = Database['public']['Tables']['migrations']['Row'];

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
        if (data) setProducts(data);
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
        if (data) setProducts(data);
        setLoading(false);
      });
  };

  return { products, loading, refreshProducts };
};
