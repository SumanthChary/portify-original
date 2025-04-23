import { sendJsonToWebhook } from '../lib/utils';

// Service to handle product previews from webhooks

// Generate a unique ID for the preview
export const generatePreviewId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Store products for preview
export const storeProductsForPreview = (products: any[], previewId: string): void => {
  try {
    localStorage.setItem(`preview-products-${previewId}`, JSON.stringify(products));
  } catch (error) {
    console.error("Failed to store products for preview:", error);
  }
};

// Get the preview URL for sharing
export const getPreviewUrl = (previewId: string): string => {
  return `${window.location.origin}/preview/${previewId}`;
};

// Clean up old previews (can be called periodically)
export const cleanupOldPreviews = (): void => {
  const keys = Object.keys(localStorage);
  const previewKeys = keys.filter(key => key.startsWith('preview-products-'));
  
  // Keep only the 10 most recent previews
  if (previewKeys.length > 10) {
    // Sort by timestamp if available or keep arbitrary order
    previewKeys.slice(0, previewKeys.length - 10).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

/**
 * Handles product preview data and sends it to the webhook.
 * @param productData - The product data to send.
 * @param webhookUrl - The webhook URL to send the data to.
 */
export async function handleProductPreview(productData: {
  title: string;
  status: string;
  image_url: string;
  description: string;
  price: number;
  permalink: string;
  timestamp: string;
}, webhookUrl: string): Promise<void> {
  try {
    await sendJsonToWebhook(webhookUrl, productData);
    console.log('Product preview sent successfully.');
  } catch (error) {
    console.error('Failed to send product preview:', error);
  }
}
