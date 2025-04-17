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
