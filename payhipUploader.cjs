const puppeteer = require('puppeteer');
const fs = require('fs');

// Read products from products.json
let products;
try {
  products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('products.json is empty or not an array');
  }
} catch (err) {
  console.error('Failed to read or parse products.json:', err);
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true }); // Must be true in Codespace
  const page = await browser.newPage();

  try {
    console.log('Step: Navigating to Payhip login page...');
    await page.goto('https://payhip.com/auth/login', { waitUntil: 'networkidle2' });

    // Check for email input
    const emailSelector = 'input[name="email"]';
    const passwordSelector = 'input[name="password"]';
    const loginButtonSelector = 'button[type="submit"]';
    try {
      await page.waitForSelector(emailSelector, { timeout: 10000 });
      await page.waitForSelector(passwordSelector, { timeout: 10000 });
      await page.waitForSelector(loginButtonSelector, { timeout: 10000 });
    } catch (selErr) {
      console.error('Could not find login form fields. Payhip may have changed their login page or is blocking automation.');
      await browser.close();
      process.exit(1);
    }

    console.log('Step: Typing email...');
    await page.type(emailSelector, 'enjoywithpandu@gmail.com');

    // Try both password variants
    let loggedIn = false;
    for (const pw of ['phc@12345', 'Phc@12345']) {
      await page.evaluate((sel) => { document.querySelector(sel).value = ''; }, passwordSelector);
      await page.type(passwordSelector, pw);
      await page.click(loginButtonSelector);
      try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
        loggedIn = true;
        console.log(`Step: Logged in with password variant: ${pw}`);
        break;
      } catch (e) {
        console.warn(`Login failed with password: ${pw}`);
      }
    }
    if (!loggedIn) {
      console.error('Login failed with both passwords. If Payhip shows CAPTCHA or 2FA, automation cannot continue in headless mode.');
      await browser.close();
      process.exit(1);
    }

    // Loop through each product and upload
    for (const product of products) {
      try {
        console.log(`Uploading product: ${product.product_title}`);
        await page.goto('https://payhip.com/products/new', { waitUntil: 'networkidle2' });

        // Fill in product details
        const nameSelector = 'input[name="product_name"]';
        const descSelector = 'textarea[name="product_description"]';
        const priceSelector = 'input[name="product_price"]';
        try {
          await page.waitForSelector(nameSelector, { timeout: 10000 });
          await page.waitForSelector(descSelector, { timeout: 10000 });
          await page.waitForSelector(priceSelector, { timeout: 10000 });
        } catch (selErr) {
          console.error('Could not find product form fields. Payhip may have changed their product page or is blocking automation.');
          continue;
        }

        await page.evaluate(sel => { document.querySelector(sel).value = ''; }, nameSelector);
        await page.type(nameSelector, product.product_title);
        await page.evaluate(sel => { document.querySelector(sel).value = ''; }, descSelector);
        await page.type(descSelector, product.description);
        await page.evaluate(sel => { document.querySelector(sel).value = ''; }, priceSelector);
        await page.type(priceSelector, product.price.toString());

        // Optionally submit the form (update selector as needed)
        const submitSelector = 'button[type="submit"]';
        try {
          await page.waitForSelector(submitSelector, { timeout: 10000 });
          await page.click(submitSelector);
          await page.waitForNavigation({ waitUntil: 'networkidle2' });
          console.log(`Product submitted: ${product.product_title}`);
        } catch (submitErr) {
          console.error('Could not submit the product form. Selector may be wrong or Payhip is blocking automation.');
        }
      } catch (productErr) {
        console.error(`Failed to upload product: ${product.product_title}`, productErr);
      }
    }

    await browser.close();
  } catch (err) {
    console.error('Script error:', err);
    await browser.close();
    process.exit(1);
  }
})();
