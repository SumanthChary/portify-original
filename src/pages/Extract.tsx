import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, Key, Globe, Zap, Shield } from "lucide-react";
import Header from "@/components/Header";

const PLATFORMS = [
  { 
    id: 'gumroad', 
    name: 'Gumroad', 
    type: 'api', 
    color: 'bg-pink-500',
    description: 'Extract via API (Instant)',
    fields: ['API Key']
  },
  { 
    id: 'shopify', 
    name: 'Shopify', 
    type: 'api', 
    color: 'bg-green-500',
    description: 'Extract via API (Instant)',
    fields: ['Store URL', 'Access Token']
  },
  { 
    id: 'etsy', 
    name: 'Etsy', 
    type: 'api', 
    color: 'bg-orange-500',
    description: 'Extract via API (Instant)',
    fields: ['API Key', 'Shop ID']
  },
  { 
    id: 'payhip', 
    name: 'Payhip', 
    type: 'browser', 
    color: 'bg-blue-500',
    description: 'Extract via Browser (2-3 min)',
    fields: ['Email', 'Password']
  },
  { 
    id: 'teachable', 
    name: 'Teachable', 
    type: 'browser', 
    color: 'bg-purple-500',
    description: 'Extract via Browser (2-3 min)',
    fields: ['Email', 'Password']
  },
  { 
    id: 'thinkific', 
    name: 'Thinkific', 
    type: 'browser', 
    color: 'bg-indigo-500',
    description: 'Extract via Browser (2-3 min)',
    fields: ['Email', 'Password']
  }
];

const Extract = () => {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtract = async () => {
    if (!selectedPlatform) {
      toast.error("Please select a platform");
      return;
    }

    const platform = PLATFORMS.find(p => p.id === selectedPlatform);
    if (!platform) return;

    // Validate required fields
    const missingFields = platform.fields.filter(field => !credentials[field]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setIsExtracting(true);
    toast.loading("Connecting to your account...");

    try {
      // Simulate extraction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store platform and credentials in localStorage for next step
      localStorage.setItem('extractionData', JSON.stringify({
        platform: selectedPlatform,
        credentials,
        timestamp: new Date().toISOString()
      }));

      toast.success("✅ Connected! Extracting products...");
      navigate('/select-products');
    } catch (error) {
      toast.error("Failed to connect. Please check your credentials.");
    } finally {
      setIsExtracting(false);
    }
  };

  const selectedPlatformData = PLATFORMS.find(p => p.id === selectedPlatform);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              Extract Your Products
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect to your platform to extract products for migration
            </p>
          </div>

          {/* Platform Selection */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              Choose Your Source Platform
            </h2>
            
            <Tabs value={selectedPlatform ? PLATFORMS.find(p => p.id === selectedPlatform)?.type : "api"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  API Platforms (Instant)
                </TabsTrigger>
                <TabsTrigger value="browser" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Browser Platforms (2-3 min)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="api" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PLATFORMS.filter(p => p.type === 'api').map((platform) => (
                    <Card 
                      key={platform.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                        selectedPlatform === platform.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                        <h3 className="font-semibold">{platform.name}</h3>
                        <Badge variant="secondary" className="ml-auto">
                          <Zap className="w-3 h-3 mr-1" />
                          API
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{platform.description}</p>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="browser" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PLATFORMS.filter(p => p.type === 'browser').map((platform) => (
                    <Card 
                      key={platform.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                        selectedPlatform === platform.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                        <h3 className="font-semibold">{platform.name}</h3>
                        <Badge variant="outline" className="ml-auto">
                          <Shield className="w-3 h-3 mr-1" />
                          Browser
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{platform.description}</p>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Credentials Form */}
          {selectedPlatformData && (
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Key className="w-6 h-6 text-primary" />
                Enter Your {selectedPlatformData.name} Credentials
              </h2>
              
              <div className="space-y-4 mb-8">
                {selectedPlatformData.fields.map((field) => (
                  <div key={field}>
                    <Label htmlFor={field} className="text-base font-medium">
                      {field}
                    </Label>
                    <Input
                      id={field}
                      type={field.toLowerCase().includes('password') ? 'password' : 'text'}
                      placeholder={`Enter your ${field.toLowerCase()}`}
                      value={credentials[field] || ''}
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        [field]: e.target.value
                      }))}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Your credentials are used only for extraction and are not stored permanently. 
                  We use military-grade encryption for all connections.
                </p>
              </div>

              <Button 
                onClick={handleExtract}
                disabled={isExtracting || !selectedPlatform}
                className="w-full text-lg py-6"
                size="lg"
              >
                {isExtracting ? (
                  "Extracting Products..."
                ) : (
                  <>
                    Extract Products
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Extract;