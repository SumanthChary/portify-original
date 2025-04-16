
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { GumroadProduct } from "@/types/gumroad.types";

interface ProductCardProps {
  product: GumroadProduct;
  status: "pending" | "migrating" | "completed" | "failed";
  onMigrate: () => void;
  onReset?: () => void;
  webhookReady: boolean;
  retryCount?: number;
}

const ProductCard = ({ 
  product, 
  status, 
  onMigrate, 
  onReset, 
  webhookReady,
  retryCount = 0
}: ProductCardProps) => {
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
          ) : status === "failed" ? (
            <div className="flex items-center text-red-500">
              <AlertCircle size={18} className="mr-2" />
              <span>Migration Failed</span>
              {retryCount > 0 && (
                <span className="text-xs ml-2 bg-red-50 px-1 py-0.5 rounded">
                  Attempts: {retryCount}
                </span>
              )}
            </div>
          ) : (
            <Button 
              onClick={onMigrate}
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

        {status === "failed" && onReset && (
          <div className="mt-2 text-center">
            <Button 
              onClick={onReset}
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-600"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> 
              Retry Migration
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
