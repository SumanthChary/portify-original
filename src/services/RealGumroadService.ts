import { supabase } from "@/integrations/supabase/client";

export interface GumroadProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  url: string;
  preview_url?: string;
  thumbnail_url?: string;
  tags?: string | string[];
  formatted_price: string;
  file_info: any;
  sales_count: number;
  product_type: string;
  custom_permalink?: string;
  shown_on_profile: boolean;
  published: boolean;
  can_discount: boolean;
  max_discount_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface GumroadApiResponse {
  success: boolean;
  products: GumroadProduct[];
}

export class RealGumroadService {
  private baseUrl = 'https://api.gumroad.com/v2';

  async extractProducts(apiKey: string): Promise<GumroadProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Gumroad API key. Please check your credentials.');
        }
        throw new Error(`Gumroad API error: ${response.status} ${response.statusText}`);
      }

      const data: GumroadApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch products from Gumroad API');
      }

      return data.products || [];
    } catch (error) {
      console.error('Gumroad extraction error:', error);
      throw error;
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async storeExtractionSession(
    userId: string,
    products: GumroadProduct[],
    sourcePlatform: string
  ): Promise<string> {
    // Create migration session
    const sessionId = crypto.randomUUID();
    
    const { error: sessionError } = await supabase
      .from('migration_sessions')
      .insert({
        session_id: sessionId,
        user_id: userId,
        source_platform: sourcePlatform,
        destination_platform: '', // Will be set later
        credentials: JSON.stringify({ extracted: true }),
        status: 'extracted'
      });

    if (sessionError) {
      throw new Error(`Failed to create migration session: ${sessionError.message}`);
    }

    // Store extracted products
    const universalProducts = products.map(product => ({
      session_id: sessionId,
      source_product_id: product.id,
      source_platform: sourcePlatform,
      title: product.name,
      description: product.description || '',
      price: product.price,
      images: JSON.stringify([
        ...(product.thumbnail_url ? [product.thumbnail_url] : []),
        ...(product.preview_url ? [product.preview_url] : [])
      ]),
      files: JSON.stringify(product.file_info || []),
      variants: JSON.stringify([]),
      tags: Array.isArray(product.tags) ? product.tags : (typeof product.tags === 'string' ? product.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []),
      category: product.product_type || 'digital',
      status: product.published ? 'active' : 'draft',
      migration_status: 'ready'
    }));

    const { error: productsError } = await supabase
      .from('universal_products')
      .insert(universalProducts);

    if (productsError) {
      throw new Error(`Failed to store products: ${productsError.message}`);
    }

    return sessionId;
  }
}

export const realGumroadService = new RealGumroadService();