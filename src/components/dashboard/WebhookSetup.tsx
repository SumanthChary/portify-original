
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, Info, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface WebhookSetupProps {
  webhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
  isTestingWebhook: boolean;
  isWebhookTested: boolean;
  onTestWebhook: () => void;
}

const WebhookSetup = ({
  webhookUrl,
  onWebhookUrlChange,
  isTestingWebhook,
  isWebhookTested,
  onTestWebhook
}: WebhookSetupProps) => {
  const [showGuide, setShowGuide] = useState(false);
  
  const copyWebhookFormatToClipboard = () => {
    const format = JSON.stringify({
      gumroadToken: "YOUR_GUMROAD_TOKEN",
      product: {
        id: "product_123",
        name: "Product Name",
        price: 29.99,
        description: "Product description here",
        url: "https://gumroad.com/product/123",
        image: "https://example.com/image.jpg"
      },
      user_id: "user_123",
      email: "user@example.com"
    }, null, 2);
    
    navigator.clipboard.writeText(format);
    toast.success("Webhook format copied to clipboard!");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">n8n Webhook Setup</h2>
      <p className="mb-4 text-coolGray">
        Enter your n8n webhook URL to connect the workflow:
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={webhookUrl}
          onChange={(e) => onWebhookUrlChange(e.target.value)}
          placeholder="https://your-n8n-instance.com/webhook/migrate-gumroad"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md"
        />
        <Button 
          variant="outline" 
          onClick={onTestWebhook}
          disabled={isTestingWebhook || !webhookUrl}
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
      
      <div className="mt-4">
        <Button 
          variant="link" 
          onClick={() => setShowGuide(!showGuide)}
          className="text-coral px-0 hover:text-coral/90"
        >
          {showGuide ? "Hide n8n Setup Instructions" : "Show n8n Setup Instructions"}
        </Button>
        
        {showGuide && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm">
            <h3 className="font-semibold mb-2">Setting up your n8n webhook:</h3>
            <ol className="list-decimal ml-5 space-y-2">
              <li>Create a free account at <a href="https://n8n.io" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">n8n.io</a> or use self-hosted n8n</li>
              <li>Create a new workflow and add a <strong>Webhook node</strong> as the trigger</li>
              <li>Configure the webhook with <strong>HTTP Method</strong>: POST and <strong>Path</strong>: migrate-gumroad</li>
              <li>Click <strong>"Execute Node"</strong> to start listening</li>
              <li>Copy the generated webhook URL and paste it above</li>
            </ol>
            
            <h3 className="font-semibold mt-4 mb-2">Expected webhook payload format:</h3>
            <div className="relative bg-slate-800 text-white p-3 rounded overflow-x-auto">
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute right-2 top-2 text-white hover:text-white/80"
                onClick={copyWebhookFormatToClipboard}
              >
                <Copy size={14} />
              </Button>
              <pre className="text-xs">
{`{
  "gumroadToken": "ACCESS_TOKEN",
  "product": {
    "id": "product_123",
    "name": "Product Name",
    "price": 29.99,
    "description": "Product description",
    "url": "https://gumroad.com/product/123",
    "image": "https://example.com/image.jpg"
  },
  "user_id": "user_123",
  "email": "user@example.com"
}`}
              </pre>
            </div>
          </div>
        )}
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
