import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, TestTube, CheckCircle, XCircle, RefreshCw, Lock, Unlock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DECAConfig from '@/lib/DECAConfig';

const AdminSettings = () => {
  const [tempUrl, setTempUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [configInfo, setConfigInfo] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordChange, setPasswordChange] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const { toast } = useToast();

  // Load current config on mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setIsInitialLoading(true);
    try {
      // Fetch current configuration from Google Apps Script
      const config = await DECAConfig.getConfig();
      const adminInfo = await DECAConfig.getAdminInfo();
      
      setCurrentUrl(config.googleAppsScriptUrl);
      setTempUrl(config.googleAppsScriptUrl);
      setConfigInfo(config);
      
      console.log('Loaded config:', config);
      console.log('Admin info:', adminInfo);
      
      // Test initial connection
      await testCurrentConnection();
    } catch (error) {
      console.error('Failed to load configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load current configuration",
        variant: "destructive"
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  const testCurrentConnection = async () => {
    try {
      const result = await DECAConfig.testBasicConnection();
      setIsConnected(result.success);
      return result;
    } catch (error) {
      setIsConnected(false);
      return { success: false, message: error.message };
    }
  };

  const testUrlConnection = async () => {
    if (!tempUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to test",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await DECAConfig.testConnection(tempUrl);
      
      toast({
        title: result.success ? "Success" : "Warning",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test connection",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tempUrl.trim()) {
      toast({
        title: "Error",
        description: "URL cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (!adminPassword.trim()) {
      toast({
        title: "Error",
        description: "Admin password is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update configuration in Google Apps Script
      const result = await DECAConfig.updateConfig(tempUrl, adminPassword, 'Admin Panel');
      
      if (result.success) {
        // Update local state
        setCurrentUrl(tempUrl);
        setConfigInfo(result.newConfig);
        setAdminPassword(''); // Clear password for security
        setIsLocked(true); // Lock the panel after successful update
        
        // Test the new connection
        await testCurrentConnection();
        
        toast({
          title: "🎉 Success!",
          description: "Configuration updated for ALL users globally!",
          variant: "default"
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordChange.current || !passwordChange.new || !passwordChange.confirm) {
      toast({
        title: "Error",
        description: "All password fields are required",
        variant: "destructive"
      });
      return;
    }

    if (passwordChange.new !== passwordChange.confirm) {
      toast({
        title: "Error", 
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (passwordChange.new.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long", 
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await DECAConfig.setAdminPassword(passwordChange.current, passwordChange.new);
      
      setPasswordChange({ current: '', new: '', confirm: '' });
      setShowPasswordChange(false);
      
      toast({
        title: "Success",
        description: "Admin password updated successfully",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConfiguration = async () => {
    await DECAConfig.refreshConfig();
    await loadConfiguration();
    toast({
      title: "Refreshed",
      description: "Configuration reloaded from server",
      variant: "default"
    });
  };

  if (isInitialLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading configuration...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Configuration Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Configuration Management
            {isConnected ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardTitle>
          <CardDescription>
            Centralized Google Apps Script configuration. Changes here affect ALL users instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current Status */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm space-y-2">
              <div><strong>Current URL:</strong> <code className="text-xs break-all">{currentUrl}</code></div>
              {configInfo && (
                <>
                  <div><strong>Last Updated:</strong> {new Date(configInfo.lastUpdated).toLocaleString()}</div>
                  <div><strong>Updated By:</strong> {configInfo.updatedBy}</div>
                  <div><strong>Config Source:</strong> {configInfo.configSource}</div>
                  <div><strong>Version:</strong> {configInfo.version}</div>
                </>
              )}
              <div><strong>Connection Status:</strong> 
                <span className={`ml-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? '✅ Connected' : '❌ Not Connected'}
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={testCurrentConnection}
                disabled={isLoading}
              >
                <TestTube className="h-3 w-3 mr-1" />
                Test Connection
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshConfiguration}
                disabled={isLoading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh Config
              </Button>
            </div>
          </div>

          {/* Admin Authentication */}
          {isLocked && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Admin Authentication Required</h3>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                ⚠️ This will update the configuration for ALL users globally and immediately.
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && setIsLocked(false)}
                />
                <Button
                  onClick={() => setIsLocked(false)}
                  variant="default"
                  disabled={!adminPassword.trim()}
                >
                  <Unlock className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Configuration Form */}
          {!isLocked && (
            <form onSubmit={handleUpdateConfig} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newUrl">New Google Apps Script Web App URL</Label>
                <Input
                  id="newUrl"
                  type="url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-red-500 font-medium">
                  ⚡ This will immediately update the URL for ALL users across the entire system
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {isLoading ? 'Updating Global Config...' : 'Update for All Users'}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={testUrlConnection}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Test New URL
                </Button>

                <Button 
                  type="button"
                  variant="secondary"
                  onClick={() => setIsLocked(true)}
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Lock Panel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Password Management Card */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage admin password for configuration changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordChange ? (
            <Button 
              variant="outline"
              onClick={() => setShowPasswordChange(true)}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Change Admin Password
            </Button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordChange.current}
                  onChange={(e) => setPasswordChange({...passwordChange, current: e.target.value})}
                  placeholder="Enter current password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordChange.new}
                  onChange={(e) => setPasswordChange({...passwordChange, new: e.target.value})}
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordChange.confirm}
                  onChange={(e) => setPasswordChange({...passwordChange, confirm: e.target.value})}
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordChange({ current: '', new: '', confirm: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;