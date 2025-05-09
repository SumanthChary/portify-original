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
    const fetchProducts = async () => {
      setLoading(true);
      // Always fetch ALL products from migrations table, no filter
      const { data, error } = await supabase
        .from('migrations')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    setLoading(true);
    // Always fetch ALL products from migrations table, no filter
    const { data, error } = await supabase
      .from('migrations')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  return { products, loading, refreshProducts };
};
