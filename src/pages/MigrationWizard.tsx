import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Globe, Zap, Shield, CheckCircle2, Settings } from "lucide-react";
import Header from "@/components/Header";
import { realGumroadService } from "@/services/RealGumroadService";
import { supabase } from "@/integrations/supabase/client";

const PLATFORMS = [
  { 
    id: 'gumroad', 
    name: 'Gumroad', 
    type: 'api', 
    color: 'bg-pink-500',
    description: 'API - Instant extraction',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'text' }]
  },
  { 
    id: 'shopify', 
    name: 'Shopify', 
    type: 'api', 
    color: 'bg-green-500',
    description: 'API - Instant extraction',
    fields: [
      { key: 'storeUrl', label: 'Store URL', type: 'text' },
      { key: 'accessToken', label: 'Access Token', type: 'text' }
    ]
  },
  { 
    id: 'woocommerce', 
    name: 'WooCommerce', 
    type: 'both', 
    color: 'bg-purple-600',
    description: 'API or Browser mode',
    fields: [
      { key: 'storeUrl', label: 'Store URL', type: 'text' },
      { key: 'consumerKey', label: 'Consumer Key', type: 'text' },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password' }
    ],
    browserFields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'password', label: 'Password', type: 'password' }
    ]
  },
  { 
    id: 'etsy', 
    name: 'Etsy', 
    type: 'both', 
    color: 'bg-orange-500',
    description: 'API or Browser mode',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'text' },
      { key: 'shopId', label: 'Shop ID', type: 'text' }
    ],
    browserFields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'password', label: 'Password', type: 'password' }
    ]
  },
  { 
    id: 'teachable', 
    name: 'Teachable', 
    type: 'browser', 
    color: 'bg-blue-600',
    description: 'Browser - 2-3 minutes',
    fields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'password', label: 'Password', type: 'password' }
    ]
  },
  { 
    id: 'thinkific', 
    name: 'Thinkific', 
    type: 'browser', 
    color: 'bg-indigo-600',
    description: 'Browser - 2-3 minutes',
    fields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'password', label: 'Password', type: 'password' }
    ]
  }
];

const MigrationWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [useBrowserMode, setUseBrowserMode] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [extractedProducts, setExtractedProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  
  // Settings
  const [useZapier, setUseZapier] = useState(false);
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState('');
  
  const progress = (currentStep / 4) * 100;
  
  const handleExtract = async () => {
    if (!selectedPlatform) {
      toast.error("Please select a platform");
      return;
    }

    const platform = PLATFORMS.find(p => p.id === selectedPlatform);
    if (!platform) return;

    const fieldsToCheck = useBrowserMode && platform.browserFields ? platform.browserFields : platform.fields;
    
    // Validate required fields
    for (const field of fieldsToCheck) {
      if (!credentials[field.key]) {
        toast.error(`Please enter your ${field.label}`);
        return;
      }
    }

    setIsExtracting(true);
    
    try {
      let products = [];
      let currentSessionId = '';

      if (platform.id === 'gumroad' && !useBrowserMode && credentials.apiKey) {
        // Real Gumroad API extraction
        const isValidKey = await realGumroadService.validateApiKey(credentials.apiKey);
        if (!isValidKey) {
          throw new Error('Invalid Gumroad API key. Please check your credentials.');
        }

        products = await realGumroadService.extractProducts(credentials.apiKey);
        
        if (products.length === 0) {
          toast.info('No products found in your account');
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please log in to continue');
          return;
        }

        currentSessionId = await realGumroadService.storeExtractionSession(
          user.id,
          products,
          platform.id
        );
      } else {
        // Browser automation or API simulation for other platforms
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate products for demo
        products = [
          { 
            id: '1', 
            title: 'Premium Digital Course', 
            price: 99, 
            description: 'Learn amazing skills with this comprehensive course',
            images: ['https://via.placeholder.com/300x200?text=Course+Image']
          },
          { 
            id: '2', 
            title: 'E-book Guide', 
            price: 29, 
            description: 'Complete guide to mastering your craft',
            images: ['https://via.placeholder.com/300x200?text=Ebook+Cover']
          },
          { 
            id: '3', 
            title: 'Software Tool License', 
            price: 149, 
            description: 'Productivity software that saves you hours',
            images: ['https://via.placeholder.com/300x200?text=Software+Icon']
          }
        ];
      }
      
      setExtractedProducts(products);
      setSessionId(currentSessionId);
      setSelectedProducts(products.map(p => p.id));
      
      toast.success(`Successfully extracted ${products.length} products`);
      setCurrentStep(2);
    } catch (error) {
      console.error('Extraction error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to extract products');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleMigrate = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product to migrate");
      return;
    }

    // Check for exceptional user bypass
    const { data: { user } } = await supabase.auth.getUser();
    const isExceptionalUser = user?.email === "enjoywithpandu@gmail.com";
    
    if (!isExceptionalUser) {
      setCurrentStep(3); // Go to payment
      return;
    }

    // Start migration for exceptional user
    setIsMigrating(true);
    setCurrentStep(4);
    
    try {
      const productsToMigrate = extractedProducts.filter(p => selectedProducts.includes(p.id));
      
      // Store migration data for LiveAutomation page
      const migrationData = {
        sessionId,
        products: productsToMigrate,
        sourcePlatform: selectedPlatform,
        destinationPlatform: 'payhip',
        useZapier,
        zapierWebhookUrl
      };
      
      localStorage.setItem('migrationData', JSON.stringify(migrationData));
      
      if (useZapier && zapierWebhookUrl) {
        // Use Zapier orchestration
        await fetch(zapierWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            ...migrationData,
            timestamp: new Date().toISOString()
          }),
        });
        
        toast.success("Migration started via Zapier!");
      } else {
        // Direct browser automation - redirect to LiveAutomation
        toast.success("Ready for browser automation!");
        navigate(`/live-automation?session=${sessionId}&products=${productsToMigrate.length}`);
        return;
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  const selectedPlatformData = PLATFORMS.find(p => p.id === selectedPlatform);
  const fieldsToShow = useBrowserMode && selectedPlatformData?.browserFields 
    ? selectedPlatformData.browserFields 
    : selectedPlatformData?.fields || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              Migration Wizard
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center text-sm text-muted-foreground">
                Step {currentStep} of 4
              </div>
              <Progress value={progress} className="w-64" />
            </div>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs">1</span>}
                Connect
              </div>
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs">2</span>}
                Select
              </div>
              <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                {currentStep > 3 ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs">3</span>}
                Payment
              </div>
              <div className={`flex items-center gap-2 ${currentStep >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
                <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs">4</span>
                Transfer
              </div>
            </div>
          </div>

          {/* Step 1: Connect */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Choose Your Source Platform
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {PLATFORMS.map((platform) => (
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
                      </div>
                      <p className="text-sm text-muted-foreground">{platform.description}</p>
                      <div className="flex gap-2 mt-2">
                        {platform.type === 'api' && (
                          <Badge variant="secondary" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            API
                          </Badge>
                        )}
                        {(platform.type === 'browser' || platform.type === 'both') && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Browser
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {selectedPlatformData?.type === 'both' && (
                  <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Connection Mode</h4>
                        <p className="text-sm text-muted-foreground">
                          {useBrowserMode ? 'Browser mode (slower but works without API)' : 'API mode (faster but needs credentials)'}
                        </p>
                      </div>
                      <Switch 
                        checked={useBrowserMode} 
                        onCheckedChange={setUseBrowserMode}
                      />
                    </div>
                  </div>
                )}

                {selectedPlatformData && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Enter Your Credentials</h3>
                    {fieldsToShow.map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                          id={field.key}
                          type={field.type}
                          placeholder={`Enter your ${field.label.toLowerCase()}`}
                          value={credentials[field.key] || ''}
                          onChange={(e) => setCredentials(prev => ({
                            ...prev,
                            [field.key]: e.target.value
                          }))}
                          className="mt-1"
                        />
                      </div>
                    ))}
                    
                    <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Your credentials are secure and not stored permanently.
                    </div>
                  </div>
                )}
              </Card>

              {/* Settings */}
              <Card className="p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Advanced Settings (Optional)
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Use Zapier Integration</Label>
                      <p className="text-xs text-muted-foreground">Orchestrate migrations through your Zapier workflow</p>
                    </div>
                    <Switch checked={useZapier} onCheckedChange={setUseZapier} />
                  </div>
                  
                  {useZapier && (
                    <div>
                      <Label htmlFor="zapier-webhook">Zapier Webhook URL</Label>
                      <Input
                        id="zapier-webhook"
                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                        value={zapierWebhookUrl}
                        onChange={(e) => setZapierWebhookUrl(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </Card>

              <Button 
                onClick={handleExtract}
                disabled={isExtracting || !selectedPlatform}
                className="w-full py-6 text-lg"
                size="lg"
              >
                {isExtracting ? (
                  "Extracting Products..."
                ) : (
                  <>
                    Connect & Extract Products
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Select Products */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Select Products to Migrate</h2>
                  <Badge variant="secondary">{extractedProducts.length} products found</Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox 
                      checked={selectedProducts.length === extractedProducts.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProducts(extractedProducts.map(p => p.id));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                    />
                    <Label>Select All Products</Label>
                  </div>
                  
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {extractedProducts.map((product) => (
                      <Card key={product.id} className="p-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProducts(prev => [...prev, product.id]);
                              } else {
                                setSelectedProducts(prev => prev.filter(id => id !== product.id));
                              }
                            }}
                          />
                          {product.images?.[0] && (
                            <img 
                              src={product.images[0]} 
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium">{product.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">${product.price}</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleMigrate}
                  disabled={selectedProducts.length === 0}
                  className="flex-1"
                >
                  Continue to Migration
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <Card className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Ready to Migrate</h2>
              <p className="text-muted-foreground mb-6">
                You've selected {selectedProducts.length} products to migrate to Payhip.
                The migration cost is ${selectedProducts.length * 2}.99
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={() => {
                    // Simulate payment completion for demo
                    toast.success("Payment completed!");
                    setCurrentStep(4);
                  }}
                  className="flex-1"
                >
                  Pay & Start Migration
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 4: Transfer */}
          {currentStep === 4 && (
            <Card className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">
                {isMigrating ? "Migration in Progress..." : "Migration Complete!"}
              </h2>
              
              {isMigrating ? (
                <div className="space-y-4">
                  <Progress value={75} className="w-full" />
                  <p className="text-muted-foreground">
                    Migrating {selectedProducts.length} products to Payhip...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <p className="text-muted-foreground">
                    Successfully migrated {selectedProducts.length} products to Payhip!
                  </p>
                  <Button onClick={() => window.open('https://payhip.com/dashboard', '_blank')}>
                    View on Payhip Dashboard
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationWizard;