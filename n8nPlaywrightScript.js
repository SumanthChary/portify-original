// This script will be used in N8N's Playwright node
module.exports = async function(page, context, productData) {
  // Safety checks and error handlers
  const checkForCaptcha = async () => {
    const captcha = await page.$('.captcha, .g-recaptcha, iframe[src*="recaptcha"]');
    if (captcha) throw new Error("CAPTCHA detected");
  };

  const checkForLoginError = async () => {
    const loginError = await page.$('.login-error');
    if (loginError) throw new Error("Login failed");
  };

  // Load cookies if available
  try {
    const fs = require('fs');
    const cookies = JSON.parse(fs.readFileSync('/tmp/cookies.json'));
    await context.addCookies(cookies);
  } catch (e) {
    console.log("No saved cookies, will login fresh.");
  }

  // Go to login (only if needed)
  await page.goto('https://payhip.com/login');
  await checkForCaptcha();
  
  // Check if we need to login
  const loginForm = await page.$('#email');
  if (loginForm) {
    await page.fill('#email', process.env.PAYHIP_EMAIL);
    await page.waitForTimeout(1000);
    await page.fill('#password', process.env.PAYHIP_PASSWORD);
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await checkForLoginError();
    
    // Save cookies after successful login
    const cookies = await context.cookies();
    const fs = require('fs');
    fs.writeFileSync('/tmp/cookies.json', JSON.stringify(cookies));
  }

  // Go to add product
  await page.goto('https://payhip.com/products/new');
  await page.waitForTimeout(2000);

  // Fill product details with delays
  await page.fill('#product_name', productData.title);
  await page.waitForTimeout(1500);
  
  await page.fill('#product_description', productData.description);
  await page.waitForTimeout(1500);
  
  await page.fill('#product_price', productData.price);
  await page.waitForTimeout(1500);

  // Upload file if provided
  if (productData.localFilePath) {
    await page.setInputFiles('#product_file', productData.localFilePath);
    await page.waitForTimeout(2000);
  }

  // Submit and wait for navigation
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  // Final CAPTCHA check
  await checkForCaptcha();
  
  return { success: true, message: 'Product added successfully' };
};
