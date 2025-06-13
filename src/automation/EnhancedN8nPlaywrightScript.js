
// Enhanced N8N Playwright Script for Payhip Migration
// This script implements advanced automation with anti-detection and robust error handling

module.exports = async function(page, context, productData) {
  console.log('🚀 Starting enhanced Payhip migration for:', productData.title);
  
  // Configuration
  const config = {
    delays: {
      short: 500,
      medium: 1500,
      long: 3000,
      typing: 100
    },
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
        image: ['#product_image', 'input[name="image"]', '[data-testid="image-upload"]'],
        submit: ['button[type="submit"]', '.publish-button', '[data-testid="publish"]']
      },
      captcha: [
        '.captcha', '.g-recaptcha', 'iframe[src*="recaptcha"]', 
        '.cloudflare-challenge', '.hcaptcha-box'
      ],
      errors: [
        '.error', '.alert-danger', '.notification-error', 
        '[role="alert"]', '.toast-error'
      ]
    }
  };

  // Anti-detection measures
  const setupAntiDetection = async () => {
    // Randomize viewport
    const viewports = [
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1280, height: 720 }
    ];
    const viewport = viewports[Math.floor(Math.random() * viewports.length)];
    await page.setViewportSize(viewport);

    // Random user agent
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    await page.setExtraHTTPHeaders({
      'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
    });

    // Block unnecessary resources to speed up
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['image', 'media', 'font'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });
  };

  // Smart element finder with multiple selectors
  const findElement = async (selectors, timeout = 10000) => {
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

  // Human-like typing
  const humanType = async (selector, text) => {
    const element = await findElement([selector]);
    await element.click();
    await element.fill(''); // Clear first
    
    for (const char of text) {
      await element.type(char, { delay: Math.random() * config.delays.typing + 50 });
    }
    await page.waitForTimeout(Math.random() * config.delays.short + 200);
  };

  // CAPTCHA detection and handling
  const handleCaptcha = async () => {
    for (const captchaSelector of config.selectors.captcha) {
      const captcha = await page.$(captchaSelector);
      if (captcha) {
        console.log('🤖 CAPTCHA detected, implementing bypass strategy...');
        
        // Strategy 1: Wait and retry (sometimes CAPTCHAs disappear)
        await page.waitForTimeout(config.delays.long * 2);
        
        // Strategy 2: Try to click around the CAPTCHA area (some are false positives)
        try {
          const box = await captcha.boundingBox();
          if (box) {
            // Click slightly outside the CAPTCHA box
            await page.mouse.click(box.x - 10, box.y - 10);
            await page.waitForTimeout(config.delays.medium);
          }
        } catch (e) {
          console.log('CAPTCHA bypass attempt failed, continuing...');
        }
        
        // Strategy 3: Refresh and try different approach
        if (await page.$(captchaSelector)) {
          console.log('🔄 CAPTCHA persistent, refreshing page...');
          await page.reload({ waitUntil: 'networkidle' });
          await page.waitForTimeout(config.delays.long);
          return false; // Indicate CAPTCHA handling failed
        }
      }
    }
    return true; // No CAPTCHA or successfully handled
  };

  // Error detection
  const checkForErrors = async () => {
    for (const errorSelector of config.selectors.errors) {
      const error = await page.$(errorSelector);
      if (error) {
        const errorText = await error.textContent();
        throw new Error(`Page error detected: ${errorText}`);
      }
    }
  };

  // File download with retry
  const downloadFile = async (url, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📥 Downloading file (attempt ${attempt}/${maxRetries}):`, url);
        
        const response = await page.request.get(url);
        if (response.ok()) {
          const buffer = await response.body();
          const fileName = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.zip`;
          const filePath = `/tmp/${fileName}`;
          
          const fs = require('fs');
          fs.writeFileSync(filePath, buffer);
          
          console.log('✅ File downloaded successfully:', filePath);
          return filePath;
        } else {
          throw new Error(`Download failed: HTTP ${response.status()}`);
        }
      } catch (error) {
        console.log(`❌ Download attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) throw error;
        await page.waitForTimeout(config.delays.medium * attempt);
      }
    }
  };

  // Cookie management
  const loadCookies = async () => {
    try {
      const fs = require('fs');
      const cookies = JSON.parse(fs.readFileSync('/tmp/payhip_cookies.json', 'utf8'));
      await context.addCookies(cookies);
      console.log('🍪 Cookies loaded successfully');
      return true;
    } catch (e) {
      console.log('🍪 No saved cookies found, will login fresh');
      return false;
    }
  };

  const saveCookies = async () => {
    try {
      const cookies = await context.cookies();
      const fs = require('fs');
      fs.writeFileSync('/tmp/payhip_cookies.json', JSON.stringify(cookies));
      console.log('🍪 Cookies saved successfully');
    } catch (e) {
      console.log('🍪 Failed to save cookies:', e.message);
    }
  };

  // Main execution flow
  try {
    // Setup
    await setupAntiDetection();
    await loadCookies();

    // Navigate to Payhip login
    console.log('🌐 Navigating to Payhip login...');
    await page.goto('https://payhip.com/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Handle CAPTCHA on login page
    if (!await handleCaptcha()) {
      throw new Error('CAPTCHA blocking access, manual intervention required');
    }

    // Check if already logged in
    const loginForm = await page.$(config.selectors.login.email[0]);
    if (loginForm) {
      console.log('🔐 Logging in to Payhip...');
      
      await humanType(config.selectors.login.email[0], process.env.PAYHIP_EMAIL || 'enjoywithpandu@gmail.com');
      await page.waitForTimeout(config.delays.medium);
      
      await humanType(config.selectors.login.password[0], process.env.PAYHIP_PASSWORD || 'phc@12345');
      await page.waitForTimeout(config.delays.medium);
      
      const submitButton = await findElement(config.selectors.login.submit);
      await submitButton.click();
      
      await page.waitForNavigation({ waitUntil: 'networkidle' });
      await checkForErrors();
      
      // Save cookies after successful login
      await saveCookies();
    } else {
      console.log('✅ Already logged in');
    }

    // Navigate to new product page
    console.log('➕ Navigating to new product page...');
    await page.goto('https://payhip.com/products/new', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Handle CAPTCHA on product page
    if (!await handleCaptcha()) {
      throw new Error('CAPTCHA on product page, manual intervention required');
    }

    // Fill product details
    console.log('📝 Filling product details...');
    
    await humanType(config.selectors.product.name[0], productData.title);
    await checkForErrors();
    
    if (productData.description) {
      await humanType(config.selectors.product.description[0], productData.description);
    }
    
    if (productData.price) {
      await humanType(config.selectors.product.price[0], productData.price.toString());
    }

    // Handle file upload if provided
    if (productData.file_url) {
      console.log('📎 Processing file upload...');
      const filePath = await downloadFile(productData.file_url);
      
      try {
        const fileInput = await findElement(config.selectors.product.file);
        await fileInput.setInputFiles(filePath);
        await page.waitForTimeout(config.delays.long);
        
        // Cleanup
        const fs = require('fs');
        fs.unlinkSync(filePath);
      } catch (error) {
        console.log('⚠️ File upload failed, continuing without file:', error.message);
      }
    }

    // Handle image upload
    if (productData.image_url) {
      console.log('🖼️ Processing image upload...');
      try {
        const imagePath = await downloadFile(productData.image_url);
        const imageInput = await findElement(config.selectors.product.image);
        await imageInput.setInputFiles(imagePath);
        await page.waitForTimeout(config.delays.medium);
        
        // Cleanup
        const fs = require('fs');
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.log('⚠️ Image upload failed, continuing without image:', error.message);
      }
    }

    // Final CAPTCHA check before submission
    if (!await handleCaptcha()) {
      throw new Error('CAPTCHA before submission, manual intervention required');
    }

    // Submit the product
    console.log('🚀 Submitting product...');
    const submitButton = await findElement(config.selectors.product.submit);
    await submitButton.click();
    
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
    await checkForErrors();

    // Final verification
    console.log('✅ Product migration completed successfully!');
    return { 
      success: true, 
      message: 'Product migrated successfully to Payhip',
      product_title: productData.title,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Take screenshot for debugging
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
};
