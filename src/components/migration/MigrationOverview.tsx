
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Clock, RefreshCw, Database } from "lucide-react";
import { GumroadProduct } from "@/services/GumroadService";

interface MigrationStatus {
  id: string;
  stage: 'validation' | 'download' | 'login' | 'upload' | 'publish' | 'complete' | 'failed';
  progress: number;
  message: string;
  timestamp: string;
  startTime?: Date;
  endTime?: Date;
  attempts: number;
  payhipUrl?: string;
}

interface MigrationOverviewProps {
  gumroadProducts: GumroadProduct[];
  migrationStatuses: Map<string, MigrationStatus>;
  isBulkMigrating: boolean;
  overallProgress: number;
  isConnected: boolean;
  onMigrateBulk: () => void;
  onRefreshProducts: () => void;
  onRefreshDatabase: () => void;
}

export const MigrationOverview = ({
  gumroadProducts,
  migrationStatuses,
  isBulkMigrating,
  overallProgress,
  isConnected,
  onMigrateBulk,
  onRefreshProducts,
  onRefreshDatabase,
}: MigrationOverviewProps) => {
  const completedCount = Array.from(migrationStatuses.values()).filter(s => s.stage === 'complete').length;
  const successRate = migrationStatuses.size > 0 
    ? Math.round((completedCount / migrationStatuses.size) * 100)
    : 0;

  return (
    <div className="space-y-6">
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

      {/* Stats Cards */}
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
            <div className="text-3xl font-bold text-green-500">{completedCount}</div>
            <p className="text-sm text-coolGray">Successfully migrated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-mint">{successRate}%</div>
            <p className="text-sm text-coolGray">Migration accuracy</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={onMigrateBulk} 
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
            <Button variant="outline" onClick={onRefreshProducts}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Products
            </Button>
            <Button variant="outline" onClick={onRefreshDatabase}>
              <Database className="w-4 h-4 mr-2" />
              Refresh Database
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
