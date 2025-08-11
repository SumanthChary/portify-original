import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Play, Zap, Shield, Users } from 'lucide-react';
import { smartBrowserAutomation } from '@/services/SmartBrowserAutomation';
import { toast } from 'sonner';

interface Credentials {
  email: string;
  password: string;
}

interface MigrationProgress {
  step: string;
  progress: number;
  message: string;
}

export const SmartMigrationInterface: React.FC = () => {
  const [sourcePlatform, setSourcePlatform] = useState('');
  const [destPlatform, setDestPlatform] = useState('');
  const [sourceCredentials, setSourceCredentials] = useState<Credentials>({ email: '', password: '' });
  const [destCredentials, setDestCredentials] = useState<Credentials>({ email: '', password: '' });
  const [showSourcePassword, setShowSourcePassword] = useState(false);
  const [showDestPassword, setShowDestPassword] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);

  const supportedPlatforms = smartBrowserAutomation.getSupportedPlatforms();

  const handleStartMigration = async () => {
    if (!sourcePlatform || !destPlatform || !sourceCredentials.email || !destCredentials.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsRunning(true);
    setProgress({ step: 'initializing', progress: 0, message: 'Starting smart migration...' });

    try {
      // Simulate progress updates
      const progressSteps = [
        { step: 'login_source', progress: 20, message: `Logging into ${sourcePlatform}...` },
        { step: 'login_dest', progress: 40, message: `Logging into ${destPlatform}...` },
        { step: 'extracting', progress: 60, message: 'Extracting products...' },
        { step: 'migrating', progress: 80, message: 'Migrating products...' },
        { step: 'completing', progress: 100, message: 'Finalizing migration...' }
      ];

      for (const step of progressSteps) {
        setProgress(step);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const result = await smartBrowserAutomation.startSmartMigration(
        sourcePlatform,
        destPlatform,
        sourceCredentials,
        destCredentials
      );

      if (result.success) {
        toast.success(result.message);
        setProgress({ step: 'completed', progress: 100, message: 'Migration completed successfully!' });
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('Migration error:', error);
      toast.error(error instanceof Error ? error.message : 'Migration failed');
      setProgress({ step: 'error', progress: 0, message: 'Migration failed' });
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(null), 5000);
    }
  };

  const renderCredentialForm = (
    type: 'source' | 'dest',
    credentials: Credentials,
    setCredentials: (creds: Credentials) => void,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void,
    platform: string
  ) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${type}-email`}>Email</Label>
        <Input
          id={`${type}-email`}
          type="email"
          placeholder="your@email.com"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-password`}>Password</Label>
        <div className="relative">
          <Input
            id={`${type}-password`}
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {platform && (
        <div className="p-3 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            We'll securely log into your <strong>{platform}</strong> account using browser automation
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Smart Browser Migration</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Director.ai-style automation that logs into your accounts and migrates products seamlessly
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            Secure
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Fast
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            Your Accounts
          </Badge>
        </div>
      </div>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Selection</CardTitle>
          <CardDescription>Choose your source and destination platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Source Platform</Label>
              <Select value={sourcePlatform} onValueChange={setSourcePlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source platform" />
                </SelectTrigger>
                <SelectContent>
                  {supportedPlatforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Destination Platform</Label>
              <Select value={destPlatform} onValueChange={setDestPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination platform" />
                </SelectTrigger>
                <SelectContent>
                  {supportedPlatforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials */}
      {sourcePlatform && destPlatform && (
        <Card>
          <CardHeader>
            <CardTitle>Account Credentials</CardTitle>
            <CardDescription>
              Enter your login credentials for both platforms. We use secure browser automation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="source" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="source">
                  Source: {sourcePlatform.charAt(0).toUpperCase() + sourcePlatform.slice(1)}
                </TabsTrigger>
                <TabsTrigger value="dest">
                  Destination: {destPlatform.charAt(0).toUpperCase() + destPlatform.slice(1)}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="source" className="mt-4">
                {renderCredentialForm(
                  'source',
                  sourceCredentials,
                  setSourceCredentials,
                  showSourcePassword,
                  setShowSourcePassword,
                  sourcePlatform
                )}
              </TabsContent>
              <TabsContent value="dest" className="mt-4">
                {renderCredentialForm(
                  'dest',
                  destCredentials,
                  setDestCredentials,
                  showDestPassword,
                  setShowDestPassword,
                  destPlatform
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      {progress && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{progress.message}</span>
                <span className="text-sm text-muted-foreground">{progress.progress}%</span>
              </div>
              <Progress value={progress.progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Migration */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleStartMigration}
            disabled={!sourcePlatform || !destPlatform || !sourceCredentials.email || !destCredentials.email || isRunning}
            className="w-full"
            size="lg"
          >
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? 'Migration in Progress...' : 'Start Smart Migration'}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            This will open browser windows to login and migrate your products
          </p>
        </CardContent>
      </Card>
    </div>
  );
};