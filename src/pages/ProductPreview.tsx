
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Product {
  title: string;
  description: string;
  price: string;
  image: string;
}

const ProductPreview = () => {
  const { previewId } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Get products from location state if available
    if (location.state?.products) {
      setProducts(location.state.products);
      setIsLoading(false);
      return;
    }

    // If not available in state, try to fetch from localStorage
    const storedProducts = localStorage.getItem(`preview-products-${previewId}`);
    if (storedProducts) {
      try {
        setProducts(JSON.parse(storedProducts));
      } catch (error) {
        console.error("Failed to parse stored products:", error);
        toast.error("Failed to load product preview");
      }
    } else {
      toast.error("Preview not found or expired");
    }
    setIsLoading(false);
  }, [previewId, location.state]);

  const handleTransfer = async (product: Product) => {
    toast.loading(`Transferring ${product.title} to Payhip...`);
    
    try {
      const response = await fetch("https://yourdomain.com/api/transfer-to-payhip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error("Transfer failed");
      }

      toast.success(`Successfully transferred ${product.title} to Payhip!`);
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Failed to transfer product. Please try again.");
    }
  };

  const copyLinkToClipboard = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setIsCopied(true);
        toast.success("Preview link copied to clipboard");
        setTimeout(() => setIsCopied(false), 3000);
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-offwhite py-8">
        <div className="section-container">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0">Product Preview</h1>
              <Button 
                onClick={copyLinkToClipboard} 
                variant="outline" 
                className="inline-flex items-center"
              >
                {isCopied ? "Copied!" : "Copy Preview Link"}
              </Button>
            </div>
            <p className="text-lg text-coolGray mt-2">
              Review your products before transferring them to Payhip.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-coral border-r-transparent"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-lg text-coolGray">No products found in this preview.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <Card key={index} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">No Image</div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="font-semibold text-lg truncate">{product.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-coral font-medium mb-2">{product.price}</p>
                    <p className="text-coolGray text-sm line-clamp-2">{product.description}</p>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      onClick={() => handleTransfer(product)}
                      className="w-full bg-cta-gradient hover:opacity-90 text-white"
                    >
                      Transfer to Payhip
                      <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPreview;
