import { migrateProduct } from './ProductMigrationService.js';

class MigrationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.results = new Map();
  }

  async addToQueue(product) {
    this.queue.push(product);
    this.results.set(product.id || product.title, { status: 'queued' });
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const product = this.queue.shift();
      const id = product.id || product.title;
      
      try {
        console.log(`Processing: ${product.title}`);
        this.results.set(id, { status: 'processing' });
        
        const result = await migrateProduct(product);
        
        this.results.set(id, { 
          status: result.success ? 'completed' : 'failed',
          ...result 
        });

        // Wait between products to avoid triggering anti-bot measures
        await new Promise(resolve => setTimeout(resolve, 30000));
      } catch (error) {
        console.error(`Failed to process ${product.title}:`, error);
        this.results.set(id, { 
          status: 'failed',
          error: error.message 
        });
      }
    }
    
    this.isProcessing = false;
  }

  getStatus(productId) {
    return this.results.get(productId);
  }

  getAllStatuses() {
    return Object.fromEntries(this.results);
  }
}

// Export a singleton instance
export const migrationQueue = new MigrationQueue();
