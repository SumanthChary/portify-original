
// Inline Playwright script for N8n (to be copied directly into n8n)
// This script should be pasted directly into the n8n Playwright node's code field

const config = {
  delays: { short: 500, medium: 1500, long: 3000, typing: 100 },
  selectors: {
    login: {
      email: ['#email', 'input[name="email"]', '[data-testid="email"]'],
      password: ['#password', 'input[name="password"]', '[data-testid="password"]'],
      submit: ['button[type="submit"]', '.login-button', '[data-testid="login-submit"]']
    },
    product: {
      name: ['#product_name', 'input[name="product_name"]', '[data-testid="product-name"]'],
      description: ['#product_description', 'textarea[name="description"]', '[data-testid="description"]'],
      price: ['#product_price', 'input[name="price"]', '[data-testid="price"]'],
      file: ['#product_file', 'input[type="file"]', '[data-testid="file-upload"]'],
      submit: ['button[type="submit"]', '.publish-button', '[data-testid="publish"]']
    },
    captcha: ['.captcha', '.g-recaptcha', 'iframe[src*="recaptcha"]', '.cloudflare-challenge', '.hcaptcha-box'],
    errors: ['.error', '.alert-danger', '.notification-error', '[role="alert"]', '.toast-error']
  }
};

// Anti-detection setup
const setupAntiDetection = async (page) => {
  const viewports = [
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 }
  ];
  const viewport = viewports[Math.floor(Math.random() * viewports.length)];
  await page.setViewportSize(viewport);

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];
  await page.setExtraHTTPHeaders({
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
  });
};

const findElement = async (page, selectors, timeout = 10000) => {
  for (const selector of selectors) {
    try {
      const element = await page.waitForSelector(selector, { timeout: timeout / selectors.length });
      if (element) return element;
    } catch (e) {
      continue;
    }
  }
  throw new Error(`None of the selectors found: ${selectors.join(', ')}`);
};

const humanType = async (page, selector, text) => {
  const element = await findElement(page, [selector]);
  await element.click();
  await element.fill('');
  
  for (const char of text) {
    await element.type(char, { delay: Math.random() * config.delays.typing + 50 });
  }
  await page.waitForTimeout(Math.random() * config.delays.short + 200);
};

const handleCaptcha = async (page) => {
  for (const captchaSelector of config.selectors.captcha) {
    const captcha = await page.$(captchaSelector);
    if (captcha) {
      console.log('🤖 CAPTCHA detected, implementing bypass strategy...');
      await page.waitForTimeout(config.delays.long * 2);
      
      try {
        const box = await captcha.boundingBox();
        if (box) {
          await page.mouse.click(box.x - 10, box.y - 10);
          await page.waitForTimeout(config.delays.medium);
        }
      } catch (e) {
        console.log('CAPTCHA bypass attempt failed, continuing...');
      }
      
      if (await page.$(captchaSelector)) {
        console.log('🔄 CAPTCHA persistent, refreshing page...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(config.delays.long);
        return false;
      }
    }
  }
  return true;
};

const checkForErrors = async (page) => {
  for (const errorSelector of config.selectors.errors) {
    const error = await page.$(errorSelector);
    if (error) {
      const errorText = await error.textContent();
      throw new Error(`Page error detected: ${errorText}`);
    }
  }
};

// Main execution function for n8n
const productData = $json.cleaned || $json;
console.log('🚀 Starting enhanced Payhip migration for:', productData.product_title);

try {
  await setupAntiDetection(page);

  // Navigate to Payhip login
  console.log('🌐 Navigating to Payhip login...');
  await page.goto('https://payhip.com/login', { waitUntil: 'networkidle', timeout: 30000 });

  if (!await handleCaptcha(page)) {
    throw new Error('CAPTCHA blocking access, manual intervention required');
  }

  // Check if already logged in
  const loginForm = await page.$(config.selectors.login.email[0]);
  if (loginForm) {
    console.log('🔐 Logging in to Payhip...');
    
    await humanType(page, config.selectors.login.email[0], 'enjoywithpandu@gmail.com');
    await page.waitForTimeout(config.delays.medium);
    
    await humanType(page, config.selectors.login.password[0], 'phc@12345');
    await page.waitForTimeout(config.delays.medium);
    
    const submitButton = await findElement(page, config.selectors.login.submit);
    await submitButton.click();
    
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    await checkForErrors(page);
  } else {
    console.log('✅ Already logged in');
  }

  // Navigate to new product page
  console.log('➕ Navigating to new product page...');
  await page.goto('https://payhip.com/products/new', { waitUntil: 'networkidle', timeout: 30000 });

  if (!await handleCaptcha(page)) {
    throw new Error('CAPTCHA on product page, manual intervention required');
  }

  // Fill product details
  console.log('📝 Filling product details...');
  
  await humanType(page, config.selectors.product.name[0], productData.product_title);
  await checkForErrors(page);
  
  if (productData.description) {
    await humanType(page, config.selectors.product.description[0], productData.description);
  }
  
  if (productData.price) {
    await humanType(page, config.selectors.product.price[0], productData.price.toString());
  }

  // Final CAPTCHA check before submission
  if (!await handleCaptcha(page)) {
    throw new Error('CAPTCHA before submission, manual intervention required');
  }

  // Submit the product
  console.log('🚀 Submitting product...');
  const submitButton = await findElement(page, config.selectors.product.submit);
  await submitButton.click();
  
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
  await checkForErrors(page);

  console.log('✅ Product migration completed successfully!');
  return { 
    success: true, 
    message: 'Product migrated successfully to Payhip',
    product_title: productData.product_title,
    timestamp: new Date().toISOString()
  };

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  
  try {
    await page.screenshot({ 
      path: `/tmp/error_${Date.now()}.png`,
      fullPage: true 
    });
  } catch (e) {
    console.log('Failed to take error screenshot');
  }
  
  return { 
    success: false, 
    error: error.message,
    timestamp: new Date().toISOString()
  };
}
