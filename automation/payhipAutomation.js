import { chromium } from 'playwright';
import { promises as fs } from 'fs';

const CONFIG = {
  COOKIE_FILE: '/tmp/payhip_cookies.json',
  CREDENTIALS: {
    email: 'enjoywithpandu@gmail.com',
    password: 'phc@12345'
  },
  DELAYS: {
    typing: 1000,
    navigation: 2000,
    upload: 5000
  }
};

async function uploadToPayhip(productData) {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    // Load cookies if available
    try {
      const cookiesString = await fs.readFile(CONFIG.COOKIE_FILE, 'utf8');
      const cookies = JSON.parse(cookiesString);
      await context.addCookies(cookies);
    } catch (e) {
      console.log('No saved cookies, proceeding with fresh login');
    }

    // Navigate to Payhip
    console.log('Navigating to Payhip...');
    await page.goto('https://payhip.com/login');
    await page.waitForTimeout(CONFIG.DELAYS.navigation);

    // Check if login is needed
    const loginForm = await page.$('#email');
    if (loginForm) {
      console.log('Logging in...');
      await page.fill('#email', CONFIG.CREDENTIALS.email);
      await page.waitForTimeout(CONFIG.DELAYS.typing);
      
      await page.fill('#password', CONFIG.CREDENTIALS.password);
      await page.waitForTimeout(CONFIG.DELAYS.typing);
      
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Save cookies for future use
      const cookies = await context.cookies();
      await fs.writeFile(CONFIG.COOKIE_FILE, JSON.stringify(cookies));
    }

    // Navigate to new product page
    console.log('Creating new product...');
    await page.goto('https://payhip.com/products/new');
    await page.waitForTimeout(CONFIG.DELAYS.navigation);

    // Fill product details
    console.log('Filling product details...');
    await page.fill('#product_name', productData.title);
    await page.waitForTimeout(CONFIG.DELAYS.typing);

    await page.fill('#product_description', productData.description);
    await page.waitForTimeout(CONFIG.DELAYS.typing);

    await page.fill('#product_price', productData.price.toString());
    await page.waitForTimeout(CONFIG.DELAYS.typing);

    // Upload file if provided
    if (productData.file_path) {
      console.log('Uploading product file...');
      await page.setInputFiles('#product_file', productData.file_path);
      await page.waitForTimeout(CONFIG.DELAYS.upload);
    }

    // Submit the form
    console.log('Submitting product...');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    console.log('✅ Product uploaded successfully');
    return { success: true, message: 'Product uploaded successfully' };

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    return { success: false, message: error.message };
  } finally {
    await browser.close();
  }
}

// Export for use in other files
export { uploadToPayhip, CONFIG };
