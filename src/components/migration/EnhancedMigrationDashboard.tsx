
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Play, Pause, CheckCircle, XCircle, Clock, AlertTriangle, Zap, Database } from "lucide-react";
import { useProductsData } from "@/hooks/useProductsData";
import { n8nWorkflowService, type MigrationPayload, type MigrationProgress } from "@/services/N8nWorkflowService";
import gumroadService, { type GumroadProduct } from "@/services/GumroadService";

interface MigrationStatus extends MigrationProgress {
  id: string;
  startTime?: Date;
  endTime?: Date;
  attempts: number;
  payhipUrl?: string;
}

export const EnhancedMigrationDashboard = () => {
  const [gumroadProducts, setGumroadProducts] = useState<GumroadProduct[]>([]);
  const [migrationStatuses, setMigrationStatuses] = useState<Map<string, MigrationStatus>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isBulkMigrating, setIsBulkMigrating] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const { products: dbProducts, refreshProducts } = useProductsData();

  useEffect(() => {
    checkN8nConnection();
    fetchGumroadProducts();
  }, []);

  useEffect(() => {
    const statuses = Array.from(migrationStatuses.values());
    if (statuses.length > 0) {
      const totalProgress = statuses.reduce((sum, status) => sum + status.progress, 0);
      setOverallProgress(totalProgress / statuses.length);
    }
  }, [migrationStatuses]);

  const checkN8nConnection = async () => {
    try {
      const connected = await n8nWorkflowService.testConnection();
      setIsConnected(connected);
      if (connected) {
        toast.success("🔗 N8n connection successful!");
      } else {
        toast.error("❌ N8n connection failed. Check your webhook URL.");
      }
    } catch (error) {
      console.error("Connection test error:", error);
      setIsConnected(false);
      toast.error("❌ Connection test failed");
    }
  };

  const fetchGumroadProducts = async () => {
    try {
      toast.loading("📦 Fetching Gumroad products...");
      const products = await gumroadService.getProducts();
      setGumroadProducts(products);
      toast.success(`✅ Found ${products.length} Gumroad products`);
    } catch (error) {
      console.error("Failed to fetch Gumroad products:", error);
      toast.error("❌ Failed to fetch Gumroad products");
    }
  };

  const updateMigrationStatus = (productId: string, updates: Partial<MigrationStatus>) => {
    setMigrationStatuses(prev => {
      const current = prev.get(productId) || {
        id: productId,
        stage: 'validation' as const,
        progress: 0,
        message: 'Initializing...',
        timestamp: new Date().toISOString(),
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
      stage: 'validation',
      progress: 5,
      message: 'Starting migration...',
      startTime: new Date(),
      attempts: 1
    });

    const payload: MigrationPayload = {
      user_email: "user@example.com", // Get from auth context
      product_id: product.id,
      product_title: product.name,
      description: product.description || '',
      price: product.price?.toString() || '0',
      image_url: product.image || '',
      gumroad_product_id: product.id,
      permalink: product.url,
      product_type: 'digital',
      file_url: '' // Default empty since GumroadProduct doesn't have file_url
    };

    try {
      // Subscribe to progress updates
      n8nWorkflowService.subscribeToProgress(productId, (progress) => {
        updateMigrationStatus(productId, {
          stage: progress.stage,
          progress: progress.progress,
          message: progress.message,
          timestamp: progress.timestamp
        });
      });

      const result = await n8nWorkflowService.triggerMigration(payload);
      
      if (result.success) {
        updateMigrationStatus(productId, {
          stage: 'complete',
          progress: 100,
          message: result.message || 'Migration completed successfully!',
          endTime: new Date(),
          payhipUrl: result.payhip_url
        });
        toast.success(`🎉 ${product.name} migrated successfully!`);
        refreshProducts();
      } else {
        throw new Error(result.error || 'Migration failed');
      }
    } catch (error) {
      updateMigrationStatus(productId, {
        stage: 'failed',
        progress: 0,
        message: error instanceof Error ? error.message : 'Migration failed',
        endTime: new Date(),
        attempts: (migrationStatuses.get(productId)?.attempts || 0) + 1
      });
      toast.error(`❌ Failed to migrate ${product.name}`);
    } finally {
      n8nWorkflowService.unsubscribeFromProgress(productId);
    }
  };

  const migrateBulk = async () => {
    setIsBulkMigrating(true);
    toast.info("🚀 Starting bulk migration...");
    
    const payloads: MigrationPayload[] = gumroadProducts.map(product => ({
      user_email: "user@example.com",
      product_id: product.id,
      product_title: product.name,
      description: product.description || '',
      price: product.price?.toString() || '0',
      image_url: product.image || '',
      gumroad_product_id: product.id,
      permalink: product.url,
      product_type: 'digital',
      file_url: '' // Default empty since GumroadProduct doesn't have file_url
    }));

    payloads.forEach(payload => {
      updateMigrationStatus(payload.product_id, {
        stage: 'validation',
        progress: 5,
        message: 'Queued for migration...',
        startTime: new Date(),
        attempts: 1
      });
    });

    try {
      const { successes, failures, results, migrationIds } = await n8nWorkflowService.triggerBulkMigration(payloads);
      
      results.forEach((result, index) => {
        const productId = payloads[index].product_id;
        if (result.success) {
          updateMigrationStatus(productId, {
            stage: 'complete',
            progress: 100,
            message: 'Bulk migration completed successfully!',
            endTime: new Date()
          });
        } else {
          updateMigrationStatus(productId, {
            stage: 'failed',
            progress: 0,
            message: result.error || 'Bulk migration failed',
            endTime: new Date()
          });
        }
      });

      toast.success(`🎯 Bulk migration completed: ${successes} successful, ${failures} failed`);
      refreshProducts();
    } catch (error) {
      toast.error("❌ Bulk migration failed");
    } finally {
      setIsBulkMigrating(false);
    }
  };

  const getStageIcon = (stage: MigrationProgress['stage']) => {
    switch (stage) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'validation': case 'download': case 'login': case 'upload': case 'publish': 
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStageColor = (stage: MigrationProgress['stage']) => {
    switch (stage) {
      case 'complete': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'validation': case 'download': case 'login': case 'upload': case 'publish': 
        return 'bg-blue-500';
      default: return 'bg-gray-400';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-coral to-redAccent bg-clip-text text-transparent">
            Portify Pro Migration
          </h1>
          <p className="text-coolGray text-lg">Advanced n8n-powered product migration system</p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-coral" />
              <span>N8n Workflow Engine</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-mint" />
              <span>Real-time Tracking</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={checkN8nConnection} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
          <Badge variant={isConnected ? "default" : "destructive"} className="px-3 py-1">
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </Badge>
        </div>
      </div>

      {/* Overall Progress */}
      {isBulkMigrating && (
        <Card className="border-coral/20 bg-gradient-to-r from-coral/5 to-redAccent/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-coral" />
              <span>Bulk Migration Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="w-full h-3" />
            <p className="text-sm text-coolGray mt-3">
              {Math.round(overallProgress)}% complete • Processing {Array.from(migrationStatuses.values()).filter(s => s.stage !== 'complete' && s.stage !== 'failed').length} products
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products ({gumroadProducts.length})</TabsTrigger>
          <TabsTrigger value="status">Live Status</TabsTrigger>
          <TabsTrigger value="database">Database ({dbProducts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-coral">{gumroadProducts.length}</div>
                <p className="text-sm text-coolGray">Ready for migration</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {Array.from(migrationStatuses.values()).filter(s => s.stage === 'complete').length}
                </div>
                <p className="text-sm text-coolGray">Successfully migrated</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-mint">
                  {migrationStatuses.size > 0 
                    ? Math.round((Array.from(migrationStatuses.values()).filter(s => s.stage === 'complete').length / migrationStatuses.size) * 100)
                    : 0}%
                </div>
                <p className="text-sm text-coolGray">Migration accuracy</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={migrateBulk} 
                disabled={!isConnected || isBulkMigrating || gumroadProducts.length === 0}
                className="w-full bg-coral hover:bg-coral/90 h-12"
              >
                {isBulkMigrating ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-pulse" />
                    Migrating All Products...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Bulk Migration ({gumroadProducts.length} products)
                  </>
                )}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={fetchGumroadProducts}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Products
                </Button>
                <Button variant="outline" onClick={refreshProducts}>
                  <Database className="w-4 h-4 mr-2" />
                  Refresh Database
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
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
                          onClick={() => migrateProduct(product)}
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
                        {getStageIcon(status.stage)}
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
                        <div className={`w-3 h-3 rounded-full ${getStageColor(status.stage)}`} />
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
