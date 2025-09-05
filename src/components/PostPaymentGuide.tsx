import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Chrome, 
  Download, 
  Play, 
  CheckCircle, 
  ArrowRight, 
  Eye,
  Settings,
  Zap
} from 'lucide-react';

interface PostPaymentGuideProps {
  onProceedToAutomation: () => void;
}

const PostPaymentGuide: React.FC<PostPaymentGuideProps> = ({ onProceedToAutomation }) => {
  const handleDownloadExtension = () => {
    // In a real app, this would provide the extension download
    window.open('https://github.com/your-repo/portify-extension/releases', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful! 🎉</h1>
        <p className="text-lg text-muted-foreground">
          Now let's set up the browser extension to start your migration
        </p>
      </div>

      {/* Step-by-step guide */}
      <div className="grid gap-6">
        {/* Step 1: Install Extension */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <Chrome className="w-5 h-5 text-blue-600" />
              Install the Portify Browser Extension
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Quick Install (30 seconds):</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Open Chrome → <code className="bg-white px-2 py-1 rounded">chrome://extensions/</code></li>
                <li>Enable "Developer mode" (top right toggle)</li>
                <li>Click "Load unpacked" → Select the <code className="bg-white px-2 py-1 rounded">browser-extension</code> folder</li>
                <li>Pin extension to toolbar</li>
              </ol>
            </div>
            <Alert>
              <Download className="h-4 w-4" />
              <AlertDescription>
                The extension files are included in your purchase. Check your email for the download link.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 2: Connect Extension */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <Settings className="w-5 h-5 text-purple-600" />
              Connect Extension
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Connection Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click the Portify extension icon in Chrome</li>
                <li>Click "Connect to Web App"</li>
                <li>Copy the session ID that appears</li>
                <li>Paste it in the automation page</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Watch Live Migration */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <Eye className="w-5 h-5 text-green-600" />
              Watch Live Migration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What You'll See:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Real-time browser streaming (10-15 FPS)</li>
                <li>Live automation commands execution</li>
                <li>Product migration progress tracking</li>
                <li>Error handling and success notifications</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Zap className="w-3 h-3 mr-1" />
                100% Automated
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Eye className="w-3 h-3 mr-1" />
                Live Streaming
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ready to Start */}
      <Card className="border-2 border-primary">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Ready to Start?</h3>
            <p className="text-muted-foreground">
              Click below to go to the live automation page where you'll connect your extension
            </p>
            <Button 
              onClick={onProceedToAutomation}
              size="lg"
              className="text-lg px-8 py-4"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Live Automation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Info */}
      <Alert>
        <AlertDescription className="text-center">
          <strong>Need help?</strong> The extension is peer-to-peer WebRTC - no data goes to external servers. 
          All communication happens directly between your browser and this web app.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PostPaymentGuide;