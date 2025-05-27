import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
require('dotenv').config();

const CONFIG = {
  COOKIE_FILE: '/tmp/payhip_cookies.json',
  PAYHIP_EMAIL: 'enjoywithpandu@gmail.com',
  PAYHIP_PASSWORD: 'phc@12345',
};

async function uploadToPayhip(productData) {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Try to load cookies if they exist
    try {
      const cookiesString = fs.readFileSync(CONFIG.COOKIE_FILE);
      const cookies = JSON.parse(cookiesString);
      await context.addCookies(cookies);
    } catch (e) {
      console.log('No saved cookies found, will login fresh');
    }

    // Go to Payhip
    await page.goto('https://payhip.com/login');
    await page.waitForTimeout(2000);

    // Check if we need to login
    const loginForm = await page.$('#email');
    if (loginForm) {
      console.log('Logging in...');
      await page.fill('#email', CONFIG.PAYHIP_EMAIL);
      await page.waitForTimeout(1500);
      
      await page.fill('#password', CONFIG.PAYHIP_PASSWORD);
      await page.waitForTimeout(1500);
      
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Save cookies
      const cookies = await context.cookies();
      fs.writeFileSync(CONFIG.COOKIE_FILE, JSON.stringify(cookies));
    }

    // Go to new product page
    await page.goto('https://payhip.com/products/new');
    await page.waitForTimeout(2000);

    // Fill in product details
    await page.fill('#product_name', productData.title);
    await page.waitForTimeout(1500);

    await page.fill('#product_description', productData.description);
    await page.waitForTimeout(1500);

    await page.fill('#product_price', productData.price.toString());
    await page.waitForTimeout(1500);

    // Upload file if it exists locally
    if (productData.file_path) {
      await page.setInputFiles('#product_file', productData.file_path);
      await page.waitForTimeout(2000);
    }

    // Submit the form
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    console.log('✅ Product uploaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

export { uploadToPayhip };
