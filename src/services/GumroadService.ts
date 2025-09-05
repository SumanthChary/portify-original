
export interface GumroadProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  url: string;
  download_url?: string;
  file_url?: string;
  created_at?: string;
  updated_at?: string;
  product_type?: string;
  custom_permalink?: string;
}

class GumroadService {
  private readonly baseUrl = "https://api.gumroad.com/v2";

  async getProducts(apiKey: string): Promise<GumroadProduct[]> {
    if (!apiKey) {
      throw new Error('Gumroad API key is required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Gumroad API key. Please check your credentials.');
        }
        if (response.status === 429) {
          throw new Error('Gumroad API rate limit exceeded. Please try again later.');
        }
        throw new Error(`Gumroad API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`Gumroad API returned error: ${data.message || 'Unknown error'}`);
      }

      // Handle both single product and products array
      const products = Array.isArray(data.products) ? data.products : [data.products].filter(Boolean);
      
      return products.map((product: any) => ({
        id: product.id,
        name: product.name || product.title || 'Untitled Product',
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        image: product.preview_url || product.image_url || product.image || '',
        url: product.short_url || product.url || '',
        download_url: product.file_url || product.download_url || '',
        file_url: product.file_url || product.download_url || '',
        created_at: product.created_at || new Date().toISOString(),
        updated_at: product.updated_at || new Date().toISOString(),
        product_type: product.product_type || 'digital',
        custom_permalink: product.custom_permalink || product.slug || ''
      }));
    } catch (error) {
      console.error('Error fetching Gumroad products:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch products from Gumroad API');
    }
  }

  async getProduct(productId: string, apiKey: string): Promise<GumroadProduct | null> {
    if (!apiKey) {
      throw new Error('Gumroad API key is required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.product) {
        return null;
      }

      const product = data.product;
      return {
        id: product.id,
        name: product.name || product.title || 'Untitled Product',
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        image: product.preview_url || product.image_url || product.image || '',
        url: product.short_url || product.url || '',
        download_url: product.file_url || product.download_url || '',
        file_url: product.file_url || product.download_url || '',
        created_at: product.created_at || new Date().toISOString(),
        updated_at: product.updated_at || new Date().toISOString(),
        product_type: product.product_type || 'digital',
        custom_permalink: product.custom_permalink || product.slug || ''
      };
    } catch (error) {
      console.error('Error fetching Gumroad product:', error);
      return null;
    }
  }
}

export default new GumroadService();
