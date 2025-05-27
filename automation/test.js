import { uploadToPayhip } from './payhipAutomation.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTest() {
    // Create a test file
    const testFilePath = '/tmp/test-product.zip';
    await fs.writeFile(testFilePath, 'Test product content');

    const testProduct = {
        title: 'Test Product - Automation',
        description: 'This is an automated test product upload',
        price: '9.99',
        file_path: testFilePath
    };

    console.log('Starting test upload...');
    const result = await uploadToPayhip(testProduct);
    console.log('Upload result:', result);

    // Clean up
    try {
        await fs.unlink(testFilePath);
    } catch (e) {
        console.log('Clean up failed:', e.message);
    }
}

runTest().catch(console.error);
