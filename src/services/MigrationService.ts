
import { GumroadProduct } from "./GumroadService";

interface MigrationPayload {
  products: {
    title: string;
    description: string;
    price: string;
    image: string;
  }[];
  userEmail: string;
}

export const sendProductsToWebhook = async (products: GumroadProduct[], userEmail: string) => {
  const payload: MigrationPayload = {
    products: products.map(product => ({
      title: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image || ''
    })),
    userEmail
  };

  try {
    const response = await fetch('https://yvvqfcwhskthbbjspcvi.supabase.co/functions/v1/product-preview-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};
