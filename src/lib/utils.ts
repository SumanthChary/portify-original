import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sends JSON data to a specified webhook URL using fetch.
 * @param url - The webhook URL to send the data to.
 * @param data - The JSON payload to send.
 */
export async function sendJsonToWebhook(url: string, data: object): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status}`);
    }
    const result = await response.json().catch(() => null);
    console.log('Webhook response:', result);
  } catch (error) {
    console.error('Error sending data to webhook:', error);
    throw error;
  }
}

/**
 * Uploads an image to Cloudinary using a public image URL.
 * @param imageUrl - The public image URL to upload.
 * @returns The Cloudinary upload response (including secure_url).
 */
export async function uploadImageToCloudinary(imageUrl: string): Promise<{ secure_url: string }> {
  const cloudName = 'dixi3xc8g'; // Replace with your Cloudinary cloud name
  const uploadPreset = 'portify_unsigned'; // Replace with your unsigned upload preset
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', imageUrl);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.status}`);
  }
  return await response.json();
}

/**
 * Formats product data for Payhip migration, including Cloudinary image URL.
 * @param product - The Gumroad product object.
 * @returns The formatted product object for Payhip.
 */
export async function formatProductForPayhip(product: {
  name: string;
  description: string;
  price: number;
  image_url: string;
}): Promise<{
  productName: string;
  productDescription: string;
  productPrice: number;
  cloudinaryImageUrl: string;
}> {
  const cloudinaryResponse = await uploadImageToCloudinary(product.image_url);
  return {
    productName: product.name,
    productDescription: product.description,
    productPrice: product.price,
    cloudinaryImageUrl: cloudinaryResponse.secure_url,
  };
}
