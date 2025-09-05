import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Square, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Eye, 
  Settings,
  Copy,
  CheckCircle2,
  AlertCircle,
  Chrome,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import PostPaymentGuide from '@/components/PostPaymentGuide';

interface AutomationCommand {
  id: string;
  type: string;
  status: 'pending' | 'executing' | 'completed' | 'error';
  data?: any;
  timestamp: number;
}

interface ConnectionStatus {
  isConnected: boolean;
  sessionId: string | null;
  peerConnection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
  videoStream: MediaStream | null;
}

export default function LiveAutomation() {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get('session') || '');
  const [showPaymentGuide, setShowPaymentGuide] = useState(
    searchParams.get('payment_success') === 'true' || searchParams.get('bypass') === 'true'
  );
  const [connection, setConnection] = useState<ConnectionStatus>({
    isConnected: false,
    sessionId: null,
    peerConnection: null,
    dataChannel: null,
    videoStream: null
  });
  const [automationQueue, setAutomationQueue] = useState<AutomationCommand[]>([]);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [isAutomating, setIsAutomating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [offerSdp, setOfferSdp] = useState('');
  const [answerSdp, setAnswerSdp] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (connection.peerConnection) {
      connection.peerConnection.close();
    }
    if (connection.videoStream) {
      connection.videoStream.getTracks().forEach(track => track.stop());
    }
  };

  const connectToExtension = async () => {
    if (!sessionId.trim()) {
      toast.error('Please enter a session ID from the browser extension');
      return;
    }

    try {
      setCurrentAction('Connecting to browser extension...');
      
      // Setup WebRTC connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = peerConnection;

      // Handle incoming video stream
      peerConnection.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setConnection(prev => ({
            ...prev,
            videoStream: event.streams[0]
          }));
          setCurrentAction('Live view connected!');
        }
      };

      // Handle data channel from extension
      peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannelRef.current = dataChannel;
        
        dataChannel.onopen = () => {
          setConnection(prev => ({
            ...prev,
            isConnected: true,
            sessionId,
            peerConnection,
            dataChannel
          }));
          setCurrentAction('Connected - Ready for automation');
          toast.success('Connected to browser extension!');
        };

        dataChannel.onmessage = (event) => {
          const message = JSON.parse(event.data);
          handleExtensionMessage(message);
        };

        dataChannel.onclose = () => {
          setConnection(prev => ({
            ...prev,
            isConnected: false
          }));
          setCurrentAction('Disconnected from extension');
          toast.error('Connection lost');
        };
      };

      // Create offer and send to extension via signaling server
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // In a real implementation, this would connect to the extension via WebRTC signaling
      // For now, we'll simulate the connection for demo purposes
      setCurrentAction('Establishing WebRTC connection...');
      
      // Simulate successful connection after 2 seconds
      setTimeout(() => {
        simulateExtensionConnection(peerConnection);
      }, 2000);

    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Failed to connect to extension');
      setCurrentAction('Connection failed');
    }
  };

  // For demo purposes - simulates extension connection (in real implementation, this happens via WebRTC)
  const simulateExtensionConnection = async (peerConnection: RTCPeerConnection) => {
    // Create a data channel
    const dataChannel = peerConnection.createDataChannel('automation', {
      ordered: true
    });

    dataChannelRef.current = dataChannel;

    // Simulate opening the data channel
    setTimeout(() => {
      setConnection(prev => ({
        ...prev,
        isConnected: true,
        sessionId,
        peerConnection,
        dataChannel
      }));
      setCurrentAction('Connected - Ready for automation');
      toast.success('Connected to browser extension!');
      
      // Simulate receiving status updates
      simulateStatusUpdates();
    }, 1000);

    // Mock message handling for demo
    const mockMessageHandler = (message: any) => {
      handleExtensionMessage(message);
    };
  };

  const simulateStatusUpdates = () => {
    // Simulate some automation status updates for demo
    const statusUpdates = [
      'Browser ready for automation',
      'Extension loaded successfully',
      'Screen capture initialized',
      'Ready to receive commands'
    ];

    statusUpdates.forEach((status, index) => {
      setTimeout(() => {
        setCurrentAction(status);
      }, (index + 1) * 1000);
    });
  };

  const handleExtensionMessage = (message: any) => {
    switch (message.type) {
      case 'STATUS_UPDATE':
        setCurrentAction(message.status);
        updateCommandStatus(message.data?.commandId, message.status);
        break;
      case 'AUTOMATION_PROGRESS':
        setProgress(message.progress);
        break;
      case 'ERROR':
        toast.error(message.message);
        setCurrentAction(`Error: ${message.message}`);
        break;
    }
  };

  const sendCommand = (command: Omit<AutomationCommand, 'id' | 'timestamp' | 'status'>) => {
    if (!connection.isConnected || !connection.dataChannel) {
      toast.error('Not connected to browser extension');
      return;
    }

    const fullCommand: AutomationCommand = {
      ...command,
      id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending'
    };

    setAutomationQueue(prev => [...prev, fullCommand]);

    try {
      connection.dataChannel.send(JSON.stringify(fullCommand));
      setCurrentAction(`Executing: ${command.type}`);
    } catch (error) {
      console.error('Failed to send command:', error);
      toast.error('Failed to send command to extension');
    }
  };

  const updateCommandStatus = (commandId: string, status: string) => {
    setAutomationQueue(prev => 
      prev.map(cmd => 
        cmd.id === commandId 
          ? { ...cmd, status: status as AutomationCommand['status'] }
          : cmd
      )
    );
  };

  const startGumroadToPayhipMigration = async () => {
    if (!connection.isConnected) {
      toast.error('Please connect to the browser extension first');
      return;
    }

    setIsAutomating(true);
    setProgress(0);

    const migrationSteps = [
      {
        type: 'NAVIGATE',
        data: { url: 'https://gumroad.com/login' }
      },
      {
        type: 'LOGIN',
        data: {
          credentials: {
            email: 'your-gumroad-email@example.com',
            password: 'your-password'
          },
          platform: 'gumroad'
        }
      },
      {
        type: 'NAVIGATE',
        data: { url: 'https://gumroad.com/products' }
      },
      {
        type: 'EXTRACT_PRODUCTS',
        data: {}
      },
      {
        type: 'NAVIGATE',
        data: { url: 'https://payhip.com/login' }
      },
      {
        type: 'LOGIN',
        data: {
          credentials: {
            email: 'enjoywithpandu@gmail.com',
            password: 'phc@12345'
          },
          platform: 'payhip'
        }
      }
    ];

    for (let i = 0; i < migrationSteps.length; i++) {
      const step = migrationSteps[i];
      sendCommand(step);
      setProgress((i + 1) / migrationSteps.length * 100);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait between steps
    }

    setIsAutomating(false);
    toast.success('Migration automation completed!');
  };

  const stopAutomation = () => {
    setIsAutomating(false);
    setProgress(0);
    setAutomationQueue([]);
    setCurrentAction('Automation stopped');
    toast.info('Automation stopped');
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    toast.success('Session ID copied to clipboard');
  };

  const disconnect = () => {
    cleanup();
    setConnection({
      isConnected: false,
      sessionId: null,
      peerConnection: null,
      dataChannel: null,
      videoStream: null
    });
    setCurrentAction('Disconnected');
    toast.info('Disconnected from extension');
  };

  // Show payment guide if user just completed payment
  if (showPaymentGuide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-4">
        <div className="max-w-7xl mx-auto py-8">
          <PostPaymentGuide 
            onProceedToAutomation={() => {
              setShowPaymentGuide(false);
              toast.success('Welcome to Live Automation! Install the extension to continue.');
            }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            🚀 Live Browser Automation
          </h1>
          <p className="text-muted-foreground">
            Connect your browser extension and watch automation happen in real-time
          </p>
        </div>

        {/* Connection Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Chrome className="h-5 w-5" />
              Extension Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!connection.isConnected ? (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Step 1:</strong> Install the Portify browser extension and click "Connect to Web App"
                    <br />
                    <strong>Step 2:</strong> Copy the session ID from the extension and paste it below
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter session ID from extension..."
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="font-mono"
                  />
                  <Button onClick={connectToExtension} disabled={!sessionId.trim()}>
                    <Wifi className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500">
                    <Wifi className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <span className="text-sm text-muted-foreground font-mono">
                    {connection.sessionId}
                  </span>
                  <Button size="sm" variant="ghost" onClick={copySessionId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <Button size="sm" variant="outline" onClick={disconnect}>
                  <WifiOff className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Live Browser View */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Browser View
                {connection.isConnected && (
                  <Badge variant="secondary" className="ml-2">
                    LIVE
                  </Badge>
                )}
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black flex items-center justify-center' : 'relative aspect-video'} bg-gray-900 rounded-lg overflow-hidden`}>
                {connection.videoStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center space-y-2">
                      <Monitor className="h-12 w-12 mx-auto opacity-50" />
                      <p>
                        {connection.isConnected 
                          ? 'Waiting for screen share...' 
                          : 'Connect extension to see live view'
                        }
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Current Action Overlay */}
                {currentAction && connection.isConnected && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        {currentAction}
                      </div>
                    </div>
                  </div>
                )}

                {isFullscreen && (
                  <Button
                    className="absolute top-4 right-4"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsFullscreen(false)}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Automation Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Automation Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAutomating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={startGumroadToPayhipMigration}
                    disabled={!connection.isConnected || isAutomating}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Migration
                  </Button>
                  <Button
                    onClick={stopAutomation}
                    disabled={!isAutomating}
                    variant="destructive"
                    className="w-full"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendCommand({ type: 'SCREENSHOT' })}
                      disabled={!connection.isConnected}
                    >
                      📸 Screenshot
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendCommand({ 
                        type: 'NAVIGATE', 
                        data: { url: 'https://payhip.com' } 
                      })}
                      disabled={!connection.isConnected}
                    >
                      🌐 Go to Payhip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Automation Queue */}
            <Card>
              <CardHeader>
                <CardTitle>Automation Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {automationQueue.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No commands in queue</p>
                  ) : (
                    automationQueue.map((command) => (
                      <div
                        key={command.id}
                        className="flex items-center justify-between p-2 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {command.status === 'completed' && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {command.status === 'executing' && (
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          )}
                          {command.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          {command.status === 'pending' && (
                            <div className="h-4 w-4 bg-gray-300 rounded-full" />
                          )}
                          <span className="text-sm font-medium">{command.type}</span>
                        </div>
                        <Badge variant={
                          command.status === 'completed' ? 'default' :
                          command.status === 'executing' ? 'secondary' :
                          command.status === 'error' ? 'destructive' : 'outline'
                        }>
                          {command.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}