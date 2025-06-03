
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ExternalLink, Calendar, DollarSign } from "lucide-react";
import { type Product } from "@/hooks/useProductsData";

interface ProductCardProps {
  product: Product;
  showDetailsButton?: boolean;
  onTransferSuccess?: () => void;
}

export const ProductCard = ({ product, showDetailsButton = false, onTransferSuccess }: ProductCardProps) => {
  const navigate = useNavigate();
  const [transferring, setTransferring] = useState<boolean>(false);

  const handleTransferToPayhip = async () => {
    setTransferring(true);
    
    try {
      const response = await fetch('https://portify-original.app.n8n.cloud/webhook/migrate-gumroad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.product_title,
          description: product.description || "No description provided", 
          price: product.price || "0.00",
          type: product.product_type || "digital", 
          permalink: product.permalink || product.gumroad_product_id || "", 
          image_url: product.image_url || "",
          user_email: product.user_email || "default@email.com", 
          created_at: product.created_at
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to transfer product');
      }
      
      toast.success(`${product.product_title} transferred to Payhip successfully!`);
      if (onTransferSuccess) onTransferSuccess();
    } catch (error) {
      console.error("Error transferring to Payhip:", error);
      toast.error("Failed to transfer product");
    } finally {
      setTransferring(false);
    }
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const displayPrice = product.price ? `$${product.price}` : "Price not available";

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 shadow-lg">
      <div className="h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.product_title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm">No Image</div>
            </div>
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
        <CardTitle className="line-clamp-2 min-h-[3.5rem] text-gray-800">{product.product_title}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-4">
        {product.description ? (
          <p className="text-gray-700 line-clamp-3 text-sm min-h-[4rem]">
            {stripHtml(product.description)}
          </p>
        ) : (
          <p className="text-gray-500 italic text-sm min-h-[4rem] flex items-center">
            No description available.
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center font-semibold text-lg text-coral">
            <DollarSign size={18} className="mr-1" />
            {product.price || "0.00"}
          </div>
          <div className="flex items-center text-gray-500">
            <Calendar size={14} className="mr-1" />
            {new Date(product.created_at).toLocaleDateString()}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-medium capitalize">{product.product_type || "Digital"}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium capitalize">{product.status || "Pending"}</span>
          </div>
        </div>
        
        {showDetailsButton && (
          <Button onClick={() => navigate(`/preview/${product.id}`)} variant="outline" className="w-full mt-4">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className="w-full bg-gradient-to-r from-coral to-mint hover:from-coral/90 hover:to-mint/90 text-white font-medium"
          onClick={handleTransferToPayhip}
          disabled={transferring || product.status === 'completed'}
        >
          {transferring ? (
            <>
              <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
              Transferring...
            </>
          ) : product.status === 'completed' ? (
            '✓ Transferred to Payhip'
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Transfer to Payhip
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
