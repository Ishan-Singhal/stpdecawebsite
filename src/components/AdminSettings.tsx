import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, TestTube, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DECAConfig from '@/lib/DECAConfig';

const AdminSettings = () => {
  const [tempUrl, setTempUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const { toast } = useToast();

  // Load current config on mount
  useEffect(() => {
    const config = DECAConfig.getConfig();
    setCurrentUrl(config.googleAppsScriptUrl);
    setTempUrl(config.googleAppsScriptUrl);
    setLastUpdated(config.lastUpdated);
    
    // Test initial connection
    testCurrentConnection();
  }, []);

  const testCurrentConnection = async () => {
    const result = await DECAConfig.testConnection();
    setIsConnected(result.success);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update the master config
      DECAConfig.updateGoogleAppsScriptUrl(tempUrl);
      setCurrentUrl(tempUrl);
      setLastUpdated(new Date().toISOString());
      
      // Test the connection
      const result = await DECAConfig.testConnection();
      setIsConnected(result.success);
      
      toast({
        title: result.success ? "Success" : "Warning",
        description: result.success 
          ? "Google Apps Script URL updated for ALL users! 🎉" 
          : result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Google Apps Script Integration
          {isConnected ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </CardTitle>
        <CardDescription>
          Configure your Google Apps Script Web App URL to sync Calendar, Drive, and Sheets data.
          This URL will be used by ALL users automatically - no individual setup required!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-sm">
            <div><strong>Current URL:</strong> <code className="text-xs">{currentUrl}</code></div>
            <div><strong>Last Updated:</strong> {new Date(lastUpdated).toLocaleString()}</div>
            <div><strong>Status:</strong> 
              <span className={`ml-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? '✅ Connected' : '❌ Not Connected'}
              </span>
            </div>
          </div>
        </div>
        <form onSubmit={handleSaveAndTest} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">New Google Apps Script Web App URL</Label>
            <Input
              id="webhookUrl"
              type="url"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              ⚡ Updating this will immediately change the URL for ALL users across the entire website
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isLoading ? 'Updating...' : 'Update for All Users'}
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              onClick={testCurrentConnection}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Test Current URL
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;