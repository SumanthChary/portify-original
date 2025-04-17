
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
  const { previewId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!previewId) return;

      try {
        const { data, error } = await supabase
          .from('migrations')
          .select('*')
          .eq('gumroad_product_id', previewId)
          .eq('status', 'preview');

        if (error) {
          throw error;
        }

        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching product preview:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [previewId]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Preview link copied to clipboard!");
  };

  const handleTransferToPayhip = async (product: Product) => {
    setTransferring(product.id);
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('https://yourdomain.com/api/transfer-to-payhip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: product.product_title,
          description: "Product description", // Not available in migrations table
          price: "$10", // Not available in migrations table
          image: product.image_url,
          id: product.id
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
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Product Preview</h1>
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">No Products Found</h1>
            <p className="text-gray-600 mb-6">This preview link is invalid or has expired.</p>
            <Button onClick={() => navigate('/')}>Return Home</Button>
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
                <CardTitle>{product.product_title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-700">
                  {/* Description placeholder - not available in migrations table */}
                  Product description would appear here.
                </p>
                <p className="text-lg font-semibold mt-2">
                  {/* Price placeholder - not available in migrations table */}
                  $10.00
                </p>
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
      </main>
      <Footer />
    </div>
  );
};

export default ProductPreview;
