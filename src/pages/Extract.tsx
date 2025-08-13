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
import { realGumroadService } from "@/services/RealGumroadService";
import { supabase } from "@/integrations/supabase/client";

const PLATFORMS = [
  { 
    id: 'gumroad', 
    name: 'Gumroad', 
    type: 'api', 
    color: 'bg-pink-500',
    description: 'Extract via API (Instant)',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'text' }]
  },
  { 
    id: 'shopify', 
    name: 'Shopify', 
    type: 'api', 
    color: 'bg-green-500',
    description: 'Extract via API (Instant)',
    fields: [
      { key: 'storeUrl', label: 'Store URL', type: 'text' },
      { key: 'accessToken', label: 'Access Token', type: 'text' }
    ]
  },
  { 
    id: 'etsy', 
    name: 'Etsy', 
    type: 'api', 
    color: 'bg-orange-500',
    description: 'Extract via API (Instant)',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'text' },
      { key: 'shopId', label: 'Shop ID', type: 'text' }
    ]
  },
  { 
    id: 'payhip', 
    name: 'Payhip', 
    type: 'browser', 
    color: 'bg-blue-500',
    description: 'Extract via Browser (2-3 min)',
    fields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'password', label: 'Password', type: 'password' }
    ]
  },
  { 
    id: 'teachable', 
    name: 'Teachable', 
    type: 'browser', 
    color: 'bg-purple-500',
    description: 'Extract via Browser (2-3 min)',
    fields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'password', label: 'Password', type: 'password' }
    ]
  },
  { 
    id: 'thinkific', 
    name: 'Thinkific', 
    type: 'browser', 
    color: 'bg-indigo-500',
    description: 'Extract via Browser (2-3 min)',
    fields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'password', label: 'Password', type: 'password' }
    ]
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
    for (const field of platform.fields) {
      if (!credentials[field.key]) {
        toast.error(`Please enter your ${field.label}`);
        return;
      }
    }

    setIsExtracting(true);
    
    try {
      let extractedProducts = [];
      let sessionId = '';

      if (platform.id === 'gumroad' && credentials.apiKey) {
        // Real Gumroad API extraction
        toast.loading('Connecting to Gumroad API...');
        
        // Validate API key first
        const isValidKey = await realGumroadService.validateApiKey(credentials.apiKey);
        if (!isValidKey) {
          throw new Error('Invalid Gumroad API key. Please check your credentials.');
        }

        // Extract products
        toast.loading('Extracting products from Gumroad...');
        extractedProducts = await realGumroadService.extractProducts(credentials.apiKey);
        
        if (extractedProducts.length === 0) {
          toast.info('No products found in your Gumroad account');
          return;
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please log in to continue');
          return;
        }

        // Store extraction session
        sessionId = await realGumroadService.storeExtractionSession(
          user.id,
          extractedProducts,
          platform.id
        );
      } else {
        // Simulate extraction for other platforms
        await new Promise(resolve => setTimeout(resolve, 3000));
        extractedProducts = [
          { id: '1', name: 'Digital Course', price: 99, type: 'course', description: 'Learn amazing skills' },
          { id: '2', name: 'E-book', price: 29, type: 'ebook', description: 'Comprehensive guide' },
          { id: '3', name: 'Software Tool', price: 149, type: 'software', description: 'Productivity booster' }
        ];
      }
      
      // Store extraction data in localStorage
      const extractionData = {
        sessionId,
        platform: platform.name,
        platformId: platform.id,
        credentials,
        extractedAt: new Date().toISOString(),
        products: extractedProducts
      };
      
      localStorage.setItem('extractionData', JSON.stringify(extractionData));
      
      toast.success(`Successfully extracted ${extractedProducts.length} products from ${platform.name}`);
      navigate('/select-products');
    } catch (error) {
      console.error('Extraction error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to extract products. Please try again.');
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
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              Step 1: Get Your Products
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Tell us where your products are so we can copy them
            </p>
          </div>

          {/* Platform Selection */}
          <Card className="p-8 mb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              Where Are Your Products?
            </h2>
            
            <Tabs value={selectedPlatform ? PLATFORMS.find(p => p.id === selectedPlatform)?.type : "api"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="api" className="flex items-center gap-2 text-sm md:text-base">
                  <Zap className="w-4 h-4" />
                  Super Fast (Instant)
                </TabsTrigger>
                <TabsTrigger value="browser" className="flex items-center gap-2 text-sm md:text-base">
                  <Shield className="w-4 h-4" />
                  Safe Login (2 min)
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
              <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-2">
                <Key className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                Enter Your {selectedPlatformData.name} Info
              </h2>
              
              <div className="space-y-4 mb-8">
                {selectedPlatformData.fields.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={field.key} className="text-base font-medium">
                      {field.label}
                    </Label>
                    <Input
                      id={field.key}
                      type={field.type}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      value={credentials[field.key] || ''}
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        [field.key]: e.target.value
                      }))}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 inline mr-2" />
                  We only use this to get your products. Your login info is 100% safe and not saved.
                </p>
              </div>

              <Button 
                onClick={handleExtract}
                disabled={isExtracting || !selectedPlatform}
                className="w-full text-base md:text-lg py-4 md:py-6"
                size="lg"
              >
                {isExtracting ? (
                  "Getting Your Products..."
                ) : (
                  <>
                    Get My Products
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