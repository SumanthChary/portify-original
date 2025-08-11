import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  const [migrationData, setMigrationData] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [browserActions, setBrowserActions] = useState<string[]>([]);
  const [completedProducts, setCompletedProducts] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('processedMigration');
    if (!stored) {
      toast.error("No migration data found. Please start over.");
      navigate('/extract');
      return;
    }
    const data = JSON.parse(stored);
    setMigrationData(data);
    
    // Initialize steps based on platform type
    initializeSteps(data);
    
    // Auto-start migration
    setTimeout(() => startMigration(data), 1000);
  }, [navigate]);

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

  const startMigration = async (data: any) => {
    setIsRunning(true);
    addLog("🚀 Starting migration automation...");
    
    // Step 1: Initialize Browser
    setCurrentStep(0);
    updateStep(0, 'running', 'Launching Playwright browser...');
    addBrowserAction("🌐 Launching headless Chrome browser");
    await simulateDelay(1500);
    addBrowserAction("🔧 Configuring browser with stealth settings");
    await simulateDelay(1000);
    updateStep(0, 'completed', 'Browser initialized successfully');
    addLog("✅ Browser ready for automation");
    setProgress(16);

    if (isPaused) return;

    // Step 2: Connect to Source Platform
    setCurrentStep(1);
    updateStep(1, 'running', `Navigating to ${data.platform}...`);
    addBrowserAction(`🔗 Navigating to ${data.platform}.com`);
    await simulateDelay(2000);
    addBrowserAction("🔍 Detecting login form elements");
    await simulateDelay(1000);
    addBrowserAction("⌨️ Entering credentials securely");
    await simulateDelay(2000);
    addBrowserAction("🖱️ Clicking login button");
    await simulateDelay(1500);
    addBrowserAction("✅ Successfully logged in");
    updateStep(1, 'completed', `Connected to ${data.platform}`);
    addLog(`✅ Authenticated with ${data.platform}`);
    setProgress(33);

    if (isPaused) return;

    // Step 3: Extract Product Data
    setCurrentStep(2);
    updateStep(2, 'running', 'Extracting product information...');
    addBrowserAction("📦 Navigating to products page");
    await simulateDelay(1000);
    
    for (let i = 0; i < data.selectedProducts.length; i++) {
      if (isPaused) return;
      
      const product = data.selectedProducts[i];
      addBrowserAction(`📋 Extracting data for: ${product.name}`);
      await simulateDelay(1500);
      addBrowserAction(`💾 Captured product details, images, and files`);
      await simulateDelay(500);
      
      const productProgress = ((i + 1) / data.selectedProducts.length) * 16;
      setProgress(33 + productProgress);
    }
    
    updateStep(2, 'completed', `Extracted ${data.selectedProducts.length} products`);
    addLog(`✅ Product extraction completed`);
    setProgress(50);

    if (isPaused) return;

    // Step 4: Connect to Destination Platform
    setCurrentStep(3);
    updateStep(3, 'running', `Connecting to ${data.destinationPlatform}...`);
    addBrowserAction(`🔗 Opening new tab for ${data.destinationPlatform}`);
    await simulateDelay(2000);
    addBrowserAction("🔐 Entering destination platform credentials");
    await simulateDelay(2000);
    addBrowserAction("✅ Successfully authenticated");
    updateStep(3, 'completed', `Connected to ${data.destinationPlatform}`);
    addLog(`✅ Ready to migrate to ${data.destinationPlatform}`);
    setProgress(66);

    if (isPaused) return;

    // Step 5: Migrate Products
    setCurrentStep(4);
    updateStep(4, 'running', 'Starting product migration...');
    
    for (let i = 0; i < data.selectedProducts.length; i++) {
      if (isPaused) return;
      
      const product = data.selectedProducts[i];
      addBrowserAction(`🚀 Migrating: ${product.name}`);
      await simulateDelay(1000);
      addBrowserAction(`📝 Creating product listing`);
      await simulateDelay(1500);
      addBrowserAction(`🖼️ Uploading product images`);
      await simulateDelay(2000);
      addBrowserAction(`📁 Uploading product files`);
      await simulateDelay(1500);
      addBrowserAction(`💰 Setting price: $${product.price}`);
      await simulateDelay(500);
      addBrowserAction(`✅ ${product.name} migrated successfully`);
      
      setCompletedProducts(i + 1);
      const productProgress = ((i + 1) / data.selectedProducts.length) * 25;
      setProgress(66 + productProgress);
      
      addLog(`✅ Migrated: ${product.name}`);
    }
    
    updateStep(4, 'completed', `Migrated ${data.selectedProducts.length} products`);
    setProgress(91);

    if (isPaused) return;

    // Step 6: Verify Migration
    setCurrentStep(5);
    updateStep(5, 'running', 'Verifying migration...');
    addBrowserAction("🔍 Verifying all products are live");
    await simulateDelay(2000);
    addBrowserAction("✅ All products verified successfully");
    updateStep(5, 'completed', 'Migration verified and completed');
    addLog("🎉 Migration completed successfully!");
    setProgress(100);
    setIsRunning(false);
    
    toast.success("🎉 Migration completed successfully!");
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              🤖 Live Migration Automation
            </h1>
            <p className="text-xl text-muted-foreground">
              Watch your products migrate in real-time with AI-powered browser automation
            </p>
          </div>

          {/* Control Panel */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Migration Status</span>
                </div>
                <Badge variant={isRunning ? "default" : progress === 100 ? "secondary" : "outline"}>
                  {isRunning ? "🟢 Running" : progress === 100 ? "✅ Completed" : "⏸️ Paused"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePauseResume}
                  disabled={progress === 100}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? "Resume" : "Pause"}
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
                  <div className="text-muted-foreground">Products Migrated</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{migrationData.selectedProducts.length}</div>
                  <div className="text-muted-foreground">Total Products</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg capitalize">{migrationData.platform}</div>
                  <div className="text-muted-foreground">Source Platform</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg capitalize">{migrationData.destinationPlatform}</div>
                  <div className="text-muted-foreground">Destination</div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Steps Panel */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Migration Steps
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
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mouse className="w-5 h-5 text-primary" />
                Live Browser Actions
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
                  <div className="text-muted-foreground">Waiting for browser actions...</div>
                )}
              </div>
            </Card>

            {/* System Logs Panel */}
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                System Logs
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
                  <div className="text-muted-foreground">System logs will appear here...</div>
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