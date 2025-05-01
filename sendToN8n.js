const axios = require('axios');

async function sendDataToN8n(data) {
  try {
    const response = await axios.post(
      'https://portify-original.app.n8n.cloud/webhook/migrate-gumroad',
      {
        name: data.name,
        description: data.description,
        price: data.price,
        type: data.type,
        permalink: data.permalink,
        image_url: data.image_url,
        user_email: data.user_email,
        created_at: data.created_at,
        updated_at: data.updated_at
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Data sent successfully:', response.data);
  } catch (error) {
    console.error('❌ Error sending data:', error.message);
  }
}

// Example usage — trigger from your agent or backend
const exampleData = {
  name: 'GrokAI Mastery',
  description: 'Advanced AI Guide',
  price: 4700,
  type: 'ebook',
  permalink: 'GrokAIMastery',
  image_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  user_email: 'default@email.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

sendDataToN8n(exampleData);

// Send product data to n8n webhook
async function sendProductData() {
  const webhookUrl = "https://n8n.yourdomain.com/webhook/test";
  const data = {
    title: "Sample Product",
    price: 19.99,
    image_url: "https://example.com/image.jpg"
  };
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    const result = await response.text();
    console.log("Product data webhook response:", result);
  } catch (error) {
    console.error("Failed to send product data to n8n:", error);
  }
}

// Trigger product migration via n8n webhook
async function triggerProductMigration() {
  const webhookUrl = "https://n8n.yoursite.com/webhook/product-migrate";
  const payload = {
    source_url: "https://api.gumroad.com/products",
    destination_url: "https://api.payhip.com/products",
    api_key: "my-secret-key"
  };
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await response.text();
    console.log("Product migration webhook response:", result);
  } catch (error) {
    console.error("Failed to trigger product migration via n8n:", error);
  }
}

// Run both actions for demonstration
sendProductData();
triggerProductMigration();
