import { chromium } from 'playwright';
import { promises as fs } from 'fs';

const AUTOMATION_CONFIG = {
  credentials: {
    email: 'enjoywithpandu@gmail.com',
    password: 'phc@12345'
  },
  delays: {
    typing: 1500,
    navigation: 2000,
    upload: 5000
  },
  cookieFile: '/tmp/payhip-session.json'
};

export async function migrateProduct(product) {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Try to load existing session
    try {
      const cookies = JSON.parse(await fs.readFile(AUTOMATION_CONFIG.cookieFile, 'utf8'));
      await context.addCookies(cookies);
    } catch (e) {
      console.log('No saved session found, will login fresh');
    }

    // Login
    await page.goto('https://payhip.com/login');
    await page.waitForTimeout(AUTOMATION_CONFIG.delays.navigation);

    const loginForm = await page.$('#email');
    if (loginForm) {
      await page.fill('#email', AUTOMATION_CONFIG.credentials.email);
      await page.waitForTimeout(AUTOMATION_CONFIG.delays.typing);
      
      await page.fill('#password', AUTOMATION_CONFIG.credentials.password);
      await page.waitForTimeout(AUTOMATION_CONFIG.delays.typing);
      
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Save session for future use
      const cookies = await context.cookies();
      await fs.writeFile(AUTOMATION_CONFIG.cookieFile, JSON.stringify(cookies));
    }

    // Create new product
    await page.goto('https://payhip.com/products/new');
    await page.waitForTimeout(AUTOMATION_CONFIG.delays.navigation);

    // Fill product details
    await page.fill('#product_name', product.title);
    await page.waitForTimeout(AUTOMATION_CONFIG.delays.typing);

    await page.fill('#product_description', product.description);
    await page.waitForTimeout(AUTOMATION_CONFIG.delays.typing);

    await page.fill('#product_price', product.price.toString());
    await page.waitForTimeout(AUTOMATION_CONFIG.delays.typing);

    // Handle file upload
    if (product.file_url) {
      // Download the file first
      const response = await fetch(product.file_url);
      const buffer = await response.buffer();
      const tempPath = `/tmp/${Date.now()}-${product.title.replace(/[^a-z0-9]/gi, '_')}.zip`;
      await fs.writeFile(tempPath, buffer);

      // Upload to Payhip
      await page.setInputFiles('#product_file', tempPath);
      await page.waitForTimeout(AUTOMATION_CONFIG.delays.upload);

      // Cleanup
      await fs.unlink(tempPath);
    }

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    return { success: true, message: 'Product migrated successfully' };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}
