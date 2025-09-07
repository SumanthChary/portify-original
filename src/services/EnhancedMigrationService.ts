import { supabase } from "@/integrations/supabase/client";

export interface PlatformConfig {
  name: string;
  type: 'api' | 'browser' | 'both';
  apiFields?: { key: string; label: string; type: string }[];
  browserFields?: { key: string; label: string; type: string }[];
  extractUrl?: string;
  loginUrl?: string;
}

export interface MigrationJob {
  id: string;
  sessionId: string;
  productId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  message?: string;
  payhipUrl?: string;
  createdAt: string;
  updatedAt: string;
}

class EnhancedMigrationService {
  private platformConfigs: Record<string, PlatformConfig> = {
    gumroad: {
      name: 'Gumroad',
      type: 'api',
      apiFields: [{ key: 'apiKey', label: 'API Key', type: 'text' }],
      extractUrl: 'https://api.gumroad.com/v2/products'
    },
    shopify: {
      name: 'Shopify',
      type: 'both',
      apiFields: [
        { key: 'storeUrl', label: 'Store URL', type: 'text' },
        { key: 'accessToken', label: 'Access Token', type: 'text' }
      ],
      browserFields: [
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'password', label: 'Password', type: 'password' }
      ]
    },
    woocommerce: {
      name: 'WooCommerce',
      type: 'both',
      apiFields: [
        { key: 'storeUrl', label: 'Store URL', type: 'text' },
        { key: 'consumerKey', label: 'Consumer Key', type: 'text' },
        { key: 'consumerSecret', label: 'Consumer Secret', type: 'password' }
      ],
      browserFields: [
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'password', label: 'Password', type: 'password' }
      ]
    },
    etsy: {
      name: 'Etsy',
      type: 'both',
      apiFields: [
        { key: 'apiKey', label: 'API Key', type: 'text' },
        { key: 'shopId', label: 'Shop ID', type: 'text' }
      ],
      browserFields: [
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'password', label: 'Password', type: 'password' }
      ]
    },
    teachable: {
      name: 'Teachable',
      type: 'browser',
      browserFields: [
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'password', label: 'Password', type: 'password' }
      ],
      loginUrl: 'https://teachable.com/login'
    },
    thinkific: {
      name: 'Thinkific',
      type: 'browser',
      browserFields: [
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'password', label: 'Password', type: 'password' }
      ],
      loginUrl: 'https://thinkific.com/login'
    },
    payhip: {
      name: 'Payhip',
      type: 'browser',
      browserFields: [
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'password', label: 'Password', type: 'password' }
      ],
      loginUrl: 'https://payhip.com/login'
    }
  };

  async extractFromAPI(platform: string, credentials: Record<string, string>): Promise<any[]> {
    const config = this.platformConfigs[platform];
    if (!config || config.type === 'browser') {
      throw new Error(`API extraction not supported for ${platform}`);
    }

    if (platform === 'gumroad') {
      const response = await fetch(`${config.extractUrl}?access_token=${credentials.apiKey}`);
      if (!response.ok) {
        throw new Error('Failed to extract from Gumroad API');
      }
      const data = await response.json();
      return data.products || [];
    }

    if (platform === 'shopify') {
      const response = await fetch(`${credentials.storeUrl}/admin/api/2023-10/products.json`, {
        headers: {
          'X-Shopify-Access-Token': credentials.accessToken,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to extract from Shopify API');
      }
      const data = await response.json();
      return data.products || [];
    }

    // Add more platform API implementations as needed
    throw new Error(`API extraction for ${platform} not implemented yet`);
  }

  async extractViaBrowser(platform: string, credentials: Record<string, string>): Promise<any[]> {
    // Use Supabase edge function for browser automation
    const { data, error } = await supabase.functions.invoke('browser-automation', {
      body: {
        platform,
        credentials,
        action: 'extract'
      }
    });

    if (error) {
      throw error;
    }

    return data?.products || [];
  }

  async migrateToPayhip(
    sessionId: string,
    products: any[], 
    useZapier?: boolean, 
    zapierWebhookUrl?: string
  ): Promise<void> {
    if (useZapier && zapierWebhookUrl) {
      // Use Zapier orchestration
      await fetch(zapierWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          sessionId,
          products,
          destinationPlatform: 'payhip',
          timestamp: new Date().toISOString()
        }),
      });
    } else {
      // Direct migration via edge function
      const { error } = await supabase.functions.invoke('payhip-automation', {
        body: {
          sessionId,
          products,
          destinationPlatform: 'payhip'
        }
      });

      if (error) {
        throw error;
      }
    }
  }

  async downloadAsset(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download asset from ${url}`);
    }
    return response.blob();
  }

  getPlatformConfig(platform: string): PlatformConfig | null {
    return this.platformConfigs[platform] || null;
  }

  getSupportedPlatforms(): string[] {
    return Object.keys(this.platformConfigs);
  }
}

export const enhancedMigrationService = new EnhancedMigrationService();