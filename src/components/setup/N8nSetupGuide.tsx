
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const N8nSetupGuide = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const workflowJson = `{
  "name": "Portify Migration Workflow",
  "nodes": [/* Your workflow JSON here */]
}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🚀 N8n Setup Guide</span>
            <Badge variant="outline">Required</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Step 1: N8n Account Setup</h3>
              <p className="text-blue-700 text-sm mb-3">
                Create your n8n cloud account if you don't have one already.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://n8n.io/cloud" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Sign up for N8n Cloud
                </a>
              </Button>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Step 2: Import Workflow</h3>
              <p className="text-green-700 text-sm mb-3">
                Import the pre-configured Portify migration workflow into your n8n instance.
              </p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(workflowJson, "Workflow JSON")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Workflow JSON
                </Button>
                <p className="text-xs text-green-600">
                  Go to n8n → New Workflow → Import from JSON → Paste the copied JSON
                </p>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">Step 3: Configure Environment Variables</h3>
              <p className="text-purple-700 text-sm mb-3">
                Set up the required environment variables in your n8n settings.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <span>PAYHIP_EMAIL=your-payhip-email@example.com</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard("PAYHIP_EMAIL=your-payhip-email@example.com", "Payhip Email Variable")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <span>PAYHIP_PASSWORD=your-payhip-password</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard("PAYHIP_PASSWORD=your-payhip-password", "Payhip Password Variable")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-900 mb-2">Step 4: Configure Gmail (Optional)</h3>
              <p className="text-orange-700 text-sm mb-3">
                Set up Gmail credentials for email notifications.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://docs.n8n.io/integrations/builtin/credentials/gmail/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Gmail Setup Guide
                </a>
              </Button>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Step 5: Activate Workflow</h3>
              <p className="text-green-700 text-sm mb-3">
                Activate the workflow and copy the webhook URL to connect with Portify.
              </p>
              <div className="flex items-center space-x-2 text-xs">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Webhook URL format: https://your-instance.app.n8n.cloud/webhook/migrate-gumroad</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default N8nSetupGuide;
