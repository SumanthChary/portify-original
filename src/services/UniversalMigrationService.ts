import { supabase } from '@/integrations/supabase/client';

export interface PlatformCredentials {
  platform: string;
  email: string;
  password: string;
  apiKey?: string;
  isConnected: boolean;
  connectionType: 'api' | 'browser';
}

export interface MigrationSession {
  sessionId: string;
  userId: string;
  sourcePlatform: string;
  destinationPlatform: string;
  credentials: Record<string, PlatformCredentials>;
  status: 'pending' | 'authenticated' | 'migrating' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface UniversalProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  files: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
  variants?: Array<{
    name: string;
    options: string[];
  }>;
  tags: string[];
  category: string;
  status: 'active' | 'draft' | 'archived';
  sourcePlatform: string;
  sourceProductId: string;
}

export interface MigrationPayload {
  sessionId: string;
  products: UniversalProduct[];
  migrationOptions: {
    transferImages: boolean;
    transferFiles: boolean;
    transferVariants: boolean;
    optimizeForDestination: boolean;
  };
}

class UniversalMigrationService {
  private readonly webhookUrl = 'https://portify-o1.app.n8n.cloud/webhook/universal-migrate';

  async createMigrationSession(
    sourcePlatform: string, 
    destinationPlatform: string,
    credentials: Record<string, PlatformCredentials>
  ): Promise<MigrationSession> {
    const sessionId = crypto.randomUUID();
    
    // Store encrypted credentials in Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated. Please log in first.');
    }

    const { data, error } = await supabase
      .from('migration_sessions')
      .insert({
        session_id: sessionId,
        user_id: userData.user.id, // Guaranteed to exist
        source_platform: sourcePlatform,
        destination_platform: destinationPlatform,
        credentials: this.encryptCredentials(credentials),
        status: 'authenticated', // Valid status value
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create migration session: ${error.message}`);
    }

    return {
      sessionId,
      userId: data.user_id,
      sourcePlatform,
      destinationPlatform,
      credentials,
      status: 'authenticated',
      createdAt: data.created_at
    };
  }

  async authenticateAllPlatforms(credentials: Record<string, PlatformCredentials>): Promise<boolean> {
    try {
      // Authenticate with SaaS platform
      await this.authenticateSaaS(credentials.saas);
      
      // Authenticate with source platform (API or browser)
      if (credentials.source.connectionType === 'api') {
        await this.authenticateViaAPI(credentials.source);
      } else {
        await this.authenticateViaBrowser(credentials.source);
      }
      
      // Authenticate with destination platform (browser automation)
      await this.authenticateViaBrowser(credentials.destination);
      
      return true;
    } catch (error) {
      console.error('Multi-platform authentication failed:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async startUniversalMigration(payload: MigrationPayload): Promise<{
    success: boolean;
    migrationId: string;
    message: string;
  }> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'universal_migrate',
          ...payload,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`N8n webhook request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        migrationId: result.migrationId || payload.sessionId,
        message: result.message || 'Universal migration started successfully'
      };
    } catch (error) {
      console.error('Universal migration failed:', error);
      throw new Error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractProductsFromPlatform(
    platform: string, 
    credentials: PlatformCredentials
  ): Promise<UniversalProduct[]> {
    if (credentials.connectionType === 'api') {
      return await this.extractViaAPI(platform, credentials);
    } else {
      return await this.extractViaBrowser(platform, credentials);
    }
  }

  private async authenticateSaaS(credentials: PlatformCredentials): Promise<void> {
    // Authenticate with Portify SaaS platform
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      throw new Error(`SaaS authentication failed: ${error.message}`);
    }
  }

  private async authenticateViaAPI(credentials: PlatformCredentials): Promise<void> {
    // Call N8n workflow for API authentication
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'authenticate_api',
        platform: credentials.platform,
        apiKey: credentials.apiKey,
        email: credentials.email,
        password: credentials.password
      })
    });

    if (!response.ok) {
      throw new Error(`API authentication failed for ${credentials.platform}`);
    }
  }

  private async authenticateViaBrowser(credentials: PlatformCredentials): Promise<void> {
    // Call N8n workflow for browser authentication
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'authenticate_browser',
        platform: credentials.platform,
        email: credentials.email,
        password: credentials.password
      })
    });

    if (!response.ok) {
      throw new Error(`Browser authentication failed for ${credentials.platform}`);
    }
  }

  private async extractViaAPI(
    platform: string, 
    credentials: PlatformCredentials
  ): Promise<UniversalProduct[]> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'extract_products_api',
        platform,
        credentials: {
          apiKey: credentials.apiKey,
          email: credentials.email
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API product extraction failed for ${platform}`);
    }

    const result = await response.json();
    return result.products || [];
  }

  private async extractViaBrowser(
    platform: string, 
    credentials: PlatformCredentials
  ): Promise<UniversalProduct[]> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'extract_products_browser',
        platform,
        credentials: {
          email: credentials.email,
          password: credentials.password
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Browser product extraction failed for ${platform}`);
    }

    const result = await response.json();
    return result.products || [];
  }

  private encryptCredentials(credentials: Record<string, PlatformCredentials>): string {
    // Simple base64 encoding - in production, use proper encryption
    return btoa(JSON.stringify(credentials));
  }

  private decryptCredentials(credentialsData: any): Record<string, PlatformCredentials> {
    // Handle both old string format and new JSONB format
    if (typeof credentialsData === 'string') {
      return JSON.parse(atob(credentialsData));
    }
    // New JSONB format - return directly
    return credentialsData || {};
  }

  async getMigrationSession(sessionId: string): Promise<MigrationSession | null> {
    const { data, error } = await supabase
      .from('migration_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) return null;

    return {
      sessionId: data.session_id,
      userId: data.user_id,
      sourcePlatform: data.source_platform,
      destinationPlatform: data.destination_platform,
      credentials: this.decryptCredentials(data.credentials),
      status: data.status as MigrationSession['status'],
      createdAt: data.created_at,
      completedAt: data.completed_at
    };
  }

  async updateMigrationStatus(
    sessionId: string, 
    status: MigrationSession['status'],
    completedAt?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('migration_sessions')
      .update({
        status,
        completed_at: completedAt,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (error) {
      throw new Error(`Failed to update migration status: ${error.message}`);
    }
  }
}

export const universalMigrationService = new UniversalMigrationService();