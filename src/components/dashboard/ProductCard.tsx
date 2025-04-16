
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { GumroadProduct } from "@/services/GumroadService";
import { toast } from "sonner";

interface ProductCardProps {
  product: GumroadProduct;
  status: "pending" | "migrating" | "completed";
  onMigrate: () => void;
  webhookReady: boolean;
}

const ProductCard = ({ product, status, onMigrate, webhookReady }: ProductCardProps) => {
  const handleMigration = async () => {
    try {
      const response = await fetch('https://portify.app.n8n.cloud/webhook/migrate-gumroad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: product.name,
          description: product.description,
          price: product.price * 100, // Convert to cents
          image: product.image || ''
        }),
      });

      if (!response.ok) {
        throw new Error('Migration failed');
      }

      onMigrate();
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Failed to migrate product. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
        <p className="text-coral font-medium mb-2">${product.price}</p>
        <p className="text-coolGray text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center">
          {status === "completed" ? (
            <div className="flex items-center text-lushGreen">
              <CheckCircle size={18} className="mr-2" />
              <span>Migrated</span>
            </div>
          ) : status === "migrating" ? (
            <div className="flex items-center text-mint">
              <Clock size={18} className="mr-2 animate-pulse" />
              <span>Migrating...</span>
            </div>
          ) : (
            <Button 
              onClick={handleMigration}
              size="sm"
              className="bg-cta-gradient hover:opacity-90 text-white"
              disabled={!webhookReady}
              title={!webhookReady ? "Test webhook connection first" : "Start migration"}
            >
              {!webhookReady ? (
                <>
                  <AlertCircle size={16} className="mr-1" />
                  Configure n8n
                </>
              ) : (
                <>
                  Migrate
                  <ArrowRight size={16} className="ml-1" />
                </>
              )}
            </Button>
          )}
          
          <a 
            href={product.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-coolGray hover:text-coral"
          >
            View on Gumroad
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
