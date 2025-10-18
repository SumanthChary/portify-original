import { supabase } from "@/integrations/supabase/client";
import { createMigrationSessionWithProducts, StoredUniversalProduct, UniversalProductInput } from "./MigrationSessionService";

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
  file_info: unknown;
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
  ): Promise<{ sessionId: string; products: StoredUniversalProduct[] }> {
    // Create migration session
    const mappedProducts: UniversalProductInput[] = products.map((product) => {
      const images = [
        ...(product.thumbnail_url ? [product.thumbnail_url] : []),
        ...(product.preview_url ? [product.preview_url] : [])
      ];

      const files = Array.isArray(product.file_info)
        ? product.file_info.map((item) =>
            typeof item === "string" ? item : JSON.stringify(item)
          )
        : product.file_info
          ? [
              typeof product.file_info === "string"
                ? product.file_info
                : JSON.stringify(product.file_info),
            ]
          : [];

      const tagsArray = Array.isArray(product.tags)
        ? product.tags
        : typeof product.tags === "string"
          ? product.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : [];

      return {
        source_product_id: product.id,
        title: product.name,
        description: product.description || "",
        price: product.price,
        images,
        files,
        variants: [],
        tags: tagsArray,
        category: product.product_type || "digital",
        status: product.published ? "active" : "draft",
      };
    });

    const { sessionId, products: storedProducts } = await createMigrationSessionWithProducts(
      userId,
      sourcePlatform,
      mappedProducts,
      { extracted: true }
    );

    return { sessionId, products: storedProducts };
  }
}

export const realGumroadService = new RealGumroadService();