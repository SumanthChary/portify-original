
import { useState } from "react";
import { useProductsData } from "@/hooks/useProductsData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, DollarSign, Calendar } from "lucide-react";
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refreshProducts}>Try Again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Products</h1>
            <p className="text-coolGray">
              {products.length} product{products.length !== 1 ? 's' : ''} found in your database
            </p>
          </div>
          <Button onClick={refreshProducts} variant="outline">
            Refresh Products
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-coolGray mb-4">
              No products have been imported yet. Use your N8N webhook to import products from Gumroad.
            </p>
            <div className="bg-white p-4 rounded-lg inline-block">
              <p className="text-sm text-gray-600 mb-2">Your webhook URL:</p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                https://portify-original.app.n8n.cloud/webhook/migrate-gumroad
              </code>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.product_title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Download className="mx-auto mb-2" size={32} />
                      No Image
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2 flex-1">
                      {product.product_title}
                    </CardTitle>
                    <Badge 
                      variant={product.status === 'completed' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {product.status || 'pending'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {product.description && (
                    <p className="text-sm text-coolGray line-clamp-3">
                      {product.description.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-coolGray">
                    {product.price && (
                      <div className="flex items-center">
                        <DollarSign size={16} className="mr-1" />
                        ${typeof product.price === 'string' ? product.price : (product.price / 100).toFixed(2)}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMigrateToPayhip(product.id)}
                      disabled={migratingProducts.includes(product.id) || product.status === 'completed'}
                      className="flex-1 bg-coral hover:bg-coral/90"
                      size="sm"
                    >
                      {migratingProducts.includes(product.id) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Migrating...
                        </>
                      ) : product.status === 'completed' ? (
                        'Migrated ✓'
                      ) : (
                        <>
                          <ExternalLink size={16} className="mr-1" />
                          Migrate to Payhip
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>ID: {product.gumroad_product_id}</div>
                    <div>User: {product.user_email}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Migration Workflow Options</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-green-600 mb-2">✅ Option 1: N8N Agent (Recommended)</h4>
              <p className="text-sm text-gray-600">
                Your N8N workflow fetches from Gumroad → stores in database → uploads to Payhip using browser automation
              </p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-blue-600 mb-2">⚡ Option 2: Direct API</h4>
              <p className="text-sm text-gray-600">
                I can fetch from Gumroad API and store in database, but Payhip requires manual upload (no API)
              </p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-orange-600 mb-2">🔄 Option 3: Hybrid</h4>
              <p className="text-sm text-gray-600">
                Fetch and store products here, then trigger N8N to read from database and upload to Payhip
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsDisplay;
