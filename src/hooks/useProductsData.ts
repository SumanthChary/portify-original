
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

// Define the Product type to match the database structure
type Product = {
  id: string;
  product_title: string;
  image_url: string; // Changed from optional to required
  price: string; // Changed from optional to required
  status: string; // Changed from optional to required
  product_type: string; // Changed from optional to required
  created_at: string;
  description: string; // Changed from optional to required
  gumroad_product_id: string; // Changed from optional to required
  permalink: string; // Changed from optional to required
  updated_at: string; // Changed from optional to required
  user_email: string; // Changed from optional to required
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
        if (data) {
          // Transform data to ensure all required fields are present
          const transformedData = data.map(item => ({
            id: item.id || '',
            product_title: item.product_title || '',
            image_url: item.image_url || '',
            price: item.price || '',
            status: item.status || '',
            product_type: item.product_type || '',
            created_at: item.created_at || '',
            description: item.description || '',
            gumroad_product_id: item.gumroad_product_id || '',
            permalink: item.permalink || '',
            updated_at: item.updated_at || '',
            user_email: item.user_email || ''
          }));
          setProducts(transformedData as Product[]);
        }
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
        if (data) {
          // Transform data to ensure all required fields are present
          const transformedData = data.map(item => ({
            id: item.id || '',
            product_title: item.product_title || '',
            image_url: item.image_url || '',
            price: item.price || '',
            status: item.status || '',
            product_type: item.product_type || '',
            created_at: item.created_at || '',
            description: item.description || '',
            gumroad_product_id: item.gumroad_product_id || '',
            permalink: item.permalink || '',
            updated_at: item.updated_at || '',
            user_email: item.user_email || ''
          }));
          setProducts(transformedData as Product[]);
        }
        setLoading(false);
      });
  };

  return { products, loading, refreshProducts };
};
