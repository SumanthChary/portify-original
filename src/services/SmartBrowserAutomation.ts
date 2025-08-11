import { supabase } from '@/integrations/supabase/client';

interface PlatformConfig {
  name: string;
  loginUrl: string;
  selectors: {
    email: string[];
    password: string[];
    loginButton: string[];
    productsPage: string[];
    productItems: string[];
    addProductButton: string[];
    productForm: {
      title: string[];
      description: string[];
      price: string[];
      image: string[];
      submitButton: string[];
    };
  };
}

export class SmartBrowserAutomation {
  private platformConfigs: Record<string, PlatformConfig> = {
    gumroad: {
      name: 'Gumroad',
      loginUrl: 'https://gumroad.com/login',
      selectors: {
        email: ['#email', 'input[name="email"]', '[data-testid="email"]'],
        password: ['#password', 'input[name="password"]', '[data-testid="password"]'],
        loginButton: ['button[type="submit"]', '.login-btn', '[data-testid="login"]'],
        productsPage: ['/products', '/dashboard'],
        productItems: ['.product-item', '.product-card', '[data-testid="product"]'],
        addProductButton: ['.add-product', '[href*="new"]', '[data-testid="add-product"]'],
        productForm: {
          title: ['#product_name', 'input[name="name"]', '[data-testid="title"]'],
          description: ['#description', 'textarea[name="description"]', '[data-testid="description"]'],
          price: ['#price', 'input[name="price"]', '[data-testid="price"]'],
          image: ['#image', 'input[type="file"]', '[data-testid="image"]'],
          submitButton: ['button[type="submit"]', '.publish-btn', '[data-testid="submit"]']
        }
      }
    },
    payhip: {
      name: 'Payhip',
      loginUrl: 'https://payhip.com/login',
      selectors: {
        email: ['#email', 'input[name="email"]'],
        password: ['#password', 'input[name="password"]'],
        loginButton: ['button[type="submit"]', '.btn-primary'],
        productsPage: ['/products', '/dashboard'],
        productItems: ['.product-item', '.product-card'],
        addProductButton: ['.add-product', 'a[href*="new"]'],
        productForm: {
          title: ['#product_name', 'input[name="name"]'],
          description: ['#product_description', 'textarea[name="description"]'],
          price: ['#product_price', 'input[name="price"]'],
          image: ['#product_image', 'input[type="file"]'],
          submitButton: ['button[type="submit"]', '.btn-publish']
        }
      }
    },
    teachable: {
      name: 'Teachable',
      loginUrl: 'https://teachable.com/login',
      selectors: {
        email: ['#email', 'input[name="email"]'],
        password: ['#password', 'input[name="password"]'],
        loginButton: ['button[type="submit"]', '.btn-primary'],
        productsPage: ['/courses', '/admin/courses'],
        productItems: ['.course-item', '.course-card'],
        addProductButton: ['.add-course', 'a[href*="new"]'],
        productForm: {
          title: ['#course_name', 'input[name="name"]'],
          description: ['#course_description', 'textarea[name="description"]'],
          price: ['#course_price', 'input[name="price"]'],
          image: ['#course_image', 'input[type="file"]'],
          submitButton: ['button[type="submit"]', '.btn-publish']
        }
      }
    }
  };

  async startSmartMigration(
    sourcePlatform: string,
    destPlatform: string,
    sourceCredentials: { email: string; password: string },
    destCredentials: { email: string; password: string }
  ): Promise<{ success: boolean; message: string; data?: any }> {
    
    const migrationPayload = {
      action: 'smart_browser_migration',
      sourcePlatform,
      destPlatform,
      sourceCredentials,
      destCredentials,
      platformConfigs: this.platformConfigs
    };

    try {
      // Send to N8n webhook for browser automation
      const response = await fetch('https://portify-o1.app.n8n.cloud/webhook/smart-browser-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(migrationPayload)
      });

      if (!response.ok) {
        throw new Error(`Migration failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Store migration session in Supabase
      await this.storeMigrationSession({
        sourcePlatform,
        destPlatform,
        status: result.success ? 'completed' : 'failed',
        result
      });

      return result;

    } catch (error) {
      console.error('Smart migration error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Migration failed'
      };
    }
  }

  private async storeMigrationSession(data: any) {
    try {
      await supabase
        .from('migration_sessions')
        .insert({
          session_id: `session_${Date.now()}`,
          user_id: '00000000-0000-0000-0000-000000000000',
          source_platform: data.sourcePlatform,
          destination_platform: data.destPlatform,
          credentials: JSON.stringify({ encrypted: true }),
          status: data.status,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store migration session:', error);
    }
  }

  getSupportedPlatforms(): string[] {
    return Object.keys(this.platformConfigs);
  }

  getPlatformConfig(platform: string): PlatformConfig | null {
    return this.platformConfigs[platform] || null;
  }
}

export const smartBrowserAutomation = new SmartBrowserAutomation();