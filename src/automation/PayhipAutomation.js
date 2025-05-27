import { chromium } from 'playwright';
import { promises as fs } from 'fs';

const PAYHIP_CONFIG = {
  credentials: {
    email: 'enjoywithpandu@gmail.com',
    password: 'phc@12345'
  },
  selectors: {
    login: {
      emailInput: '#email',
      passwordInput: '#password',
      submitButton: 'button[type="submit"]'
    },
    product: {
      nameInput: '#product_name',
      descriptionInput: '#product_description',
      priceInput: '#product_price',
      fileInput: '#product_file',
      submitButton: 'button[type="submit"]'
    }
  },
  urls: {
    login: 'https://payhip.com/login',
    newProduct: 'https://payhip.com/products/new'
  },
  delays: {
    typing: 1500,
    navigation: 2000,
    upload: 5000
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

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
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

    const loginForm = await this.page.$(PAYHIP_CONFIG.selectors.login.emailInput);
    if (loginForm) {
      console.log('Logging in to Payhip...');
      await this.page.fill(PAYHIP_CONFIG.selectors.login.emailInput, PAYHIP_CONFIG.credentials.email);
      await this.page.waitForTimeout(PAYHIP_CONFIG.delays.typing);
      
      await this.page.fill(PAYHIP_CONFIG.selectors.login.passwordInput, PAYHIP_CONFIG.credentials.password);
      await this.page.waitForTimeout(PAYHIP_CONFIG.delays.typing);
      
      await this.page.click(PAYHIP_CONFIG.selectors.login.submitButton);
      await this.page.waitForNavigation();
      
      await this.saveCookies();
    }
  }

  async uploadProduct(productData) {
    try {
      await this.init();
      await this.loadCookies();
      await this.login();

      console.log('Navigating to new product page...');
      await this.page.goto(PAYHIP_CONFIG.urls.newProduct);
      await this.page.waitForTimeout(PAYHIP_CONFIG.delays.navigation);

      console.log('Filling product details...');
      await this.page.fill(PAYHIP_CONFIG.selectors.product.nameInput, productData.title);
      await this.page.waitForTimeout(PAYHIP_CONFIG.delays.typing);

      await this.page.fill(PAYHIP_CONFIG.selectors.product.descriptionInput, productData.description);
      await this.page.waitForTimeout(PAYHIP_CONFIG.delays.typing);

      await this.page.fill(PAYHIP_CONFIG.selectors.product.priceInput, productData.price.toString());
      await this.page.waitForTimeout(PAYHIP_CONFIG.delays.typing);

      if (productData.file_path) {
        console.log('Uploading product file...');
        await this.page.setInputFiles(PAYHIP_CONFIG.selectors.product.fileInput, productData.file_path);
        await this.page.waitForTimeout(PAYHIP_CONFIG.delays.upload);
      }

      console.log('Submitting product...');
      await this.page.click(PAYHIP_CONFIG.selectors.product.submitButton);
      await this.page.waitForNavigation();

      return { success: true, message: 'Product uploaded successfully' };
    } catch (error) {
      console.error('Upload failed:', error.message);
      return { success: false, message: error.message };
    } finally {
      await this.close();
    }
  }
}

export { PayhipAutomation, PAYHIP_CONFIG };
