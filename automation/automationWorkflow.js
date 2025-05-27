const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  WEBHOOK_URL: 'https://portify-beta.app.n8n.cloud/webhook/migrate-gumroad',
  COOKIE_PATH: '/tmp/payhip_cookies.json',
  RETRY_ATTEMPTS: 3,
  DELAY_BETWEEN_ATTEMPTS: 5000,
};

// Cookie management
const CookieManager = {
  save: async (cookies) => {
    try {
      await fs.promises.writeFile(CONFIG.COOKIE_PATH, JSON.stringify(cookies));
      console.log('✅ Cookies saved successfully');
    } catch (error) {
      console.error('❌ Error saving cookies:', error.message);
    }
  },

  load: async () => {
    try {
      const cookiesData = await fs.promises.readFile(CONFIG.COOKIE_PATH, 'utf8');
      return JSON.parse(cookiesData);
    } catch (error) {
      console.log('ℹ️ No saved cookies found');
      return null;
    }
  }
};

// Product data formatter
const formatProductData = (product) => ({
  title: product.title || product.name,
  description: product.description,
  price: product.price,
  file_url: product.file_url || product.download_url,
  image_url: product.image_url || product.preview_url,
  type: product.type || 'digital_product',
  permalink: product.permalink || product.slug,
  user_email: product.user_email || product.email,
  created_at: product.created_at || new Date().toISOString(),
  updated_at: product.updated_at || new Date().toISOString()
});

// Main automation handler
class AutomationHandler {
  constructor() {
    this.webhookUrl = CONFIG.WEBHOOK_URL;
  }

  async sendToN8N(productData) {
    const formattedData = formatProductData(productData);
    const cookies = await CookieManager.load();
    
    const payload = {
      ...formattedData,
      cookies,
      automation_settings: {
        headless: false,
        delayBetweenActions: 1500,
        maxRetries: CONFIG.RETRY_ATTEMPTS
      }
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Save new cookies if provided
      if (result.cookies) {
        await CookieManager.save(result.cookies);
      }

      return result;
    } catch (error) {
      console.error('Automation failed:', error);
      throw error;
    }
  }

  async migrateProduct(productData, retryCount = 0) {
    try {
      return await this.sendToN8N(productData);
    } catch (error) {
      if (retryCount < CONFIG.RETRY_ATTEMPTS) {
        console.log(`Retrying... Attempt ${retryCount + 1}/${CONFIG.RETRY_ATTEMPTS}`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_ATTEMPTS));
        return this.migrateProduct(productData, retryCount + 1);
      }
      throw error;
    }
  }
}

// Export the automation handler
module.exports = {
  AutomationHandler,
  CookieManager,
  CONFIG
};
