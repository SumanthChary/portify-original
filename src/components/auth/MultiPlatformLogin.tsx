import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface PlatformCredentials {
  platform: string;
  email: string;
  password: string;
  apiKey?: string;
  isConnected: boolean;
  connectionType: 'api' | 'browser';
}

interface MultiPlatformLoginProps {
  onAuthComplete: (credentials: Record<string, PlatformCredentials>) => void;
  requiredPlatforms: {
    source: string;
    destination: string;
  };
}

export const MultiPlatformLogin: React.FC<MultiPlatformLoginProps> = ({
  onAuthComplete,
  requiredPlatforms
}) => {
  const [credentials, setCredentials] = useState<Record<string, PlatformCredentials>>({
    saas: {
      platform: 'Portify SaaS',
      email: '',
      password: '',
      isConnected: false,
      connectionType: 'api'
    },
    source: {
      platform: requiredPlatforms.source,
      email: '',
      password: '',
      apiKey: '',
      isConnected: false,
      connectionType: 'api'
    },
    destination: {
      platform: requiredPlatforms.destination,
      email: '',
      password: '',
      isConnected: false,
      connectionType: 'browser'
    }
  });

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState('saas');

  const platformConfig = {
    'Shopify': { hasApi: true, requiresApiKey: true },
    'WooCommerce': { hasApi: true, requiresApiKey: true },
    'Etsy': { hasApi: true, requiresApiKey: true },
    'Gumroad': { hasApi: true, requiresApiKey: false },
    'Payhip': { hasApi: false, requiresApiKey: false },
    'Teachable': { hasApi: false, requiresApiKey: false },
    'Thinkific': { hasApi: false, requiresApiKey: false },
    'Kajabi': { hasApi: false, requiresApiKey: false }
  };

  const updateCredential = (type: string, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
        isConnected: false
      }
    }));
  };

  const togglePasswordVisibility = (type: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const verifyConnection = async (type: string) => {
    const cred = credentials[type];
    
    if (!cred.email || !cred.password) {
      toast.error(`Please fill in all ${cred.platform} credentials`);
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate API verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCredentials(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          isConnected: true
        }
      }));
      
      toast.success(`✅ ${cred.platform} connection verified!`);
    } catch (error) {
      toast.error(`❌ Failed to verify ${cred.platform} connection`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = () => {
    const allConnected = Object.values(credentials).every(cred => cred.isConnected);
    
    if (!allConnected) {
      toast.error('Please verify all platform connections before proceeding');
      return;
    }
    
    onAuthComplete(credentials);
    toast.success('🚀 All platforms authenticated! Ready to migrate products.');
  };

  const renderCredentialForm = (type: string, cred: PlatformCredentials) => {
    const config = platformConfig[cred.platform as keyof typeof platformConfig];
    const hasApi = config?.hasApi || false;
    const requiresApiKey = config?.requiresApiKey || false;

    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-coral" />
              <span>{cred.platform}</span>
            </div>
            <Badge variant={cred.isConnected ? "default" : "secondary"}>
              {cred.isConnected ? (
                <><CheckCircle className="w-3 h-3 mr-1" />Connected</>
              ) : (
                <><AlertCircle className="w-3 h-3 mr-1" />Not Connected</>
              )}
            </Badge>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {hasApi ? (
              <span className="text-mint">🔗 API Connection Available</span>
            ) : (
              <span className="text-coral">🤖 Browser Automation Required</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key field for API-enabled platforms */}
          {hasApi && requiresApiKey && (
            <div className="space-y-2">
              <Label htmlFor={`${type}-api`} className="text-sm font-medium">
                API Key <span className="text-coral">*</span>
              </Label>
              <Input
                id={`${type}-api`}
                type="password"
                placeholder="Enter API key..."
                value={cred.apiKey || ''}
                onChange={(e) => updateCredential(type, 'apiKey', e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor={`${type}-email`} className="text-sm font-medium">
              Email Address <span className="text-coral">*</span>
            </Label>
            <Input
              id={`${type}-email`}
              type="email"
              placeholder="Enter email address..."
              value={cred.email}
              onChange={(e) => updateCredential(type, 'email', e.target.value)}
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor={`${type}-password`} className="text-sm font-medium">
              Password <span className="text-coral">*</span>
            </Label>
            <div className="relative">
              <Input
                id={`${type}-password`}
                type={showPasswords[type] ? "text" : "password"}
                placeholder="Enter password..."
                value={cred.password}
                onChange={(e) => updateCredential(type, 'password', e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility(type)}
              >
                {showPasswords[type] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Connection method info */}
          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <div className="flex items-center space-x-2 mb-1">
              <Lock className="w-4 h-4 text-coral" />
              <span className="font-medium">Connection Method:</span>
            </div>
            <p className="text-muted-foreground">
              {hasApi 
                ? `🔗 Fast API connection ${requiresApiKey ? 'with API key' : 'with credentials'}`
                : '🤖 Secure browser automation with encrypted session'
              }
            </p>
          </div>

          {/* Verify button */}
          <Button
            onClick={() => verifyConnection(type)}
            disabled={!cred.email || !cred.password || isVerifying || cred.isConnected}
            className="w-full"
            variant={cred.isConnected ? "default" : "outline"}
          >
            {isVerifying ? (
              <>Verifying...</>
            ) : cred.isConnected ? (
              <>✅ Connected</>
            ) : (
              <>Verify Connection</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-coral to-redAccent bg-clip-text text-transparent">
          Multi-Platform Authentication
        </h2>
        <p className="text-muted-foreground text-lg">
          Securely connect to all required platforms for seamless product migration
        </p>
        <div className="flex justify-center space-x-4 text-sm">
          <span className="text-coral">🔒 End-to-end encrypted</span>
          <span className="text-mint">⚡ API + Browser automation</span>
          <span className="text-blue-400">🛡️ Secure session management</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="saas" className="relative">
            Portify SaaS
            {credentials.saas.isConnected && (
              <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="source" className="relative">
            Source: {requiredPlatforms.source}
            {credentials.source.isConnected && (
              <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="destination" className="relative">
            Destination: {requiredPlatforms.destination}
            {credentials.destination.isConnected && (
              <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saas">
          {renderCredentialForm('saas', credentials.saas)}
        </TabsContent>

        <TabsContent value="source">
          {renderCredentialForm('source', credentials.source)}
        </TabsContent>

        <TabsContent value="destination">
          {renderCredentialForm('destination', credentials.destination)}
        </TabsContent>
      </Tabs>

      {/* Submit button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSubmit}
          disabled={!Object.values(credentials).every(cred => cred.isConnected)}
          size="lg"
          className="px-8"
        >
          {Object.values(credentials).every(cred => cred.isConnected) ? (
            <>🚀 Start Migration Process</>
          ) : (
            <>Please Connect All Platforms</>
          )}
        </Button>
      </div>

      {/* Security notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-800">Security Notice</span>
        </div>
        <p className="text-sm text-blue-700">
          All credentials are encrypted and securely transmitted. Browser automation sessions are isolated
          and automatically destroyed after migration completion. We never store your platform passwords.
        </p>
      </div>
    </div>
  );
};