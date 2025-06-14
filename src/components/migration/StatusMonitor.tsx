
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface StatusMonitorProps {
  migrationStatuses: Map<string, MigrationStatus>;
  gumroadProducts: GumroadProduct[];
}

export const StatusMonitor = ({ migrationStatuses, gumroadProducts }: StatusMonitorProps) => {
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

  return (
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
  );
};
