// Centralized configuration for Google Apps Script integration
class DECAConfig {
  private static readonly CONFIG_KEY = 'deca-master-config';
  private static readonly DEFAULT_CONFIG = {
    googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbzCKb9TatHS2HrE_-VoiaK7GOYO5jFzhR9pLqXDSQFBQvln2Acu8Azsdd9kh2WFNeCqyw/exec',
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  };

  // Get the current Google Apps Script URL
  static getGoogleAppsScriptUrl(): string {
    try {
      const configStr = localStorage.getItem(this.CONFIG_KEY);
      if (configStr) {
        const config = JSON.parse(configStr);
        return config.googleAppsScriptUrl || this.DEFAULT_CONFIG.googleAppsScriptUrl;
      }
    } catch (error) {
      console.warn('Failed to parse DECA config, using default');
    }
    return this.DEFAULT_CONFIG.googleAppsScriptUrl;
  }

  // Update the Google Apps Script URL (admin only)
  static updateGoogleAppsScriptUrl(newUrl: string): void {
    try {
      const config = {
        googleAppsScriptUrl: newUrl,
        lastUpdated: new Date().toISOString(),
        version: this.DEFAULT_CONFIG.version
      };
      
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
      
      // Dispatch a custom event to notify all components
      window.dispatchEvent(new CustomEvent('deca-config-updated', {
        detail: { googleAppsScriptUrl: newUrl }
      }));
      
      console.log('DECA config updated:', config);
    } catch (error) {
      console.error('Failed to update DECA config:', error);
    }
  }

  // Get the full config
  static getConfig() {
    try {
      const configStr = localStorage.getItem(this.CONFIG_KEY);
      if (configStr) {
        return { ...this.DEFAULT_CONFIG, ...JSON.parse(configStr) };
      }
    } catch (error) {
      console.warn('Failed to parse DECA config, using default');
    }
    return this.DEFAULT_CONFIG;
  }

  // Test the current URL
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    const url = this.getGoogleAppsScriptUrl();
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'test_connection',
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin
        }),
      });

      return {
        success: true,
        message: 'Connection test sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error}`
      };
    }
  }
}

export default DECAConfig;