const axios = require('axios');

async function sendDataToN8n(data) {
  try {
    const response = await axios.post(
      'https://portify.app.n8n.cloud/webhook/migrate-gumroad',
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
