
import { useState } from "react";
import { toast } from "sonner";

export const useWebhook = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isWebhookTested, setIsWebhookTested] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const testWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter an n8n webhook URL");
      return;
    }

    setIsTestingWebhook(true);
    toast.loading("Testing webhook connection...");

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          message: "Test connection from Portify"
        }),
      });

      if (response.ok) {
        setIsWebhookTested(true);
        toast.success("Webhook connection successful!");
      } else {
        toast.error("Failed to connect to webhook. Please check the URL and try again.");
      }
    } catch (error) {
      console.error("Webhook test failed:", error);
      toast.error("Failed to connect to webhook. Please check the URL and try again.");
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return {
    webhookUrl,
    setWebhookUrl,
    isWebhookTested,
    isTestingWebhook,
    testWebhook
  };
};
