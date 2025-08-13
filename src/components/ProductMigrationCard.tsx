import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";

interface ProductMigrationCardProps {
  product: {
    title: string;
    price: number;
    image?: string;
    status: 'waiting' | 'migrating' | 'completed' | 'error';
    progress?: number;
  };
  sourcePlatform: string;
  destinationPlatform: string;
}

const ProductMigrationCard = ({ product, sourcePlatform, destinationPlatform }: ProductMigrationCardProps) => {
  const getStatusIcon = () => {
    switch (product.status) {
      case 'waiting':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'migrating':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (product.status) {
      case 'waiting':
        return 'secondary';
      case 'migrating':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className={`p-4 transition-all ${
      product.status === 'migrating' ? 'ring-2 ring-primary' : ''
    }`}>
      <div className="flex items-start gap-3">
        {/* Product Image */}
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-2xl">📦</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title and Status */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium truncate pr-2">{product.title}</h3>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <Badge variant={getStatusColor() as any} className="text-xs">
                {product.status}
              </Badge>
            </div>
          </div>

          {/* Price */}
          <div className="text-sm text-muted-foreground mb-3">
            ${product.price}
          </div>

          {/* Migration Flow */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span className="capitalize bg-muted px-2 py-1 rounded">{sourcePlatform}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="capitalize bg-muted px-2 py-1 rounded">{destinationPlatform}</span>
          </div>

          {/* Progress Bar (only for migrating status) */}
          {product.status === 'migrating' && product.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Copying...</span>
                <span>{product.progress}%</span>
              </div>
              <Progress value={product.progress} className="h-1" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductMigrationCard;