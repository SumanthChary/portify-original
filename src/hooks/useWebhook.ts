
import { useState } from "react";
import { toast } from "sonner";

export const useWebhook = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isWebhookTested, setIsWebhookTested] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResponseData, setWebhookResponseData] = useState<any>(null);
  const [connectionErrors, setConnectionErrors] = useState<string[]>([]);

  const validateWebhookUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.includes("http") && (
        url.includes(".hooks.n8n.cloud/webhook/") || 
        url.includes("/webhook/") || 
        url.includes("/hook/") ||
        // Common self-hosted n8n paths
        url.includes(":5678/webhook/") || 
        url.includes("/n8n/webhook/")
      );
    } catch (e) {
      return false;
    }
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter an n8n webhook URL");
      return;
    }

    if (!validateWebhookUrl(webhookUrl)) {
      toast.error("Invalid webhook URL format. It should be a valid n8n webhook URL");
      return;
    }

    setIsTestingWebhook(true);
    setIsWebhookTested(false);
    setConnectionErrors([]);
    toast.loading("Testing webhook connection...");

    try {
      // Send a test payload to the webhook
      const testPayload = {
        test: true,
        message: "Test connection from Portify",
        timestamp: new Date().toISOString(),
        action: "test_connection",
        // Add example product data to simulate actual migration
        sample_product: {
          name: "Test Product",
          price: 19.99,
          description: "This is a test product for webhook verification"
        }
      };

      console.log("Sending test payload to webhook:", testPayload);
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      });

      // Try to parse response as JSON
      let responseData;
      try {
        responseData = await response.json();
        setWebhookResponseData(responseData);
      } catch (e) {
        // If response is not JSON, just use status text
        responseData = { status: response.statusText || "Success" };
        setWebhookResponseData(responseData);
      }

      if (response.ok) {
        setIsWebhookTested(true);
        toast.success("Webhook connection successful!");
        console.log("Webhook test successful:", responseData);
      } else {
        const errorMsg = `Failed to connect to webhook: ${response.statusText}`;
        setConnectionErrors(prev => [...prev, errorMsg]);
        toast.error(errorMsg);
        console.error("Webhook test failed:", response.statusText);
      }
    } catch (error) {
      console.error("Webhook test failed:", error);
      
      let errorMsg = "Failed to connect to webhook. Please check the URL and try again.";
      
      // More detailed error message
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMsg = "Network error connecting to webhook. Make sure your n8n instance is running and accessible.";
      } else if (error instanceof TypeError && error.message.includes('NetworkError')) {
        errorMsg = "CORS error: Your n8n instance may be blocking requests. Check CORS settings or use a proxy.";
      }
      
      setConnectionErrors(prev => [...prev, errorMsg]);
      toast.error(errorMsg);
      setWebhookResponseData(null);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return {
    webhookUrl,
    setWebhookUrl,
    isWebhookTested,
    isTestingWebhook,
    webhookResponseData,
    connectionErrors,
    testWebhook,
    validateWebhookUrl
  };
};
