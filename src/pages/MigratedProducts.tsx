
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ExternalLink, Grid2X2, LayoutList } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsData } from "@/hooks/useProductsData";

const MigratedProducts = () => {
  const { products, loading, error, refreshProducts } = useProductsData();
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');
  const navigate = useNavigate();

  const handleCopyUrl = (productId: string) => {
    const previewUrl = `${window.location.origin}/preview/${productId}`;
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
            <Button onClick={refreshProducts}>Try Again</Button>
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
            <Button onClick={refreshProducts}>Refresh</Button>
          </div>
          <div className="text-center p-8 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground mb-4">Products will appear here after migration</p>
            <Button onClick={refreshProducts}>Refresh</Button>
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
            <Button onClick={refreshProducts}>Refresh</Button>
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
          <ProductsGrid products={products} onProductUpdated={refreshProducts} />
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
                    <TableCell className="capitalize">{product.status || "pending"}</TableCell>
                    <TableCell>{product.product_type || "N/A"}</TableCell>
                    <TableCell>{product.price || "N/A"}</TableCell>
                    <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleCopyUrl(product.id)}>
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
