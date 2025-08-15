class DECAConfig {
  private static configCache: any = null;
  private static lastFetch: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Initial URL - this will be updated from the Google Apps Script itself
  private static readonly INITIAL_URL = 'https://script.google.com/macros/s/AKfycby0LGwZFHlTM0eC1nNnD6WRCoP-HCMJ8KDavLBdPuMEsrbwow7YOZ73l4ApPPJqTx8J-A/exec';

  // Fetch configuration from Google Apps Script
  static async fetchRemoteConfig(): Promise<any> {
    const now = Date.now();
    
    // Return cached config if still valid
    if (this.configCache && (now - this.lastFetch) < this.CACHE_DURATION) {
      console.log('Using cached configuration');
      return this.configCache;
    }

    // Use cached URL if available, otherwise use initial URL
    const currentUrl = this.configCache?.googleAppsScriptUrl || this.INITIAL_URL;
    
    try {
      console.log('Fetching configuration from:', currentUrl);
      
      const response = await fetch(currentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_config',
          timestamp: new Date().toISOString(),
          requestedFrom: window.location.origin
        }),
      });

      if (response.ok) {
        const config = await response.json();
        this.configCache = config;
        this.lastFetch = now;
        console.log('Configuration fetched successfully:', config.configSource);
        return config;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Failed to fetch remote config:', error);
      
      // Return fallback config if remote fetch fails
      const fallbackConfig = {
        googleAppsScriptUrl: currentUrl,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        configSource: 'Fallback (Remote Fetch Failed)',
        updatedBy: 'System'
      };
      
      // Cache the fallback briefly to avoid repeated failed requests
      if (!this.configCache) {
        this.configCache = fallbackConfig;
        this.lastFetch = now;
      }
      
      return this.configCache || fallbackConfig;
    }
  }

  // Get the current Google Apps Script URL
  static async getGoogleAppsScriptUrl(): Promise<string> {
    const config = await this.fetchRemoteConfig();
    return config.googleAppsScriptUrl;
  }

  // Get the full configuration
  static async getConfig(): Promise<any> {
    return await this.fetchRemoteConfig();
  }

  // Update configuration (admin only)
  static async updateConfig(newUrl: string, adminPassword: string, updatedBy: string = 'Admin Panel'): Promise<any> {
    if (!newUrl || !newUrl.trim()) {
      throw new Error('URL cannot be empty');
    }

    if (!newUrl.startsWith('https://script.google.com/macros/s/') || !newUrl.endsWith('/exec')) {
      throw new Error('Invalid Google Apps Script URL format. Must start with https://script.google.com/macros/s/ and end with /exec');
    }

    if (!adminPassword || !adminPassword.trim()) {
      throw new Error('Admin password is required');
    }

    try {
      const currentUrl = await this.getGoogleAppsScriptUrl();
      
      console.log('Updating configuration via:', currentUrl);
      
      const response = await fetch(currentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_config',
          newUrl: newUrl.trim(),
          adminPassword: adminPassword,
          updatedBy: updatedBy,
          timestamp: new Date().toISOString(),
          requestedFrom: window.location.origin
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Clear cache to force refresh with new config
          this.clearCache();
          console.log('Configuration updated successfully');
          return result;
        } else {
          throw new Error(result.message || 'Configuration update failed');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Configuration update failed:', error);
      throw new Error(`Configuration update failed: ${error.message}`);
    }
  }

  // Test connection to a specific URL
  static async testConnection(testUrl?: string): Promise<any> {
    const urlToTest = testUrl || await this.getGoogleAppsScriptUrl();
    
    try {
      console.log('Testing connection to:', urlToTest);
      
      const response = await fetch(urlToTest, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_url',
          testUrl: urlToTest,
          timestamp: new Date().toISOString(),
          requestedFrom: window.location.origin
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: result.success !== false,
          message: result.message || 'Connection test completed',
          url: urlToTest,
          timestamp: new Date().toISOString(),
          details: result
        };
      } else {
        return {
          success: false,
          message: `Connection failed: HTTP ${response.status}`,
          url: urlToTest,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        url: urlToTest,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Test the basic connection (existing functionality)
  static async testBasicConnection(): Promise<{ success: boolean; message: string; source: string; url: string }> {
    const url = await this.getGoogleAppsScriptUrl();
    const config = await this.getConfig();
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          config_source: config.configSource
        }),
      });

      return {
        success: true,
        message: 'Connection test sent successfully',
        source: config.configSource,
        url: url
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error}`,
        source: config.configSource,
        url: url
      };
    }
  }

  // Change admin password
  static async setAdminPassword(currentPassword: string, newPassword: string): Promise<any> {
    if (!currentPassword || !newPassword) {
      throw new Error('Both current and new passwords are required');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    try {
      const currentUrl = await this.getGoogleAppsScriptUrl();
      
      const response = await fetch(currentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_admin_password',
          currentPassword: currentPassword,
          newPassword: newPassword,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          return result;
        } else {
          throw new Error(result.message || 'Password change failed');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }

  // Clear cache to force config refresh
  static clearCache(): void {
    console.log('Clearing configuration cache');
    this.configCache = null;
    this.lastFetch = 0;
  }

  // Get configuration source info
  static async getConfigSource(): Promise<string> {
    const config = await this.getConfig();
    return config.configSource || 'Unknown';
  }

  // Check if using remote configuration
  static async isUsingRemoteConfig(): Promise<boolean> {
    try {
      const config = await this.getConfig();
      return config.configSource === 'Admin Updated' || config.configSource?.includes('Remote');
    } catch {
      return false;
    }
  }

  // Admin utility: Get comprehensive admin info
  static async getAdminInfo(): Promise<any> {
    try {
      const config = await this.getConfig();
      return {
        currentUrl: config.googleAppsScriptUrl,
        source: config.configSource,
        lastUpdated: config.lastUpdated,
        updatedBy: config.updatedBy,
        version: config.version,
        isRemote: await this.isUsingRemoteConfig(),
        cacheStatus: {
          isCached: !!this.configCache,
          lastFetch: this.lastFetch ? new Date(this.lastFetch).toISOString() : 'Never',
          nextRefresh: this.configCache ? new Date(this.lastFetch + this.CACHE_DURATION).toISOString() : 'Next request'
        },
        initialUrl: this.INITIAL_URL
      };
    } catch (error) {
      return {
        error: error.message,
        currentUrl: this.INITIAL_URL,
        source: 'Error fetching config',
        isRemote: false
      };
    }
  }

  // Utility: Force immediate config refresh
  static async refreshConfig(): Promise<any> {
    this.clearCache();
    return await this.fetchRemoteConfig();
  }

  // Utility: Get URL without caching (for debugging)
  static async getCurrentUrlDirect(): Promise<string> {
    try {
      const response = await fetch(this.configCache?.googleAppsScriptUrl || this.INITIAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_config',
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const config = await response.json();
        return config.googleAppsScriptUrl;
      }
    } catch (error) {
      console.warn('Direct URL fetch failed:', error);
    }
    
    return this.configCache?.googleAppsScriptUrl || this.INITIAL_URL;
  }
}

export default DECAConfig;