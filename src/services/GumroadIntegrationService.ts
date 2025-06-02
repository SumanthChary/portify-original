
import { supabase } from "@/integrations/supabase/client";

interface GumroadProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  url: string;
  preview_url?: string;
  file_url?: string;
  sales_count: number;
  published: boolean;
}

interface GumroadApiResponse {
  success: boolean;
  products: GumroadProduct[];
}

export class GumroadIntegrationService {
  
  /**
   * Fetch products from Gumroad API and store in database
   * Note: This requires a Gumroad API key
   */
  async fetchAndStoreGumroadProducts(accessToken: string): Promise<void> {
    try {
      // Fetch products from Gumroad API
      const response = await fetch('https://api.gumroad.com/v2/products', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products from Gumroad');
      }

      const data: GumroadApiResponse = await response.json();

      // Store products in our database
      for (const product of data.products) {
        await this.storeProductInDatabase(product);
      }

    } catch (error) {
      console.error('Error fetching Gumroad products:', error);
      throw error;
    }
  }

  /**
   * Store a single product in the database
   */
  private async storeProductInDatabase(product: GumroadProduct): Promise<void> {
    const { error } = await supabase
      .from('migrations')
      .upsert({
        gumroad_product_id: product.id,
        product_title: product.name,
        description: product.description,
        price: (product.price / 100).toString(), // Convert cents to dollars
        image_url: product.preview_url || '',
        permalink: product.url,
        user_email: 'imported@gumroad.com', // Default email for imported products
        status: 'pending',
        product_type: 'digital'
      }, {
        onConflict: 'gumroad_product_id'
      });

    if (error) {
      console.error('Error storing product:', error);
      throw error;
    }
  }

  /**
   * Send product data to N8N webhook for Payhip migration
   */
  async sendToN8nForPayhipMigration(productId: string): Promise<boolean> {
    try {
      // Get product from database
      const { data: product, error } = await supabase
        .from('migrations')
        .select('*')
        .eq('id', productId)
        .single();

      if (error || !product) {
        throw new Error('Product not found');
      }

      // Send to N8N webhook
      const response = await fetch('https://portify-original.app.n8n.cloud/webhook/migrate-gumroad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: product.id,
          name: product.product_title,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          gumroad_product_id: product.gumroad_product_id,
          user_email: product.user_email,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending to N8N:', error);
      return false;
    }
  }
}

export const gumroadIntegrationService = new GumroadIntegrationService();
