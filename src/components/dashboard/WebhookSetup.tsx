
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, Info, Copy, AlertTriangle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface WebhookSetupProps {
  webhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
  isTestingWebhook: boolean;
  isWebhookTested: boolean;
  onTestWebhook: () => void;
  validateWebhookUrl?: (url: string) => boolean;
}

const WebhookSetup = ({
  webhookUrl,
  onWebhookUrlChange,
  isTestingWebhook,
  isWebhookTested,
  onTestWebhook,
  validateWebhookUrl
}: WebhookSetupProps) => {
  const [showGuide, setShowGuide] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(true);
  
  useEffect(() => {
    if (webhookUrl && validateWebhookUrl) {
      setIsValidUrl(validateWebhookUrl(webhookUrl));
    }
  }, [webhookUrl, validateWebhookUrl]);
  
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

  const copyPayloadExample = () => {
    const payloadExample = JSON.stringify({
      title: "My Product",
      description: "A cool digital product",
      price: 19.99,
      image_url: "https://example.com/image.jpg"
    }, null, 2);
    
    navigator.clipboard.writeText(payloadExample);
    toast.success("Example payload copied to clipboard!");
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onWebhookUrlChange(url);
    if (validateWebhookUrl) {
      setIsValidUrl(url === "" || validateWebhookUrl(url));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">n8n Webhook Setup</h2>
      <p className="mb-4 text-coolGray">
        Enter your n8n webhook URL to connect the workflow:
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            value={webhookUrl}
            onChange={handleUrlChange}
            placeholder="https://your-n8n-instance.hooks.n8n.cloud/webhook/migrate-gumroad"
            className={`w-full px-4 py-2 border rounded-md ${
              !isValidUrl && webhookUrl ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          />
          {!isValidUrl && webhookUrl && (
            <div className="text-xs text-red-500 mt-1 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              This doesn't look like a valid n8n webhook URL
            </div>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={onTestWebhook}
          disabled={isTestingWebhook || !webhookUrl || (validateWebhookUrl && !isValidUrl)}
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
            <h3 className="font-semibold mb-2">Complete n8n Workflow Setup Guide:</h3>
            <ol className="list-decimal ml-5 space-y-3">
              <li>
                <strong>Start with a Webhook Trigger</strong>
                <div className="mt-1 bg-blue-50 p-2 rounded border border-blue-100">
                  Configure as: <code className="bg-slate-100 px-1 rounded text-xs">Method: POST</code>, 
                  <code className="bg-slate-100 px-1 rounded text-xs">Path: migrate-gumroad</code>, 
                  <code className="bg-slate-100 px-1 rounded text-xs">Response Mode: On Received</code>
                </div>
              </li>
              <li>
                <strong>Add HTTP Request Node for Gumroad API</strong> 
                <div className="mt-1 bg-blue-50 p-2 rounded border border-blue-100">
                  <code className="bg-slate-100 px-1 rounded text-xs">Method: GET</code>, 
                  <code className="bg-slate-100 px-1 rounded text-xs">URL: https://api.gumroad.com/v2/products</code>, 
                  <br />
                  <code className="bg-slate-100 px-1 rounded text-xs">Authentication: Bearer Token</code>, 
                  <code className="bg-slate-100 px-1 rounded text-xs">Token: {'{{$json["gumroadToken"]}}'}</code>
                </div>
              </li>
              <li>
                <strong>Add Function Node to Process Products</strong>
                <div className="mt-1 bg-blue-50 p-2 rounded border border-blue-100">
                  This transforms the Gumroad response to a format Payhip can use
                </div>
              </li>
              <li>
                <strong>Add HTTP Request Node for Payhip</strong>
                <div className="mt-1 bg-blue-50 p-2 rounded border border-blue-100">
                  <code className="bg-slate-100 px-1 rounded text-xs">Method: POST</code>, 
                  <code className="bg-slate-100 px-1 rounded text-xs">URL: https://api.payhip.com/v1/products</code>, 
                  <br/>
                  <code className="bg-slate-100 px-1 rounded text-xs">Send body with product details</code>
                </div>
              </li>
              <li>
                <strong>Add Email Notification (Optional)</strong>
                <div className="mt-1 bg-blue-50 p-2 rounded border border-blue-100">
                  Send confirmation email to the user when migration is successful
                </div>
              </li>
              <li>
                <strong>Set Response to Webhook</strong>
                <div className="mt-1 bg-blue-50 p-2 rounded border border-blue-100">
                  <code className="bg-slate-100 px-1 rounded text-xs">Status: 200</code>, 
                  <code className="bg-slate-100 px-1 rounded text-xs">Body: JSON response with status</code>
                </div>
              </li>
            </ol>
            
            <h3 className="font-semibold mt-4 mb-2">Webhook payload format:</h3>
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

            <h3 className="font-semibold mt-4 mb-2">Example Payhip payload format:</h3>
            <div className="relative bg-slate-800 text-white p-3 rounded overflow-x-auto">
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute right-2 top-2 text-white hover:text-white/80"
                onClick={copyPayloadExample}
              >
                <Copy size={14} />
              </Button>
              <pre className="text-xs">
{`{
  "title": "My Product",
  "description": "A cool digital product",
  "price": 19.99,
  "image_url": "https://example.com/image.jpg"
}`}
              </pre>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded border border-green-100">
              <h4 className="font-medium text-green-800">Troubleshooting Connection Issues</h4>
              <ul className="list-disc ml-5 mt-1 space-y-1 text-green-700 text-xs">
                <li>Make sure your n8n instance is running and accessible from the internet</li>
                <li>Verify you've clicked "Execute Node" on the Webhook node in n8n</li>
                <li>For testing, try sending a simple payload using curl or Postman</li>
                <li>Check the function node in n8n to ensure it correctly processes product data</li>
                <li>If using Cloudinary, verify your upload preset is properly configured</li>
              </ul>
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
