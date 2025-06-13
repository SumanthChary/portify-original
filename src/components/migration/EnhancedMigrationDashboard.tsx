
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Play, Pause, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useProductsData } from "@/hooks/useProductsData";
import { n8nWorkflowService, type MigrationPayload } from "@/services/N8nWorkflowService";
import gumroadService, { type GumroadProduct } from "@/services/GumroadService";

interface MigrationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  progress: number;
  message?: string;
  startTime?: Date;
  endTime?: Date;
  attempts: number;
}

export const EnhancedMigrationDashboard = () => {
  const [gumroadProducts, setGumroadProducts] = useState<GumroadProduct[]>([]);
  const [migrationStatuses, setMigrationStatuses] = useState<Map<string, MigrationStatus>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isBulkMigrating, setIsBulkMigrating] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const { products: dbProducts, refreshProducts } = useProductsData();

  useEffect(() => {
    checkN8nConnection();
    fetchGumroadProducts();
  }, []);

  useEffect(() => {
    // Calculate overall progress
    const statuses = Array.from(migrationStatuses.values());
    if (statuses.length > 0) {
      const totalProgress = statuses.reduce((sum, status) => sum + status.progress, 0);
      setOverallProgress(totalProgress / statuses.length);
    }
  }, [migrationStatuses]);

  const checkN8nConnection = async () => {
    const connected = await n8nWorkflowService.testConnection();
    setIsConnected(connected);
    if (!connected) {
      toast.error("N8n connection failed. Please check your webhook configuration.");
    }
  };

  const fetchGumroadProducts = async () => {
    try {
      const products = await gumroadService.getProducts();
      setGumroadProducts(products);
    } catch (error) {
      console.error("Failed to fetch Gumroad products:", error);
      toast.error("Failed to fetch Gumroad products");
    }
  };

  const updateMigrationStatus = (productId: string, updates: Partial<MigrationStatus>) => {
    setMigrationStatuses(prev => {
      const current = prev.get(productId) || {
        id: productId,
        status: 'pending',
        progress: 0,
        attempts: 0
      };
      const updated = { ...current, ...updates };
      const newMap = new Map(prev);
      newMap.set(productId, updated);
      return newMap;
    });
  };

  const migrateProduct = async (product: GumroadProduct) => {
    const productId = product.id;
    
    updateMigrationStatus(productId, {
      status: 'processing',
      progress: 10,
      startTime: new Date(),
      message: 'Starting migration...'
    });

    const payload: MigrationPayload = {
      user_email: "user@example.com", // You should get this from auth context
      product_id: product.id,
      product_title: product.name,
      description: product.description || '',
      price: product.price?.toString() || '0',
      image_url: product.image || '',
      gumroad_product_id: product.id,
      permalink: product.url,
      product_type: 'digital'
    };

    try {
      updateMigrationStatus(productId, { progress: 30, message: 'Sending to n8n...' });
      
      const result = await n8nWorkflowService.triggerMigration(payload);
      
      if (result.success) {
        updateMigrationStatus(productId, {
          status: 'completed',
          progress: 100,
          endTime: new Date(),
          message: result.message || 'Migration completed successfully'
        });
        toast.success(`${product.name} migrated successfully!`);
        refreshProducts();
      } else {
        throw new Error(result.error || 'Migration failed');
      }
    } catch (error) {
      updateMigrationStatus(productId, {
        status: 'failed',
        progress: 0,
        endTime: new Date(),
        message: error instanceof Error ? error.message : 'Migration failed',
        attempts: (migrationStatuses.get(productId)?.attempts || 0) + 1
      });
      toast.error(`Failed to migrate ${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const migrateBulk = async () => {
    setIsBulkMigrating(true);
    
    const payloads: MigrationPayload[] = gumroadProducts.map(product => ({
      user_email: "user@example.com", // You should get this from auth context
      product_id: product.id,
      product_title: product.name,
      description: product.description || '',
      price: product.price?.toString() || '0',
      image_url: product.image || '',
      gumroad_product_id: product.id,
      permalink: product.url,
      product_type: 'digital'
    }));

    // Initialize all statuses
    payloads.forEach(payload => {
      updateMigrationStatus(payload.product_id, {
        status: 'processing',
        progress: 5,
        startTime: new Date(),
        message: 'Queued for migration...'
      });
    });

    try {
      const { successes, failures, results } = await n8nWorkflowService.triggerBulkMigration(payloads);
      
      results.forEach((result, index) => {
        const productId = payloads[index].product_id;
        if (result.success) {
          updateMigrationStatus(productId, {
            status: 'completed',
            progress: 100,
            endTime: new Date(),
            message: 'Migration completed successfully'
          });
        } else {
          updateMigrationStatus(productId, {
            status: 'failed',
            progress: 0,
            endTime: new Date(),
            message: result.error || 'Migration failed'
          });
        }
      });

      toast.success(`Bulk migration completed: ${successes} successful, ${failures} failed`);
      refreshProducts();
    } catch (error) {
      toast.error("Bulk migration failed");
    } finally {
      setIsBulkMigrating(false);
    }
  };

  const getStatusIcon = (status: MigrationStatus['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing': case 'retrying': return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: MigrationStatus['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'processing': case 'retrying': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Migration Dashboard</h1>
          <p className="text-coolGray">Advanced n8n-powered product migration system</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={checkN8nConnection} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Test N8n
          </Button>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      {isBulkMigrating && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Migration Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="w-full" />
            <p className="text-sm text-coolGray mt-2">
              {Math.round(overallProgress)}% complete
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Products ({gumroadProducts.length})</TabsTrigger>
          <TabsTrigger value="status">Migration Status</TabsTrigger>
          <TabsTrigger value="database">Database Products ({dbProducts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gumroad Products</CardTitle>
                <Button 
                  onClick={migrateBulk} 
                  disabled={!isConnected || isBulkMigrating || gumroadProducts.length === 0}
                  className="bg-coral hover:bg-coral/90"
                >
                  {isBulkMigrating ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-pulse" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Migrate All
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {gumroadProducts.map((product) => {
                  const status = migrationStatuses.get(product.id);
                  return (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {product.image && (
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        )}
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-coolGray">${product.price}</p>
                          {status && (
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusIcon(status.status)}
                              <span className="text-xs">{status.message}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {status && (
                          <div className="w-24">
                            <Progress value={status.progress} className="h-2" />
                          </div>
                        )}
                        <Button
                          onClick={() => migrateProduct(product)}
                          disabled={!isConnected || status?.status === 'processing'}
                          size="sm"
                          variant="outline"
                        >
                          {status?.status === 'processing' ? 'Migrating...' : 'Migrate'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Migration Status Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from(migrationStatuses.entries()).map(([productId, status]) => {
                  const product = gumroadProducts.find(p => p.id === productId);
                  return (
                    <div key={productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(status.status)}
                        <div>
                          <p className="font-medium">{product?.name || productId}</p>
                          <p className="text-sm text-coolGray">{status.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right text-sm">
                          <p>Attempts: {status.attempts}</p>
                          {status.startTime && (
                            <p className="text-coolGray">
                              Started: {status.startTime.toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {dbProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h3 className="font-medium">{product.product_title}</h3>
                      <p className="text-sm text-coolGray">${product.price}</p>
                    </div>
                    <Badge variant={product.status === 'completed' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
