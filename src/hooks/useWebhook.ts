
import { useState } from "react";
import { toast } from "sonner";

export const useWebhook = () => {
  // Pre-fill with the provided webhook URL
  const [webhookUrl, setWebhookUrl] = useState("https://portify.app.n8n.cloud/webhook/migrate-gumroad");
  const [isWebhookTested, setIsWebhookTested] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const validateWebhookUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('n8n.cloud') && urlObj.pathname.includes('/webhook/');
    } catch (e) {
      return false;
    }
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter your n8n webhook URL");
      return;
    }

    setIsTestingWebhook(true);
    toast.loading("Testing webhook connection...");

    try {
      // Send a test payload to verify the webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          gumroad_access_token: "test_token",
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setIsWebhookTested(true);
        toast.success("Successfully connected to n8n webhook!");
        console.log("Webhook test successful");
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Webhook test failed:", error);
      toast.error("Failed to connect to webhook. Please verify your n8n workflow is active.");
      setIsWebhookTested(false);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return {
    webhookUrl,
    setWebhookUrl,
    isWebhookTested,
    isTestingWebhook,
    testWebhook,
    validateWebhookUrl
  };
};
