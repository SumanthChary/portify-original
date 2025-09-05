import { chromium } from 'playwright';
import { promises as fs } from 'fs';

// Use environment variables for secure credentials
const PAYHIP_CONFIG = {
  credentials: {
    email: process.env.PAYHIP_EMAIL || 'enjoywithpandu@gmail.com',
    password: process.env.PAYHIP_PASSWORD || 'phc@12345'
  },
  selectors: {
    login: {
      emailInput: ['#email', 'input[name="email"]', '[data-testid="email"]'],
      passwordInput: ['#password', 'input[name="password"]', '[data-testid="password"]'],
      submitButton: ['button[type="submit"]', '.btn-primary', '[data-testid="login"]']
    },
    product: {
      nameInput: ['#product_name', 'input[name="name"]', '[data-testid="product-name"]'],
      descriptionInput: ['#product_description', 'textarea[name="description"]', '[data-testid="description"]'],
      priceInput: ['#product_price', 'input[name="price"]', '[data-testid="price"]'],
      fileInput: ['#product_file', 'input[type="file"]', '[data-testid="file-upload"]'],
      submitButton: ['button[type="submit"]', '.btn-publish', '[data-testid="submit"]']
    }
  },
  urls: {
    login: 'https://payhip.com/login',
    newProduct: 'https://payhip.com/products/new'
  },
  delays: {
    typing: 800,
    navigation: 2000,
    upload: 5000,
    retry: 1000
  }
};

class PayhipAutomation {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init() {
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox']
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.context.newPage();
  }

  async tryMultipleSelectors(selectors, action = 'find') {
    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          return { element, selector };
        }
      } catch (e) {
        continue;
      }
    }
    throw new Error(`None of the selectors found: ${selectors.join(', ')}`);
  }

  async fillFieldSafely(selectors, value) {
    const { element, selector } = await this.tryMultipleSelectors(selectors);
    await this.page.fill(selector, value);
    await this.page.waitForTimeout(PAYHIP_CONFIG.delays.typing);
  }

  async clickSafely(selectors) {
    const { selector } = await this.tryMultipleSelectors(selectors);
    await this.page.click(selector);
  }

  async loadCookies() {
    try {
      const cookies = JSON.parse(await fs.readFile('/tmp/payhip_cookies.json', 'utf8'));
      await this.context.addCookies(cookies);
      return true;
    } catch (e) {
      console.log('No saved cookies found');
      return false;
    }
  }

  async saveCookies() {
    const cookies = await this.context.cookies();
    await fs.writeFile('/tmp/payhip_cookies.json', JSON.stringify(cookies));
  }

  async login() {
    await this.page.goto(PAYHIP_CONFIG.urls.login);
    await this.page.waitForTimeout(PAYHIP_CONFIG.delays.navigation);

    try {
      console.log('Logging in to Payhip...');
      await this.fillFieldSafely(
        PAYHIP_CONFIG.selectors.login.emailInput, 
        PAYHIP_CONFIG.credentials.email
      );
      
      await this.fillFieldSafely(
        PAYHIP_CONFIG.selectors.login.passwordInput, 
        PAYHIP_CONFIG.credentials.password
      );
      
      await this.clickSafely(PAYHIP_CONFIG.selectors.login.submitButton);
      await this.page.waitForNavigation({ timeout: 10000 });
      
      await this.saveCookies();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  async uploadProduct(productData) {
    try {
      await this.init();
      await this.loadCookies();
      
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        throw new Error('Failed to login to Payhip');
      }

      console.log('Navigating to new product page...');
      await this.page.goto(PAYHIP_CONFIG.urls.newProduct);
      await this.page.waitForTimeout(PAYHIP_CONFIG.delays.navigation);

      console.log('Filling product details...');
      await this.fillFieldSafely(
        PAYHIP_CONFIG.selectors.product.nameInput, 
        productData.title
      );

      await this.fillFieldSafely(
        PAYHIP_CONFIG.selectors.product.descriptionInput, 
        productData.description
      );

      await this.fillFieldSafely(
        PAYHIP_CONFIG.selectors.product.priceInput, 
        productData.price.toString()
      );

      if (productData.file_path) {
        console.log('Uploading product file...');
        const { selector } = await this.tryMultipleSelectors(PAYHIP_CONFIG.selectors.product.fileInput);
        await this.page.setInputFiles(selector, productData.file_path);
        await this.page.waitForTimeout(PAYHIP_CONFIG.delays.upload);
      }

      console.log('Submitting product...');
      await this.clickSafely(PAYHIP_CONFIG.selectors.product.submitButton);
      await this.page.waitForNavigation({ timeout: 15000 });

      return { success: true, message: 'Product uploaded successfully' };
    } catch (error) {
      console.error('Upload failed:', error.message);
      return { success: false, message: error.message };
    } finally {
      await this.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export { PayhipAutomation, PAYHIP_CONFIG };
