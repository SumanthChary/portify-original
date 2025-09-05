import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingBag, ArrowRight, Check, Link } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  url: string;
  image?: string;
}

interface Credentials {
  gumroadApiKey: string;
  payhipEmail: string;
  payhipPassword: string;
}

const SimpleMigration = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>({
    gumroadApiKey: '',
    payhipEmail: '',
    payhipPassword: ''
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'completed'>('idle');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const connectAccounts = async () => {
    setIsLoading(true);
    try {
      // Validate Gumroad API Key
      const gumroadResponse = await fetch(`https://api.gumroad.com/v2/user`, {
        headers: {
          'Authorization': `Bearer ${credentials.gumroadApiKey}`
        }
      });
      
      if (!gumroadResponse.ok) {
        throw new Error('Invalid Gumroad API key');
      }

      // Fetch products from Gumroad
      const productsResponse = await fetch(`https://api.gumroad.com/v2/products`, {
        headers: {
          'Authorization': `Bearer ${credentials.gumroadApiKey}`
        }
      });
      
      if (!productsResponse.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await productsResponse.json();
      const fetchedProducts = data.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: p.price / 100, // Convert cents to dollars
        url: p.url,
        image: p.preview_url
      }));

      setProducts(fetchedProducts);
      setStep(3);
      toast.success('Accounts connected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const migrateProducts = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select at least one product to migrate');
      return;
    }

    setMigrationStatus('migrating');
    
    try {
      // Store migration session in database
      const sessionId = crypto.randomUUID();
      const selectedProductsArray = Array.from(selectedProducts).map(id => 
        products.find(p => p.id === id)
      ).filter(Boolean);

      const { error: dbError } = await supabase
        .from('migration_sessions')
        .insert({
          session_id: sessionId,
          user_id: user?.id,
          source_platform: 'gumroad',
          destination_platform: 'payhip',
          status: 'in_progress',
          products_data: JSON.parse(JSON.stringify(selectedProductsArray)),
          credentials: JSON.parse(JSON.stringify({
            gumroad_api_key: credentials.gumroadApiKey,
            payhip_email: credentials.payhipEmail,
            payhip_password: credentials.payhipPassword
          }))
        });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Call the migration edge function
      const { error: migrationError } = await supabase.functions.invoke('gumroad-migration', {
        body: {
          sessionId,
          products: selectedProductsArray,
          credentials: {
            gumroadApiKey: credentials.gumroadApiKey,
            payhipEmail: credentials.payhipEmail,
            payhipPassword: credentials.payhipPassword
          }
        }
      });

      if (migrationError) {
        throw migrationError;
      }

      setMigrationStatus('completed');
      toast.success(`Successfully migrated ${selectedProducts.size} products!`);
      
    } catch (error: any) {
      console.error('Migration error:', error);
      toast.error(error.message || 'Migration failed');
      setMigrationStatus('idle');
    }
  };

  const resetMigration = () => {
    setStep(1);
    setCredentials({
      gumroadApiKey: '',
      payhipEmail: '',
      payhipPassword: ''
    });
    setProducts([]);
    setSelectedProducts(new Set());
    setMigrationStatus('idle');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-darktext mb-4">
              Simple Product Migration
            </h1>
            <p className="text-coolGray">
              Migrate your products from Gumroad to Payhip in 3 simple steps
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {migrationStatus === 'completed' && stepNum === 3 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      stepNum
                    )}
                  </div>
                  {stepNum < 3 && (
                    <ArrowRight className={`h-4 w-4 mx-2 ${
                      step > stepNum ? 'text-primary' : 'text-gray-400'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Connect Accounts */}
          {step === 1 && (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Connect Your Accounts
                </CardTitle>
                <CardDescription>
                  Enter your Gumroad and Payhip credentials to connect your accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gumroad-api">Gumroad API Key</Label>
                  <Input
                    id="gumroad-api"
                    type="password"
                    placeholder="Enter your Gumroad API key"
                    value={credentials.gumroadApiKey}
                    onChange={(e) => setCredentials(prev => ({
                      ...prev,
                      gumroadApiKey: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="payhip-email">Payhip Email</Label>
                  <Input
                    id="payhip-email"
                    type="email"
                    placeholder="Enter your Payhip email"
                    value={credentials.payhipEmail}
                    onChange={(e) => setCredentials(prev => ({
                      ...prev,
                      payhipEmail: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="payhip-password">Payhip Password</Label>
                  <Input
                    id="payhip-password"
                    type="password"
                    placeholder="Enter your Payhip password"
                    value={credentials.payhipPassword}
                    onChange={(e) => setCredentials(prev => ({
                      ...prev,
                      payhipPassword: e.target.value
                    }))}
                  />
                </div>
                <Button 
                  onClick={connectAccounts} 
                  disabled={isLoading || !credentials.gumroadApiKey || !credentials.payhipEmail || !credentials.payhipPassword}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Accounts'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Select Products */}
          {step === 3 && migrationStatus !== 'completed' && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Select Products to Migrate
                  </CardTitle>
                  <CardDescription>
                    Choose which products you want to migrate to Payhip
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.length === 0 ? (
                      <p className="text-coolGray text-center py-8">No products found in your Gumroad account.</p>
                    ) : (
                      <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {products.map((product) => (
                            <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={product.id}
                                  checked={selectedProducts.has(product.id)}
                                  onCheckedChange={() => toggleProduct(product.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  {product.image && (
                                    <img 
                                      src={product.image} 
                                      alt={product.name}
                                      className="w-full h-32 object-cover rounded mb-2"
                                    />
                                  )}
                                  <h3 className="font-medium text-darktext truncate">{product.name}</h3>
                                  <p className="text-sm text-coolGray line-clamp-2 mt-1">{product.description}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <Badge variant="secondary">${product.price}</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <p className="text-sm text-coolGray">
                            {selectedProducts.size} of {products.length} products selected
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={resetMigration}>
                              Start Over
                            </Button>
                            <Button 
                              onClick={migrateProducts}
                              disabled={selectedProducts.size === 0 || migrationStatus === 'migrating'}
                            >
                              {migrationStatus === 'migrating' ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Migrating...
                                </>
                              ) : (
                                `Migrate ${selectedProducts.size} Products`
                              )}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Migration Complete */}
          {migrationStatus === 'completed' && (
            <Card className="max-w-md mx-auto text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-darktext mb-2">
                  Migration Completed!
                </h3>
                <p className="text-coolGray mb-6">
                  {selectedProducts.size} products have been successfully migrated to your Payhip account.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetMigration} className="flex-1">
                    Migrate More
                  </Button>
                  <Button onClick={() => navigate('/migrated-products')} className="flex-1">
                    View Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SimpleMigration;