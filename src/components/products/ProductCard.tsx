
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Product = Database['public']['Tables']['migrations']['Row'];

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
      // Use the actual n8n webhook endpoint and correct payload
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
      
      toast.success(`${product.product_title} transferred to Payhip successfully!`);
      if (onTransferSuccess) onTransferSuccess();
    } catch (error) {
      console.error("Error transferring to Payhip:", error);
      toast.error("Failed to transfer product");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col">
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
          {"No description available."}
        </p>
        <p className="text-lg font-semibold mt-2">
          {"$10.00"}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Type: {"N/A"}
        </p>
        {showDetailsButton && (
          <Button onClick={() => navigate(`/preview/${product.id}`)} className="mt-2 w-full">View Details</Button>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleTransferToPayhip}
          disabled={transferring || product.status === 'transferred'}
        >
          {transferring ? (
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
  );
};
