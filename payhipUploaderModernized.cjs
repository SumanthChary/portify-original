
// payhipUploaderModernized.js
// This is a modified version of payhipUploader.cjs that handles timeout issues

// Try to use puppeteer, but fall back to mock if it's not available
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.warn('Puppeteer not available, using mock implementation');
  // This will be used during development to prevent build errors
  puppeteer = {
    launch: async () => ({
      newPage: async () => ({
        goto: async () => {},
        type: async () => {},
        click: async () => {},
        waitForNavigation: async () => {},
        waitForSelector: async () => {},
        evaluate: async (fn) => fn(),
        content: async () => "",
        close: async () => {},
      }),
      close: async () => {},
    }),
  };
}

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
    headless: 'new',
    timeout: 60000, // Increased timeout
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  // Log in to Payhip
  try {
    await page.goto('https://payhip.com/auth/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[name="email"]', { timeout: 30000 });
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

// Run only if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
