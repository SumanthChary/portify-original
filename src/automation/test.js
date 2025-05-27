import { PayhipAutomation } from './PayhipAutomation.js';
import { promises as fs } from 'fs';

async function testAutomation() {
    // Create a test file
    const testFilePath = '/tmp/test-product.zip';
    await fs.writeFile(testFilePath, 'Test product content');

    const automation = new PayhipAutomation();
    
    const testProduct = {
        title: 'Test Automation Product',
        description: 'This is a test product uploaded via automation',
        price: '9.99',
        file_path: testFilePath
    };

    console.log('Starting product upload test...');
    const result = await automation.uploadProduct(testProduct);
    
    console.log('Test result:', result);

    // Cleanup
    try {
        await fs.unlink(testFilePath);
    } catch (e) {
        console.log('Cleanup failed:', e.message);
    }
}

// Run the test
testAutomation().catch(console.error);
