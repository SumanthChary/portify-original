
import { useState } from "react";
import { toast } from "sonner";

export const useWebhook = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isWebhookTested, setIsWebhookTested] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResponseData, setWebhookResponseData] = useState<any>(null);

  const validateWebhookUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.includes("http") && (
        url.includes(".hooks.n8n.cloud/webhook/") || 
        url.includes("/webhook/") || 
        url.includes("/hook/")
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
    toast.loading("Testing webhook connection...");

    try {
      // Send a test payload to the webhook
      const testPayload = {
        test: true,
        message: "Test connection from Portify",
        timestamp: new Date().toISOString(),
        action: "test_connection"
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
        toast.error(`Failed to connect to webhook: ${response.statusText}`);
        console.error("Webhook test failed:", response.statusText);
      }
    } catch (error) {
      console.error("Webhook test failed:", error);
      
      // More detailed error message
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error("Network error connecting to webhook. Make sure your n8n instance is running and accessible.");
      } else {
        toast.error("Failed to connect to webhook. Please check the URL and try again.");
      }
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
    testWebhook,
    validateWebhookUrl
  };
};
