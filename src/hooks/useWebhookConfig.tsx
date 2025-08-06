import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface WebhookConfig {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  testConnection: () => Promise<boolean>;
  isConnected: boolean;
}

const WebhookContext = createContext<WebhookConfig | undefined>(undefined);

export const WebhookProvider = ({ children }: { children: ReactNode }) => {
  const [webhookUrl, setWebhookUrlState] = useState(() => 
    localStorage.getItem('deca-google-apps-script-url') || ''
  );
  const [isConnected, setIsConnected] = useState(false);

  const setWebhookUrl = (url: string) => {
    setWebhookUrlState(url);
    localStorage.setItem('deca-google-apps-script-url', url);
  };

  const testConnection = async (): Promise<boolean> => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_connection',
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin
        }),
      });

      // Since we're using no-cors, we can't check the actual response
      // We'll assume success if no error is thrown
      setIsConnected(true);
      toast({
        title: "Success",
        description: "Google Apps Script connection established!",
      });
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
      toast({
        title: "Connection Failed",
        description: "Please check your Google Apps Script URL and deployment settings.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Test connection on mount if URL exists
  useEffect(() => {
    if (webhookUrl) {
      testConnection();
    }
  }, []);

  return (
    <WebhookContext.Provider value={{
      webhookUrl,
      setWebhookUrl,
      testConnection,
      isConnected
    }}>
      {children}
    </WebhookContext.Provider>
  );
};

export const useWebhookConfig = () => {
  const context = useContext(WebhookContext);
  if (context === undefined) {
    throw new Error('useWebhookConfig must be used within a WebhookProvider');
  }
  return context;
};