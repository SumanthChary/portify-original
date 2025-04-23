import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from 'axios'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sends JSON data to a specified webhook URL.
 * @param url - The webhook URL to send the data to.
 * @param data - The JSON payload to send.
 */
export async function sendJsonToWebhook(url: string, data: object): Promise<void> {
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Webhook response:', response.data);
  } catch (error) {
    console.error('Error sending data to webhook:', error);
    throw error;
  }
}
