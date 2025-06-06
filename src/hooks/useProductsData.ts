
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Define the Product type to match the database structure
export type Product = Database['public']['Tables']['migrations']['Row'];

interface UseProductsDataProps {
  preview?: string;
  previewId?: string;
}

export const useProductsData = ({ preview, previewId }: UseProductsDataProps = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching products with params:", { preview, previewId });
      
      let query = supabase
        .from('migrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If preview ID is specified, filter by that ID
      if (previewId) {
        query = query.eq('id', previewId);
      }
      
      const { data, error: supabaseError } = await query;
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }
      
      console.log('Fetched products:', data);
      
      if (data) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [previewId, preview]);

  return { products, loading, error, refreshProducts: fetchProducts };
};
