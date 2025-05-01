import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, ExternalLink } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Product = Database['public']['Tables']['migrations']['Row'];

const ProductPreview = () => {
  const { preview, previewId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      if (preview) {
        // Fetch a single product by preview ID
        const { data, error } = await supabase
          .from('migrations')
          .select('*')
          .eq('id', preview)
          .single();
        if (data) setProducts([data]);
      } else if (previewId) {
        // Fetch all migrated products
        const { data, error } = await supabase
          .from('migrations')
          .select('*')
          .eq('status', 'migrated')
          .order('created_at', { ascending: false });
        if (data) setProducts(data);
      } else {
        // Fetch all preview products
        const { data, error } = await supabase
          .from('migrations')
          .select('*')
          .eq('gumroad_product_id', previewId)
          .eq('status', 'preview');
        if (data) setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [preview, previewId]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Preview link copied to clipboard!");
  };

  const handleTransferToPayhip = async (product: Product) => {
    setTransferring(product.id);
    
    try {
      // Updated to use the actual n8n webhook endpoint and correct payload
      const response = await fetch('https://portify-original.app.n8n.cloud/webhook/migrate-gumroad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.product_title,
          description: "Product description", // Not available in migrations table
          price: 1000, // Example price in cents, update as needed
          type: "ebook", // Example type, update as needed
          permalink: product.gumroad_product_id || "", // Use actual permalink if available
          image_url: product.image_url,
          user_email: product.user_email || "default@email.com", // Use actual user_email if available
          created_at: product.created_at
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to transfer product');
      }

      const result = await response.json();
      
      // Update status in database
      await supabase
        .from('migrations')
        .update({ status: 'transferred' })
        .eq('id', product.id);

      toast.success(`${product.product_title} transferred to Payhip successfully!`);
    } catch (error) {
      console.error("Error transferring to Payhip:", error);
      toast.error("Failed to transfer product");
    } finally {
      setTransferring(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <span>Loading...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <span>No migrated products found.</span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Product Preview</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="w-4 h-4 mr-2" /> Copy Preview Link
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col">
              <div className="h-48 overflow-hidden bg-gray-100">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.product_title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    No Image
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle>{product.product_title || product.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-700">
                  {/* Description placeholder - not available in migrations table */}
                  {product.description || "Product description would appear here."}
                </p>
                <p className="text-lg font-semibold mt-2">
                  {/* Price placeholder - not available in migrations table */}
                  ${product.price || "10.00"}
                </p>
                {preview ? null : (
                  <Button onClick={() => navigate(`/preview/${product.id}`)} className="mt-2 w-full">View Details</Button>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleTransferToPayhip(product)}
                  disabled={transferring === product.id || product.status === 'transferred'}
                >
                  {transferring === product.id ? (
                    <>
                      <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                      Transferring...
                    </>
                  ) : product.status === 'transferred' ? (
                    'Transferred to Payhip'
                  ) : (
                    'Transfer to Payhip'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {preview && (
          <div className="mt-8">
            <Button onClick={() => navigate('/preview')}>Back to All Products</Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductPreview;
