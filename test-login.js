import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testPayhipLogin() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('Navigating to Payhip...');
        await page.goto('https://payhip.com/login');
        await page.waitForTimeout(2000);

        console.log('Filling login form...');
        await page.fill('#email', 'enjoywithpandu@gmail.com');
        await page.waitForTimeout(1000);
        await page.fill('#password', 'phc@12345');
        await page.waitForTimeout(1000);

        console.log('Clicking login...');
        await page.click('button[type="submit"]');
        await page.waitForNavigation();

        console.log('Checking if login was successful...');
        const loginError = await page.$('.login-error');
        if (loginError) {
            throw new Error('Login failed - please check credentials');
        }

        // Wait to see if we're logged in
        await page.waitForTimeout(5000);
        console.log('✅ Login test successful!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testPayhipLogin();
