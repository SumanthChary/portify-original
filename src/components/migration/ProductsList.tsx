
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { GumroadProduct } from "@/services/GumroadService";
import { MigrationProgress } from "@/services/N8nWorkflowService";

interface MigrationStatus extends MigrationProgress {
  id: string;
  startTime?: Date;
  endTime?: Date;
  attempts: number;
  payhipUrl?: string;
}

interface ProductsListProps {
  gumroadProducts: GumroadProduct[];
  migrationStatuses: Map<string, MigrationStatus>;
  isConnected: boolean;
  onMigrateProduct: (product: GumroadProduct) => void;
}

export const ProductsList = ({
  gumroadProducts,
  migrationStatuses,
  isConnected,
  onMigrateProduct,
}: ProductsListProps) => {
  const getStageIcon = (stage: MigrationProgress['stage']) => {
    switch (stage) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'validation': case 'download': case 'login': case 'upload': case 'publish': 
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStageText = (stage: MigrationProgress['stage']) => {
    switch (stage) {
      case 'validation': return 'Validating';
      case 'download': return 'Downloading';
      case 'login': return 'Logging In';
      case 'upload': return 'Uploading';
      case 'publish': return 'Publishing';
      case 'complete': return 'Complete';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gumroad Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {gumroadProducts.map((product) => {
            const status = migrationStatuses.get(product.id);
            return (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                  )}
                  <div className="space-y-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-coolGray">${product.price}</p>
                    {status && (
                      <div className="flex items-center space-x-2">
                        {getStageIcon(status.stage)}
                        <span className="text-xs">{status.message}</span>
                        <Badge variant="outline" className="text-xs">
                          {getStageText(status.stage)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {status && (
                    <div className="w-32">
                      <Progress value={status.progress} className="h-2" />
                      <p className="text-xs text-center mt-1">{status.progress}%</p>
                    </div>
                  )}
                  <Button
                    onClick={() => onMigrateProduct(product)}
                    disabled={!isConnected || (status?.stage !== 'complete' && status?.stage !== 'failed' && status?.stage !== undefined)}
                    size="sm"
                    variant={status?.stage === 'complete' ? "outline" : "default"}
                  >
                    {status?.stage === 'complete' ? 'Completed' :
                     status && status.stage !== 'failed' ? 'Migrating...' : 'Migrate'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
