import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useExtensionConnection } from '@/hooks/useExtensionConnection';
import { Wifi, WifiOff, Copy, Play, Square, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExtensionConnectorProps {
  onConnected?: () => void;
  onCommandComplete?: (result: any) => void;
}

export function ExtensionConnector({ onConnected, onCommandComplete }: ExtensionConnectorProps) {
  const { connectionState, messages, connect, disconnect, sendCommand, isConnected } = useExtensionConnection();
  const [sessionIdInput, setSessionIdInput] = useState('');
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!sessionIdInput.trim()) {
      toast({
        title: 'Session ID Required',
        description: 'Please enter the Session ID from the browser extension.',
        variant: 'destructive'
      });
      return;
    }
    
    await connect(sessionIdInput.trim());
    onConnected?.();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleTestCommand = () => {
    sendCommand({
      type: 'navigate',
      url: 'https://payhip.com'
    });
  };

  const getStatusIcon = () => {
    switch (connectionState.status) {
      case 'connected':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'connecting':
      case 'waiting':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <WifiOff className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionState.status) {
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Connecting...</Badge>;
      case 'waiting':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Waiting for Extension...</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getStatusIcon()}
            Browser Extension Connection
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Session ID (from browser extension)
                </label>
                <div className="flex gap-2">
                  <Input
                    value={sessionIdInput}
                    onChange={(e) => setSessionIdInput(e.target.value)}
                    placeholder="session_1234567890_abc123"
                    className="font-mono text-sm"
                  />
                  <Button 
                    onClick={handleConnect}
                    disabled={connectionState.status === 'connecting' || connectionState.status === 'waiting'}
                  >
                    {connectionState.status === 'connecting' || connectionState.status === 'waiting' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wifi className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-2">
                <p className="font-medium">Quick Start:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Install the Portify browser extension</li>
                  <li>Click "Connect to Web App" in the extension</li>
                  <li>Copy the Session ID shown in the extension</li>
                  <li>Paste it above and click Connect</li>
                  <li>Connection will be established automatically!</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Connected to: <code className="text-xs bg-muted px-1 py-0.5 rounded">{connectionState.sessionId}</code></span>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  <Square className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleTestCommand}>
                  <Send className="h-4 w-4 mr-2" />
                  Test: Navigate to Payhip
                </Button>
              </div>
            </>
          )}

          {connectionState.error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              {connectionState.error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages Log */}
      {messages.length > 0 && (
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-xs">
              {messages.slice(-10).map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-2 rounded ${
                    msg.status === 'ERROR' ? 'bg-red-500/10 text-red-400' :
                    msg.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                    'bg-muted/30 text-muted-foreground'
                  }`}
                >
                  <span className="opacity-50">{new Date(msg.timestamp || 0).toLocaleTimeString()}</span>
                  {' '}{msg.type}: {msg.message || msg.status || JSON.stringify(msg).slice(0, 50)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
