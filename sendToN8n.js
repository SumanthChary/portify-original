const axios = require('axios');
const fs = require('fs');

// Cookie management helper functions
const saveCookies = async (cookies) => {
  try {
    await fs.writeFileSync('/tmp/cookies.json', JSON.stringify(cookies));
    console.log('✅ Cookies saved successfully');
  } catch (error) {
    console.error('❌ Error saving cookies:', error.message);
  }
};

const loadCookies = async () => {
  try {
    const cookiesData = await fs.readFileSync('/tmp/cookies.json', 'utf8');
    return JSON.parse(cookiesData);
  } catch (error) {
    console.log('ℹ️ No saved cookies found');
    return null;
  }
};

// Updated function to send product data to the correct N8N webhook URL
async function sendProductToN8n({ 
  title, 
  description, 
  price, 
  file_url, 
  image_url, 
  type, 
  permalink, 
  user_email, 
  created_at, 
  updated_at 
}) {
  const webhookUrl = 'https://portify-beta.app.n8n.cloud/webhook/migrate-gumroad';
  const payload = {
    title,
    description,
    price,
    file_url,
    image_url,
    type,
    permalink,
    user_email,
    created_at,
    updated_at,
    cookies: await loadCookies() // Include cookies if available
  };

  try {
    const response = await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Handle cookie storage if returned from N8N
    if (response.data.cookies) {
      await saveCookies(response.data.cookies);
    }
    
    console.log('✅ Data sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending data:', error.message);
    if (error.response) {
      console.error('Server responded with:', error.response.data);
    }
    throw error;
  }
}

// Retry mechanism for failed attempts
async function sendProductWithRetry(productData, maxRetries = 3, delay = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sendProductToN8n(productData);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`Attempt ${attempt} failed, retrying in ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Export for use in other files
module.exports = {
  sendProductToN8n,
  sendProductWithRetry
};

// Example usage:
// sendProductToN8n({
//   title: 'Sample Product',
//   description: 'A great product for testing.',
//   price: 19.99,
//   file_url: 'https://gumroad.com/file.zip',
//   image_url: 'https://example.com/image.jpg',
//   type: 'ebook',
//   permalink: 'sample-product',
//   user_email: 'user@email.com',
//   created_at: new Date().toISOString(),
//   updated_at: new Date().toISOString()
// });

// All other example functions and old webhook URLs have been removed for clarity.
// Use sendProductToN8n to send product data to your N8N workflow.
