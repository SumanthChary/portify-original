
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
}

export interface N8nResponse {
  success: boolean;
  status: string;
  message?: string;
  migration_id?: string;
  error?: string;
}

class N8nWorkflowService {
  private readonly webhookUrl = "https://portify-beta.app.n8n.cloud/webhook/migrate-gumroad";
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds

  async testConnection(): Promise<boolean> {
    try {
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

      return response.ok;
    } catch (error) {
      console.error("N8n connection test failed:", error);
      return false;
    }
  }

  async triggerMigration(payload: MigrationPayload): Promise<N8nResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Migration attempt ${attempt}/${this.maxRetries} for product:`, payload.product_title);
        
        const response = await fetch(this.webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Migration-Attempt": attempt.toString(),
          },
          body: JSON.stringify({
            ...payload,
            timestamp: new Date().toISOString(),
            attempt: attempt
          }),
        });

        if (response.ok) {
          const result = await response.json().catch(() => ({ success: true, status: "triggered" }));
          return {
            success: true,
            status: "triggered",
            message: `Migration started for ${payload.product_title}`,
            migration_id: result.migration_id || `migration_${Date.now()}`,
            ...result
          };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`Migration attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    return {
      success: false,
      status: "failed",
      error: lastError?.message || "Migration failed after all retries"
    };
  }

  async triggerBulkMigration(products: MigrationPayload[]): Promise<{ successes: number; failures: number; results: N8nResponse[] }> {
    const results: N8nResponse[] = [];
    let successes = 0;
    let failures = 0;

    // Process in batches to avoid overwhelming the webhook
    const batchSize = 3;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchPromises = batch.map(product => this.triggerMigration(product));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          if (result.value.success) {
            successes++;
          } else {
            failures++;
          }
        } else {
          results.push({
            success: false,
            status: "failed",
            error: result.reason?.message || "Unknown error"
          });
          failures++;
        }
      });

      // Small delay between batches
      if (i + batchSize < products.length) {
        await this.delay(1000);
      }
    }

    return { successes, failures, results };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const n8nWorkflowService = new N8nWorkflowService();
