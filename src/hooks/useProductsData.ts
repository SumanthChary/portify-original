
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Define the Product type to match the database structure
export type Product = Database['public']['Tables']['migrations']['Row'];

interface UseProductsDataProps {
  preview?: string;
  previewId?: string;
  userEmail?: string;
}

export const useProductsData = ({ preview, previewId, userEmail }: UseProductsDataProps = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching products with params:", { preview, previewId, userEmail });
      
      let query = supabase
        .from('migrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If preview ID is specified, filter by that ID
      if (previewId) {
        query = query.eq('id', previewId);
      }
      
      // If user email is specified, filter by user email
      if (userEmail) {
        query = query.eq('user_email', userEmail);
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

  const addProduct = async (productData: Partial<Product>) => {
    try {
      // Ensure required fields are present
      const productToInsert = {
        product_title: productData.product_title || '',
        user_email: productData.user_email || '',
        gumroad_product_id: productData.gumroad_product_id || `manual-${Date.now()}`,
        description: productData.description || null,
        price: productData.price || null,
        product_type: productData.product_type || 'digital',
        image_url: productData.image_url || null,
        permalink: productData.permalink || null,
        status: productData.status || 'pending',
        created_at: productData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('migrations')
        .insert([productToInsert])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setProducts(prev => [data[0], ...prev]);
        return data[0];
      }
    } catch (err: any) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('migrations')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setProducts(prev => prev.map(p => p.id === id ? data[0] : p));
        return data[0];
      }
    } catch (err: any) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [previewId, preview, userEmail]);

  return { 
    products, 
    loading, 
    error, 
    refreshProducts: fetchProducts,
    addProduct,
    updateProduct
  };
};
