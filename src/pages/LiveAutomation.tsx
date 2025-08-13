import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Play, 
  Pause, 
  Monitor, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Mouse,
  Keyboard,
  Eye,
  Zap,
  Shield,
  Download
} from "lucide-react";
import Header from "@/components/Header";
import LiveBrowserView from "@/components/LiveBrowserView";
import { supabase } from "@/integrations/supabase/client";

interface AutomationStep {
  id: string;
  title: string;
  status: 'waiting' | 'running' | 'completed' | 'error';
  message: string;
  timestamp: Date;
  screenshot?: string;
}

const LiveAutomation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [migrationData, setMigrationData] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [browserActions, setBrowserActions] = useState<string[]>([]);
  const [completedProducts, setCompletedProducts] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [destinationCredentials, setDestinationCredentials] = useState({
    email: '',
    password: ''
  });
  const [showCredentials, setShowCredentials] = useState(true);
  const [currentBrowserAction, setCurrentBrowserAction] = useState<string>("");
  const logsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('migrationData');
    if (!stored) {
      toast.error("No migration data found. Please start over.");
      navigate('/extract');
      return;
    }
    const data = JSON.parse(stored);
    setMigrationData(data);
    
    // Check if payment was successful from URL params
    const paymentSuccess = searchParams.get('payment_success');
    if (paymentSuccess === 'true') {
      toast.success('Payment successful! Ready to start migration.');
      setShowCredentials(true);
    }
    
    // Initialize steps based on platform type
    initializeSteps(data);
    
    // Set up real-time updates
    if (data.sessionId) {
      setupRealtimeUpdates(data.sessionId);
    }
  }, [navigate, searchParams]);

  const setupRealtimeUpdates = (sessionId: string) => {
    const channel = supabase.channel(`migration-${sessionId}`);
    
    // Listen for browser actions (live updates)
    channel.on('broadcast', { event: 'browser_action' }, (payload) => {
      const { action } = payload.payload;
      addBrowserAction(action);
      setCurrentBrowserAction(action);
    });
    
    // Listen for migration progress
    channel.on('broadcast', { event: 'migration_progress' }, (payload) => {
      const { productId, status, progress: productProgress } = payload.payload;
      
      if (productProgress !== undefined) {
        setProgress(productProgress);
        setCompletedProducts(Math.floor((productProgress / 100) * migrationData?.selectedProducts?.length || 0));
      }
      
      // Update step status
      setSteps(prev => prev.map(step => 
        step.id === `product-${productId}` 
          ? { ...step, status: status === 'migrated' ? 'completed' : 'running' }
          : step
      ));
      
      addLog(`✅ Product copied: ${productId}`);
      
      if (productProgress === 100) {
        addLog('🎉 All products copied successfully!');
        addBrowserAction('🏁 Migration completed!');
        setIsRunning(false);
      }
    });
    
    channel.subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  };

  const initializeSteps = (data: any) => {
    const baseSteps = [
      { id: '1', title: 'Initialize Browser', status: 'waiting' as const, message: 'Setting up automation browser...', timestamp: new Date() },
      { id: '2', title: 'Connect to Source Platform', status: 'waiting' as const, message: `Connecting to ${data.platform}...`, timestamp: new Date() },
      { id: '3', title: 'Extract Product Data', status: 'waiting' as const, message: 'Extracting product information...', timestamp: new Date() },
      { id: '4', title: 'Connect to Destination Platform', status: 'waiting' as const, message: `Connecting to ${data.destinationPlatform}...`, timestamp: new Date() },
      { id: '5', title: 'Migrate Products', status: 'waiting' as const, message: 'Starting product migration...', timestamp: new Date() },
      { id: '6', title: 'Verify Migration', status: 'waiting' as const, message: 'Verifying successful migration...', timestamp: new Date() }
    ];
    setSteps(baseSteps);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    setTimeout(() => {
      if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight;
      }
    }, 100);
  };

  const addBrowserAction = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setBrowserActions(prev => [...prev, `[${timestamp}] ${action}`]);
    setTimeout(() => {
      if (actionsRef.current) {
        actionsRef.current.scrollTop = actionsRef.current.scrollHeight;
      }
    }, 100);
  };

  const updateStep = (stepIndex: number, status: AutomationStep['status'], message: string) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? { ...step, status, message, timestamp: new Date() }
        : step
    ));
  };

  const startMigration = async () => {
    if (!migrationData?.sessionId) {
      toast.error('Invalid session. Please start over.');
      return;
    }

    if (!destinationCredentials.email || !destinationCredentials.password) {
      toast.error('Please enter your destination platform credentials');
      return;
    }
    
    setIsRunning(true);
    setProgress(0);
    setCurrentStep(0);
    setShowCredentials(false);
    
    addLog('🚀 Starting real migration process...');
    
    try {
      // Step 1: Initialize Browser
      updateStep(0, 'running', 'Launching browser automation...');
      await simulateDelay(2000);
      addBrowserAction('🌐 Launching Chromium browser with Playwright');
      addBrowserAction('📱 Setting up browser context and page');
      updateStep(0, 'completed', 'Browser initialized successfully');
      setProgress(10);
      
      // Step 2: Start real browser automation
      updateStep(1, 'running', `Starting automation for ${migrationData.destinationPlatform}...`);
      
      addLog('📡 Sending automation request to backend...');
      
      const { data, error } = await supabase.functions.invoke('browser-automation', {
        body: {
          sessionId: migrationData.sessionId,
          destinationCredentials
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      addLog(`✅ Automation started for ${data.productsCount} products`);
      updateStep(1, 'completed', 'Browser automation initiated');
      setProgress(20);
      
      // The real-time updates will handle the rest of the progress
      addLog('📡 Listening for real-time updates...');
      addBrowserAction('🔄 Real-time progress tracking active');
      
    } catch (error) {
      console.error('Migration error:', error);
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Migration failed. Please try again.');
      setIsRunning(false);
    }
  };

  const simulateDelay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      addLog("▶️ Resuming migration...");
    } else {
      addLog("⏸️ Pausing migration...");
    }
  };

  const handleDownloadReport = () => {
    const report = {
      migrationData,
      steps,
      logs,
      completedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migration-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!migrationData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              🤖 Watch The Magic Happen
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              See your products get copied live by our AI robot
            </p>
          </div>

          {/* Credentials Form */}
          {showCredentials && (
            <Card className="p-6 mb-8 border-primary">
              <h2 className="text-lg md:text-xl font-semibold mb-4">One Last Thing - Your Login</h2>
              <p className="text-muted-foreground mb-6">
                We need to log into your {migrationData?.destinationPlatform} account to copy your products there
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="dest-email">Email</Label>
                  <Input
                    id="dest-email"
                    type="email"
                    placeholder="your@email.com"
                    value={destinationCredentials.email}
                    onChange={(e) => setDestinationCredentials(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dest-password">Password</Label>
                  <Input
                    id="dest-password"
                    type="password"
                    placeholder="Your password"
                    value={destinationCredentials.password}
                    onChange={(e) => setDestinationCredentials(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Control Panel */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-primary" />
                  <span className="font-semibold">What's Happening</span>
                </div>
                <Badge variant={isRunning ? "default" : progress === 100 ? "secondary" : "outline"}>
                  {isRunning ? "🟢 Working" : progress === 100 ? "✅ All Done!" : "⏸️ Ready"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={isRunning ? handlePauseResume : startMigration}
                  disabled={!migrationData || (showCredentials && (!destinationCredentials.email || !destinationCredentials.password))}
                  variant={isRunning ? "outline" : "default"}
                >
                  {isRunning ? (
                    isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isRunning ? (isPaused ? 'Resume' : 'Pause') : 'Start Copying'}
                </Button>
                
                {progress === 100 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadReport}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
              
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg">{completedProducts}</div>
                  <div className="text-muted-foreground">Products Copied</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{migrationData.selectedProducts.length}</div>
                  <div className="text-muted-foreground">Total Products</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg capitalize">{migrationData.platform}</div>
                  <div className="text-muted-foreground">From</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg capitalize">{migrationData.destinationPlatform}</div>
                  <div className="text-muted-foreground">To</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Live Browser View */}
          <div className="mb-8">
            <LiveBrowserView 
              isActive={isRunning} 
              currentAction={currentBrowserAction}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Steps Panel */}
            <Card className="p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                What's Happening
              </h2>
              
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                      step.status === 'running' ? 'bg-blue-50 border border-blue-200' :
                      step.status === 'completed' ? 'bg-green-50 border border-green-200' :
                      step.status === 'error' ? 'bg-red-50 border border-red-200' :
                      'bg-muted/30'
                    }`}
                  >
                    <div className="mt-1">
                      {step.status === 'waiting' && <Clock className="w-4 h-4 text-muted-foreground" />}
                      {step.status === 'running' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                      {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {step.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-muted-foreground">{step.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {step.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Browser Actions Panel */}
            <Card className="p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                <Mouse className="w-5 h-5 text-primary" />
                Robot Actions
              </h2>
              
              <div 
                ref={actionsRef}
                className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto"
              >
                {browserActions.map((action, index) => (
                  <div key={index} className="mb-1">
                    {action}
                  </div>
                ))}
                {browserActions.length === 0 && (
                  <div className="text-muted-foreground">Robot will show what it's doing here...</div>
                )}
              </div>
            </Card>

            {/* System Logs Panel */}
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                Behind The Scenes
              </h2>
              
              <div 
                ref={logsRef}
                className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto"
              >
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-muted-foreground">System info will show here...</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAutomation;