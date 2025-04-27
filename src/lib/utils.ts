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
 * Formats Gumroad product data for Payhip migration by uploading the image to Cloudinary.
 * @param input - The product input with name, description, price, and image_url.
 * @returns The cleaned JSON response for Payhip migration.
 */
export async function formatProductForPayhipMigration(input: {
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
  const cloudName = 'dixi3xc8g'; // Replace with your Cloudinary cloud name if needed
  const uploadPreset = 'portify_unsigned'; // Replace with your unsigned upload preset if needed
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', input.image_url);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.status}`);
  }
  const cloudinaryResult = await response.json();

  return {
    productName: input.name,
    productDescription: input.description,
    productPrice: input.price,
    cloudinaryImageUrl: cloudinaryResult.secure_url,
  };
}
