
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Copy } from "lucide-react";
import { useProductsData } from "@/hooks/useProductsData";
import { ProductsGrid } from "@/components/products/ProductsGrid";

const ProductPreview = () => {
  const { previewId } = useParams();
  const navigate = useNavigate();
  const { products, loading, error, refreshProducts } = useProductsData({ previewId });

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Preview link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
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
          <div className="text-center p-8 border rounded-lg bg-red-50">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Product</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshProducts}>Try Again</Button>
            <Button variant="outline" className="ml-2" onClick={() => navigate('/products')}>
              Back to All Products
            </Button>
          </div>
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
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Product not found</h2>
            <p className="text-muted-foreground mb-4">The requested product does not exist.</p>
            <Button onClick={() => navigate('/products')}>Back to Products</Button>
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
            <Button onClick={() => navigate('/products')}>
              Back to Products
            </Button>
          </div>
        </div>

        <ProductsGrid 
          products={products}
          isPreviewMode={true}
          onProductUpdated={refreshProducts}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ProductPreview;
