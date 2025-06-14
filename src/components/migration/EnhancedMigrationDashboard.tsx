import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Zap, Database, Settings } from "lucide-react";
import { useProductsData } from "@/hooks/useProductsData";
import { n8nWorkflowService, type MigrationPayload, type MigrationProgress } from "@/services/N8nWorkflowService";
import gumroadService, { type GumroadProduct } from "@/services/GumroadService";
import { MigrationOverview } from "./MigrationOverview";
import { ProductsList } from "./ProductsList";
import { StatusMonitor } from "./StatusMonitor";
import { DatabaseView } from "./DatabaseView";
import { SystemStatusCheck } from "./SystemStatusCheck";

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
  const [activeTab, setActiveTab] = useState("system-check");
  const [isLoading, setIsLoading] = useState(false);
  const { products: dbProducts, refreshProducts } = useProductsData();

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    const statuses = Array.from(migrationStatuses.values());
    if (statuses.length > 0) {
      const totalProgress = statuses.reduce((sum, status) => sum + status.progress, 0);
      setOverallProgress(totalProgress / statuses.length);
    }
  }, [migrationStatuses]);

  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        checkN8nConnection(),
        fetchGumroadProducts()
      ]);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      toast.error("⚠️ Dashboard initialization failed");
    } finally {
      setIsLoading(false);
    }
  };

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
      if (error instanceof Error) {
        toast.error(`❌ Failed to fetch Gumroad products: ${error.message}`);
      } else {
        toast.error("❌ Failed to fetch Gumroad products");
      }
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
    
    if (!isConnected) {
      toast.error("❌ N8n connection not available");
      return;
    }

    updateMigrationStatus(productId, {
      stage: 'validation',
      progress: 5,
      message: 'Starting migration...',
      startTime: new Date(),
      attempts: 1
    });

    const payload: MigrationPayload = {
      user_email: "user@example.com",
      product_id: product.id,
      product_title: product.name,
      description: product.description || '',
      price: product.price?.toString() || '0',
      image_url: product.image || '',
      gumroad_product_id: product.id,
      permalink: product.url || '',
      product_type: 'digital',
      file_url: product.file_url || product.download_url || ''
    };

    try {
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
        await refreshProducts();
      } else {
        throw new Error(result.error || 'Migration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Migration failed';
      updateMigrationStatus(productId, {
        stage: 'failed',
        progress: 0,
        message: errorMessage,
        endTime: new Date(),
        attempts: (migrationStatuses.get(productId)?.attempts || 0) + 1
      });
      toast.error(`❌ Failed to migrate ${product.name}: ${errorMessage}`);
    } finally {
      n8nWorkflowService.unsubscribeFromProgress(productId);
    }
  };

  const migrateBulk = async () => {
    if (!isConnected) {
      toast.error("❌ N8n connection not available");
      return;
    }

    if (gumroadProducts.length === 0) {
      toast.error("❌ No products to migrate");
      return;
    }

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
      permalink: product.url || '',
      product_type: 'digital',
      file_url: product.file_url || product.download_url || ''
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
      const { successes, failures } = await n8nWorkflowService.triggerBulkMigration(payloads);
      toast.success(`🎯 Bulk migration completed: ${successes} successful, ${failures} failed`);
      await refreshProducts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bulk migration failed';
      toast.error(`❌ Bulk migration failed: ${errorMessage}`);
    } finally {
      setIsBulkMigrating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-coral" />
            <p className="text-coolGray">Loading migration dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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
          <Button onClick={checkN8nConnection} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>
          <Badge variant={isConnected ? "default" : "destructive"} className="px-3 py-1">
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system-check">
            <Settings className="w-4 h-4 mr-2" />
            System Check
          </TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products ({gumroadProducts.length})</TabsTrigger>
          <TabsTrigger value="status">Live Status</TabsTrigger>
          <TabsTrigger value="database">Database ({dbProducts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="system-check" className="space-y-6">
          <SystemStatusCheck />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Copy the script from <code>N8nInlinePlaywrightScript.js</code> into your n8n Playwright node</li>
              <li>Set environment variables in n8n: PAYHIP_EMAIL and PAYHIP_PASSWORD</li>
              <li>Enable CORS in your n8n webhook settings</li>
              <li>Run the system check above to validate everything is working</li>
            </ol>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <MigrationOverview
            gumroadProducts={gumroadProducts}
            migrationStatuses={migrationStatuses}
            isBulkMigrating={isBulkMigrating}
            overallProgress={overallProgress}
            isConnected={isConnected}
            onMigrateBulk={migrateBulk}
            onRefreshProducts={fetchGumroadProducts}
            onRefreshDatabase={refreshProducts}
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductsList
            gumroadProducts={gumroadProducts}
            migrationStatuses={migrationStatuses}
            isConnected={isConnected}
            onMigrateProduct={migrateProduct}
          />
        </TabsContent>

        <TabsContent value="status">
          <StatusMonitor
            migrationStatuses={migrationStatuses}
            gumroadProducts={gumroadProducts}
          />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseView dbProducts={dbProducts} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
