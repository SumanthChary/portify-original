import { supabase } from "@/integrations/supabase/client";

export interface PayhipProduct {
  id?: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  file_url?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'active' | 'archived';
}

export interface PayhipCredentials {
  email: string;
  password: string;
}

export interface PayhipMigrationResult {
  success: boolean;
  message: string;
  productId?: string;
  errorCode?: string;
  details?: any;
}

export class PayhipService {
  private readonly baseConfig = {
    loginUrl: 'https://payhip.com/login',
    newProductUrl: 'https://payhip.com/products/new',
    dashboardUrl: 'https://payhip.com/dashboard',
    
    // Modern, robust selectors that work with current Payhip
    selectors: {
      login: {
        email: ['#email', 'input[name="email"]', '[data-testid="email"]', 'input[type="email"]'],
        password: ['#password', 'input[name="password"]', '[data-testid="password"]', 'input[type="password"]'],
        submit: ['button[type="submit"]', '.btn-primary', '[data-testid="login-submit"]', '.login-button']
      },
      product: {
        name: ['#product_name', 'input[name="name"]', '[data-testid="product-name"]', 'input[placeholder*="name"]'],
        description: ['#product_description', 'textarea[name="description"]', '[data-testid="description"]'],
        price: ['#product_price', 'input[name="price"]', '[data-testid="price"]', 'input[type="number"]'],
        image: ['#product_image', 'input[type="file"]', '[data-testid="image-upload"]'],
        file: ['#product_file', 'input[accept*="zip"]', '[data-testid="file-upload"]'],
        category: ['#product_category', 'select[name="category"]', '[data-testid="category"]'],
        submit: ['button[type="submit"]', '.btn-publish', '[data-testid="publish"]', '.publish-button']
      },
      dashboard: {
        products: ['.product-item', '.product-card', '[data-testid="product"]'],
        addProduct: ['.add-product', '[href*="new"]', '[data-testid="add-product"]']
      }
    },

    // Timing configurations for reliable automation
    timing: {
      pageLoad: 3000,
      fieldInput: 500,
      fileUpload: 5000,
      formSubmit: 2000,
      navigation: 4000
    }
  };

  async validateCredentials(credentials: PayhipCredentials): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke('payhip-automation', {
        body: {
          action: 'validate-credentials',
          credentials
        }
      });

      return response.data?.valid === true;
    } catch (error) {
      console.error('Payhip credential validation failed:', error);
      return false;
    }
  }

  async migrateProduct(
    product: PayhipProduct,
    credentials: PayhipCredentials
  ): Promise<PayhipMigrationResult> {
    try {
      const response = await supabase.functions.invoke('payhip-automation', {
        body: {
          action: 'migrate-product',
          product: this.sanitizeProduct(product),
          credentials,
          config: this.baseConfig
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Migration failed');
      }

      return {
        success: true,
        message: `Successfully migrated: ${product.name}`,
        productId: response.data?.productId,
        details: response.data
      };
    } catch (error) {
      console.error('Payhip migration error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Migration failed',
        errorCode: 'MIGRATION_ERROR',
        details: error
      };
    }
  }

  async migrateBatch(
    products: PayhipProduct[],
    credentials: PayhipCredentials,
    onProgress?: (current: number, total: number, product: PayhipProduct) => void
  ): Promise<PayhipMigrationResult[]> {
    const results: PayhipMigrationResult[] = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      if (onProgress) {
        onProgress(i + 1, products.length, product);
      }

      try {
        const result = await this.migrateProduct(product, credentials);
        results.push(result);
        
        // Add delay between products to avoid rate limiting
        if (i < products.length - 1) {
          await this.delay(2000);
        }
      } catch (error) {
        results.push({
          success: false,
          message: `Failed to migrate: ${product.name}`,
          errorCode: 'BATCH_ERROR',
          details: error
        });
      }
    }

    return results;
  }

  async getProductsList(credentials: PayhipCredentials): Promise<PayhipProduct[]> {
    try {
      const response = await supabase.functions.invoke('payhip-automation', {
        body: {
          action: 'get-products',
          credentials,
          config: this.baseConfig
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch products');
      }

      return response.data?.products || [];
    } catch (error) {
      console.error('Failed to fetch Payhip products:', error);
      return [];
    }
  }

  private sanitizeProduct(product: PayhipProduct): PayhipProduct {
    return {
      ...product,
      name: product.name?.trim() || 'Untitled Product',
      description: product.description?.trim() || '',
      price: Math.max(0, Number(product.price) || 0),
      tags: Array.isArray(product.tags) ? product.tags.filter(tag => tag?.trim()) : [],
      status: product.status || 'draft'
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getConfig() {
    return this.baseConfig;
  }

  // Utility method to check if Payhip is accessible
  async checkServiceStatus(): Promise<{ available: boolean; message: string }> {
    try {
      const response = await fetch(this.baseConfig.loginUrl, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      return {
        available: true,
        message: 'Payhip service is accessible'
      };
    } catch (error) {
      return {
        available: false,
        message: 'Payhip service may be unavailable'
      };
    }
  }
}

export const payhipService = new PayhipService();