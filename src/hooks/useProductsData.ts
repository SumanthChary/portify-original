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
      if (preview) {
        // Fetch a single product by preview ID
        const { data, error } = await supabase
          .from('migrations')
          .select('*')
          .eq('id', preview)
          .single();
        if (data) setProducts([data]);
      } else if (previewId) {
        // Fetch all products for this previewId (no status filter)
        const { data, error } = await supabase
          .from('migrations')
          .select('*')
          .eq('gumroad_product_id', previewId)
          .order('created_at', { ascending: false });
        if (data) setProducts(data);
      } else {
        // Fetch ALL products (no status filter)
        const { data, error } = await supabase
          .from('migrations')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
    };
    fetchProducts();
  }, [preview, previewId]);

  const refreshProducts = async () => {
    setLoading(true);
    // Reuse the same logic as in fetchProducts
    if (preview) {
      const { data, error } = await supabase
        .from('migrations')
        .select('*')
        .eq('id', preview)
        .single();
      if (data) setProducts([data]);
    } else if (previewId) {
      const { data, error } = await supabase
        .from('migrations')
        .select('*')
        .eq('status', 'migrated')
        .order('created_at', { ascending: false });
      if (data) setProducts(data);
    } else {
      const { data, error } = await supabase
        .from('migrations')
        .select('*')
        .eq('gumroad_product_id', previewId)
        .eq('status', 'preview');
      if (data) setProducts(data);
    }
    setLoading(false);
  };

  return { products, loading, refreshProducts };
};
