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
