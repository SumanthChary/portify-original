// Smart Browser Automation Script for N8n
// This creates director.ai-like smooth automation

const { chromium } = require('playwright');

// Anti-detection configuration
const setupStealthBrowser = async () => {
  const browser = await chromium.launch({
    headless: false, // Show browser for transparency
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York'
  });

  // Block unnecessary resources for speed
  await context.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  return { browser, context };
};

// Human-like typing with realistic delays
const humanType = async (page, selector, text, delay = 100) => {
  const element = await page.waitForSelector(selector, { timeout: 10000 });
  await element.click();
  await element.clear();
  
  for (const char of text) {
    await element.type(char, { delay: Math.random() * delay + 50 });
    await page.waitForTimeout(Math.random() * 100 + 50);
  }
};

// Smart element finder with multiple selectors
const findElement = async (page, selectors, timeout = 10000) => {
  for (const selector of selectors) {
    try {
      const element = await page.waitForSelector(selector, { timeout: timeout / selectors.length });
      if (element) return element;
    } catch (e) {
      continue;
    }
  }
  throw new Error(`Element not found with selectors: ${selectors.join(', ')}`);
};

// Smart login function
const smartLogin = async (page, platform, credentials) => {
  const config = platform;
  
  console.log(`🔐 Logging into ${config.name}...`);
  
  await page.goto(config.loginUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Fill email
  await humanType(page, config.selectors.email[0], credentials.email);
  await page.waitForTimeout(1000);

  // Fill password
  await humanType(page, config.selectors.password[0], credentials.password);
  await page.waitForTimeout(1000);

  // Click login
  const loginButton = await findElement(page, config.selectors.loginButton);
  await loginButton.click();
  
  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
  
  console.log(`✅ Successfully logged into ${config.name}`);
  return true;
};

// Extract products from source platform
const extractProducts = async (page, platformConfig) => {
  console.log('📦 Extracting products...');
  
  // Navigate to products page
  const productsUrl = platformConfig.productsPage[0];
  await page.goto(page.url().replace(/\/[^\/]*$/, productsUrl), { waitUntil: 'networkidle' });
  
  // Wait for products to load
  await page.waitForTimeout(3000);
  
  // Extract product data
  const products = await page.evaluate((selectors) => {
    const productElements = document.querySelectorAll(selectors.productItems[0]);
    const extractedProducts = [];
    
    productElements.forEach((element, index) => {
      if (index < 5) { // Limit to first 5 products for demo
        const title = element.querySelector('h3, .title, .name')?.textContent?.trim() || `Product ${index + 1}`;
        const price = element.querySelector('.price, [data-price]')?.textContent?.trim() || '0.00';
        const description = element.querySelector('.description, .summary')?.textContent?.trim() || 'No description';
        const image = element.querySelector('img')?.src || '';
        
        extractedProducts.push({
          title,
          price: price.replace(/[^0-9.]/g, ''),
          description,
          image
        });
      }
    });
    
    return extractedProducts;
  }, platformConfig.selectors);
  
  console.log(`✅ Extracted ${products.length} products`);
  return products;
};

// Migrate product to destination platform
const migrateProduct = async (page, platformConfig, product) => {
  console.log(`🚀 Migrating: ${product.title}`);
  
  // Navigate to add product page
  const addProductButton = await findElement(page, platformConfig.selectors.addProductButton);
  await addProductButton.click();
  
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Fill product form
  const formSelectors = platformConfig.selectors.productForm;
  
  // Title
  await humanType(page, formSelectors.title[0], product.title);
  await page.waitForTimeout(1000);
  
  // Description
  await humanType(page, formSelectors.description[0], product.description);
  await page.waitForTimeout(1000);
  
  // Price
  await humanType(page, formSelectors.price[0], product.price.toString());
  await page.waitForTimeout(1000);
  
  // Submit
  const submitButton = await findElement(page, formSelectors.submitButton);
  await submitButton.click();
  
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
  
  console.log(`✅ Successfully migrated: ${product.title}`);
  return true;
};

// Main execution function for N8n
module.exports = async function() {
  const inputData = $json;
  const { sourcePlatform, destPlatform, sourceCredentials, destCredentials, platformConfigs } = inputData;
  
  console.log('🤖 Starting Smart Browser Migration...');
  
  let browser, context, sourcePage, destPage;
  
  try {
    // Setup stealth browser
    ({ browser, context } = await setupStealthBrowser());
    
    // Create two pages for source and destination
    sourcePage = await context.newPage();
    destPage = await context.newPage();
    
    // Step 1: Login to source platform
    const sourceConfig = platformConfigs[sourcePlatform];
    await smartLogin(sourcePage, sourceConfig, sourceCredentials);
    
    // Step 2: Login to destination platform
    const destConfig = platformConfigs[destPlatform];
    await smartLogin(destPage, destConfig, destCredentials);
    
    // Step 3: Extract products from source
    const products = await extractProducts(sourcePage, sourceConfig);
    
    if (products.length === 0) {
      throw new Error('No products found to migrate');
    }
    
    // Step 4: Migrate products to destination
    const migrationResults = [];
    
    for (const product of products) {
      try {
        await migrateProduct(destPage, destConfig, product);
        migrationResults.push({
          product: product.title,
          status: 'success'
        });
      } catch (error) {
        migrationResults.push({
          product: product.title,
          status: 'failed',
          error: error.message
        });
      }
      
      // Human-like delay between migrations
      await sourcePage.waitForTimeout(Math.random() * 3000 + 2000);
    }
    
    const successCount = migrationResults.filter(r => r.status === 'success').length;
    
    return {
      success: true,
      message: `Migration completed! ${successCount}/${products.length} products migrated successfully`,
      data: {
        migrated: successCount,
        total: products.length,
        results: migrationResults
      }
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Take screenshot for debugging
    if (sourcePage) {
      await sourcePage.screenshot({ 
        path: `/tmp/error_source_${Date.now()}.png`,
        fullPage: true 
      });
    }
    
    return {
      success: false,
      message: `Migration failed: ${error.message}`,
      error: error.message
    };
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};