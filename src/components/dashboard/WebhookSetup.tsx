
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, Info } from "lucide-react";

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
          placeholder="https://your-n8n-instance.com/webhook/gumroad-migration"
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
