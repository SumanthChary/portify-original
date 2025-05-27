import { uploadToPayhip } from './simpleUploader.js';

async function testUpload() {
  const testProduct = {
    title: 'Test Product - Automation',
    description: 'This is an automated test product upload',
    price: 9.99,
    file_path: '/tmp/test-product.zip'
  };

  console.log('Starting test upload...');
  const result = await uploadToPayhip(testProduct);
  console.log('Upload result:', result);
}

testUpload().catch(console.error);
