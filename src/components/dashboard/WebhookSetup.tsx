
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";

const N8N_WEBHOOK_URL = "https://portify-original.app.n8n.cloud/webhook/migrate-gumroad";

interface WebhookSetupProps {
  isWebhookTested: boolean;
  setIsWebhookTested: (tested: boolean) => void;
}

const WebhookSetup = ({ isWebhookTested, setIsWebhookTested }: WebhookSetupProps) => {
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const testWebhook = async () => {
    setIsTestingWebhook(true);
    toast.loading("Testing webhook connection...");

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Product",
          status: "Success",
          image_url: "https://example.com/image.jpg",
          description: "Test product description",
          price: 100,
          permalink: "test-product",
          timestamp: new Date().toISOString()
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">n8n Webhook Setup</h2>
      <p className="mb-4 text-coolGray">
        Your n8n webhook URL is:
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={N8N_WEBHOOK_URL}
          readOnly
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
        />
        <Button 
          variant="outline" 
          onClick={testWebhook}
          disabled={isTestingWebhook}
          className="inline-flex items-center"
        >
          {isTestingWebhook ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : isWebhookTested ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Verified
            </>
          ) : (
            <>
              <Info className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>
      </div>
      
      <div className="mt-4 text-sm text-coolGray">
        <p className="flex items-center">
          <Info className="h-4 w-4 mr-1 text-mint" />
          Don't have an n8n instance? <a href="https://n8n.io" target="_blank" rel="noopener noreferrer" className="text-coral ml-1 hover:underline">Sign up for free at n8n.io</a>
        </p>
      </div>
    </div>
  );
};

export default WebhookSetup;
export { N8N_WEBHOOK_URL };
