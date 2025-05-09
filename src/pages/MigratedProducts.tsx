
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ExternalLink, Grid2X2, LayoutList } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { Skeleton } from "@/components/ui/skeleton";

type Product = Database['public']['Tables']['migrations']['Row'];

const MigratedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    console.log("MigratedProducts component mounted - Starting to fetch products");
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching products from Supabase...");
      
      const { data, error } = await supabase
        .from('migrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Products fetched successfully:", data?.length || 0, "items");
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to fetch products");
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (product: Product) => {
    const previewUrl = `${window.location.origin}/preview/${product.id}`;
    navigator.clipboard.writeText(previewUrl);
    toast.success("Product URL copied to clipboard!");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Migrated Products</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center p-8 border rounded-lg bg-red-50">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Products</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchProducts}>Try Again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Products (0)</h1>
            <Button onClick={fetchProducts}>Refresh</Button>
          </div>
          <div className="text-center p-8 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground mb-4">Products will appear here after migration</p>
            <Button onClick={fetchProducts}>Refresh</Button>
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
          <h1 className="text-3xl font-bold">Products ({products.length})</h1>
          <div className="flex gap-4">
            <Button onClick={fetchProducts}>Refresh</Button>
            <div className="flex gap-2">
              <Button 
                variant={displayMode === 'grid' ? "default" : "outline"} 
                onClick={() => setDisplayMode('grid')}
              >
                <Grid2X2 className="w-4 h-4 mr-2" /> Grid View
              </Button>
              <Button 
                variant={displayMode === 'table' ? "default" : "outline"} 
                onClick={() => setDisplayMode('table')}
              >
                <LayoutList className="w-4 h-4 mr-2" /> Table View
              </Button>
            </div>
          </div>
        </div>

        {displayMode === 'grid' ? (
          <ProductsGrid products={products} onProductUpdated={fetchProducts} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.product_title} 
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{product.product_title}</TableCell>
                    <TableCell className="capitalize">{product.status || "Unknown"}</TableCell>
                    <TableCell>{product.product_type || "N/A"}</TableCell>
                    <TableCell>{product.price || "N/A"}</TableCell>
                    <TableCell>{new Date(product.created_at).toLocaleString()}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleCopyUrl(product)}>
                        Copy Link
                      </Button>
                      <Button size="sm" asChild>
                        <a href={`/preview/${product.id}`} target="_blank" rel="noopener noreferrer">
                          View <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MigratedProducts;
