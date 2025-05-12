
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Copy } from "lucide-react";
import { useProductsData } from "@/hooks/useProductsData";
import { ProductsGrid } from "@/components/products/ProductsGrid";

const ProductPreview = () => {
  const { preview, previewId } = useParams();
  const navigate = useNavigate();
  const { products, loading, refreshProducts } = useProductsData({ preview, previewId });

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

        <ProductsGrid 
          products={products}
          isPreviewMode={!!preview}
          onProductUpdated={refreshProducts}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ProductPreview;
