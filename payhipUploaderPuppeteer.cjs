// payhipUploaderPuppeteer.js
// Script to upload products from products.json to Payhip using Puppeteer

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// TODO: Fill in your Payhip credentials
const PAYHIP_EMAIL = 'enjoywithpandu@gmail.com';
const PAYHIP_PASSWORD = 'phc@12345';

const PRODUCTS_FILE = path.join(__dirname, 'products.json');

async function uploadProduct(page, product) {
  // Navigate to the add product page
  await page.goto('https://payhip.com/product/new', { waitUntil: 'networkidle2' });

  // Fill in product details
  await page.type('input[name="title"]', product.product_title);
  await page.type('textarea[name="description"]', product.description.replace(/<[^>]+>/g, ''));
  await page.type('input[name="price"]', product.price.toString());

  // If you have an image_url, you can download and upload it here (not implemented)

  // Submit the form
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);

  console.log(`Uploaded: ${product.product_title}`);
}

async function main() {
  // Read products
  let products;
  try {
    products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    if (!Array.isArray(products)) throw new Error('products.json is not an array');
  } catch (err) {
    console.error('Failed to read products.json:', err);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new', // Use true if you have an older Puppeteer version
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Log in to Payhip
  try {
    await page.goto('https://payhip.com/auth/login', { waitUntil: 'networkidle2' });
    // Wait for the email input or log the page content if not found
    try {
      await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    } catch (e) {
      const content = await page.content();
      fs.writeFileSync('payhip_login_debug.html', content);
      throw new Error('Email input not found. Saved page as payhip_login_debug.html for inspection.');
    }
    await page.type('input[name="email"]', PAYHIP_EMAIL);
    await page.type('input[name="password"]', PAYHIP_PASSWORD);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    console.log('Login successful.');
  } catch (err) {
    console.error('Login failed:', err);
    await browser.close();
    process.exit(1);
  }

  // Upload each product
  for (const product of products) {
    try {
      await uploadProduct(page, product);
    } catch (err) {
      console.error(`Failed to upload product: ${product.product_title}`, err);
    }
  }

  await browser.close();
}

main();
