
import { useState } from "react";
import { useProductsData } from "@/hooks/useProductsData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, DollarSign, Calendar, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ProductsDisplay = () => {
  const { products, loading, error, refreshProducts } = useProductsData();
  const [migratingProducts, setMigratingProducts] = useState<string[]>([]);

  const handleMigrateToPayhip = async (productId: string) => {
    setMigratingProducts(prev => [...prev, productId]);
    const product = products.find(p => p.id === productId);
    
    try {
      const response = await fetch('https://portify-original.app.n8n.cloud/webhook/migrate-gumroad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: product?.id,
          name: product?.product_title,
          description: product?.description || '',
          price: product?.price || '0',
          image_url: product?.image_url || '',
          gumroad_product_id: product?.gumroad_product_id,
          user_email: product?.user_email,
        }),
      });

      if (response.ok) {
        toast.success(`${product?.product_title} sent to Payhip migration queue!`);
      } else {
        throw new Error('Migration failed');
      }
    } catch (error) {
      toast.error('Failed to migrate product to Payhip');
      console.error('Migration error:', error);
    } finally {
      setMigratingProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
              <p className="text-gray-600">Loading your amazing products...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={refreshProducts} className="bg-coral hover:bg-coral/90">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-coral to-mint bg-clip-text text-transparent">
              Your Digital Products
            </h1>
            <p className="text-lg text-coolGray">
              {products.length} amazing product{products.length !== 1 ? 's' : ''} ready for migration
            </p>
          </div>
          <Button onClick={refreshProducts} variant="outline" className="border-coral text-coral hover:bg-coral hover:text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Products
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-lg">
            <div className="max-w-md mx-auto">
              <Download className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-2xl font-semibold mb-4">No Products Found</h3>
              <p className="text-coolGray mb-6">
                No products have been imported yet. Use your N8N webhook to import products from Gumroad.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2 font-medium">Your webhook URL:</p>
                <code className="bg-white px-3 py-2 rounded text-sm border break-all">
                  https://portify-original.app.n8n.cloud/webhook/migrate-gumroad
                </code>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 shadow-lg">
                  <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.product_title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <Download className="mx-auto mb-2" size={40} />
                        <p className="text-sm">No Image Available</p>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={product.status === 'completed' ? 'default' : 'secondary'}
                        className={product.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}
                      >
                        {product.status === 'completed' ? '✓ Migrated' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem] text-gray-800">
                      {product.product_title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {product.description && (
                      <p className="text-sm text-coolGray line-clamp-3 min-h-[4rem]">
                        {stripHtml(product.description)}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      {product.price && (
                        <div className="flex items-center font-semibold text-lg text-coral">
                          <DollarSign size={18} className="mr-1" />
                          {product.price}
                        </div>
                      )}
                      <div className="flex items-center text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={() => handleMigrateToPayhip(product.id)}
                        disabled={migratingProducts.includes(product.id) || product.status === 'completed'}
                        className="w-full bg-gradient-to-r from-coral to-mint hover:from-coral/90 hover:to-mint/90 text-white font-medium py-2.5"
                        size="sm"
                      >
                        {migratingProducts.includes(product.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Migrating...
                          </>
                        ) : product.status === 'completed' ? (
                          <>
                            ✓ Successfully Migrated
                          </>
                        ) : (
                          <>
                            <ExternalLink size={16} className="mr-2" />
                            Migrate to Payhip
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium capitalize">{product.product_type || 'Digital'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ID:</span>
                        <span className="font-mono text-xs">{product.gumroad_product_id}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Migration Workflow Options</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                    <span className="text-2xl mr-2">✅</span>
                    N8N Agent (Recommended)
                  </h4>
                  <p className="text-sm text-green-600">
                    Your N8N workflow fetches from Gumroad → stores in database → uploads to Payhip using browser automation
                  </p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                    <span className="text-2xl mr-2">⚡</span>
                    Direct API
                  </h4>
                  <p className="text-sm text-blue-600">
                    Fetch from Gumroad API and store in database, but Payhip requires manual upload (no API available)
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-700 mb-3 flex items-center">
                    <span className="text-2xl mr-2">🔄</span>
                    Hybrid Approach
                  </h4>
                  <p className="text-sm text-orange-600">
                    Fetch and store products here, then trigger N8N to read from database and upload to Payhip
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductsDisplay;
