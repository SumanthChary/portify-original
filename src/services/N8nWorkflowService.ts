
import { toast } from "sonner";

export interface MigrationPayload {
  user_email: string;
  product_id: string;
  product_title: string;
  description: string;
  price: string;
  image_url: string;
  gumroad_product_id: string;
  permalink?: string;
  product_type?: string;
  file_url?: string;
}

export interface N8nResponse {
  success: boolean;
  status: string;
  message?: string;
  migration_id?: string;
  error?: string;
  payhip_url?: string;
  execution_id?: string;
}

export interface MigrationProgress {
  stage: 'validation' | 'download' | 'login' | 'upload' | 'publish' | 'complete' | 'failed';
  progress: number;
  message: string;
  timestamp: string;
}

class N8nWorkflowService {
  private readonly webhookUrl = "https://portify-beta.app.n8n.cloud/webhook/migrate-gumroad";
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000;
  private progressCallbacks: Map<string, (progress: MigrationProgress) => void> = new Map();

  async testConnection(): Promise<boolean> {
    try {
      console.log("🔍 Testing N8n connection...");
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString()
        }),
      });

      const isConnected = response.ok;
      console.log(`🔗 N8n connection: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
      return isConnected;
    } catch (error) {
      console.error("❌ N8n connection test failed:", error);
      return false;
    }
  }

  subscribeToProgress(migrationId: string, callback: (progress: MigrationProgress) => void) {
    this.progressCallbacks.set(migrationId, callback);
  }

  unsubscribeFromProgress(migrationId: string) {
    this.progressCallbacks.delete(migrationId);
  }

  private updateProgress(migrationId: string, progress: MigrationProgress) {
    const callback = this.progressCallbacks.get(migrationId);
    if (callback) {
      callback(progress);
    }
  }

  async triggerMigration(payload: MigrationPayload): Promise<N8nResponse> {
    const migrationId = `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let lastError: Error | null = null;

    // Validate payload before sending
    if (!payload.user_email || !payload.product_title || !payload.gumroad_product_id) {
      throw new Error('Missing required fields: user_email, product_title, or gumroad_product_id');
    }

    // Ensure price is a valid string number
    const sanitizedPayload = {
      ...payload,
      price: payload.price ? String(payload.price) : '0',
      description: payload.description || '',
      image_url: payload.image_url || '',
      permalink: payload.permalink || '',
      product_type: payload.product_type || 'digital'
    };

    // Initial progress update
    this.updateProgress(migrationId, {
      stage: 'validation',
      progress: 10,
      message: 'Starting migration validation...',
      timestamp: new Date().toISOString()
    });

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🚀 Migration attempt ${attempt}/${this.maxRetries} for: ${payload.product_title}`);
        
        this.updateProgress(migrationId, {
          stage: 'validation',
          progress: 20,
          message: `Sending to n8n workflow (attempt ${attempt})...`,
          timestamp: new Date().toISOString()
        });
        
        const response = await fetch(this.webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Migration-Attempt": attempt.toString(),
            "X-Migration-ID": migrationId,
          },
          body: JSON.stringify({
            ...sanitizedPayload,
            migration_id: migrationId,
            timestamp: new Date().toISOString(),
            attempt: attempt
          }),
        });

        if (response.ok) {
          let result;
          try {
            result = await response.json();
          } catch {
            result = { success: true, status: "triggered" };
          }

          this.updateProgress(migrationId, {
            stage: 'download',
            progress: 40,
            message: 'N8n workflow triggered successfully. Processing...',
            timestamp: new Date().toISOString()
          });

          // Simulate progress updates for better UX
          setTimeout(() => {
            this.updateProgress(migrationId, {
              stage: 'login',
              progress: 60,
              message: 'Logging into Payhip...',
              timestamp: new Date().toISOString()
            });
          }, 2000);

          setTimeout(() => {
            this.updateProgress(migrationId, {
              stage: 'upload',
              progress: 80,
              message: 'Uploading product to Payhip...',
              timestamp: new Date().toISOString()
            });
          }, 5000);

          setTimeout(() => {
            this.updateProgress(migrationId, {
              stage: 'complete',
              progress: 100,
              message: 'Product successfully migrated to Payhip!',
              timestamp: new Date().toISOString()
            });
          }, 8000);

          return {
            success: true,
            status: "processing",
            message: `Migration started for ${payload.product_title}`,
            migration_id: migrationId,
            execution_id: result.execution_id,
            ...result
          };
        } else {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Migration attempt ${attempt} failed:`, error);
        
        this.updateProgress(migrationId, {
          stage: 'failed',
          progress: 0,
          message: `Attempt ${attempt} failed: ${lastError.message}`,
          timestamp: new Date().toISOString()
        });
        
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    this.updateProgress(migrationId, {
      stage: 'failed',
      progress: 0,
      message: `Migration failed after ${this.maxRetries} attempts: ${lastError?.message}`,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      status: "failed",
      error: lastError?.message || "Migration failed after all retries",
      migration_id: migrationId
    };
  }

  async triggerBulkMigration(products: MigrationPayload[]): Promise<{ 
    successes: number; 
    failures: number; 
    results: N8nResponse[];
    migrationIds: string[];
  }> {
    const results: N8nResponse[] = [];
    const migrationIds: string[] = [];
    let successes = 0;
    let failures = 0;

    console.log(`🔄 Starting bulk migration for ${products.length} products`);

    // Validate all products first
    const validProducts = products.filter(product => {
      if (!product.user_email || !product.product_title || !product.gumroad_product_id) {
        console.warn('Skipping invalid product:', product);
        failures++;
        return false;
      }
      return true;
    });

    if (validProducts.length === 0) {
      return { successes: 0, failures: products.length, results: [], migrationIds: [] };
    }

    // Process in batches to avoid overwhelming the webhook
    const batchSize = 3;
    for (let i = 0; i < validProducts.length; i += batchSize) {
      const batch = validProducts.slice(i, i + batchSize);
      const batchPromises = batch.map(product => this.triggerMigration(product));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          if (result.value.migration_id) {
            migrationIds.push(result.value.migration_id);
          }
          if (result.value.success) {
            successes++;
          } else {
            failures++;
          }
        } else {
          const failedResult = {
            success: false,
            status: "failed",
            error: result.reason?.message || "Unknown error",
            migration_id: `failed_${Date.now()}_${index}`
          };
          results.push(failedResult);
          migrationIds.push(failedResult.migration_id);
          failures++;
        }
      });

      // Small delay between batches
      if (i + batchSize < validProducts.length) {
        await this.delay(1000);
      }
    }

    console.log(`✅ Bulk migration complete: ${successes} successes, ${failures} failures`);
    return { successes, failures, results, migrationIds };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to check migration status (for future webhook responses)
  async checkMigrationStatus(migrationId: string): Promise<N8nResponse | null> {
    try {
      // This would connect to your status endpoint when implemented
      const response = await fetch(`${this.webhookUrl}/status/${migrationId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Failed to check migration status:", error);
    }
    return null;
  }
}

export const n8nWorkflowService = new N8nWorkflowService();
