'use client';

import { ReactNode, useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletErrorBoundaryProps {
  children: ReactNode;
}

export default function WalletErrorBoundary({ children }: WalletErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('WalletConnectionError') || 
          event.message?.includes('StandardWalletAdapter')) {
        setHasError(true);
        setError(event.message);
        console.error('Wallet error caught by boundary:', event);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('WalletConnectionError') || 
          event.reason?.message?.includes('StandardWalletAdapter')) {
        setHasError(true);
        setError(event.reason.message);
        console.error('Wallet promise rejection caught:', event);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleRetry = () => {
    setHasError(false);
    setError(null);
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="max-w-md mx-auto p-6 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Wallet Connection Issue
            </h3>
            <p className="text-sm text-muted-foreground">
              There was an issue connecting to your wallet. This is usually caused by:
            </p>
            <ul className="text-xs text-muted-foreground text-left space-y-1 list-disc list-inside">
              <li>Wallet extension not installed or disabled</li>
              <li>Network connectivity issues</li>
              <li>Wallet being locked or in use by another tab</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <div className="text-xs text-muted-foreground">
              <p className="mb-2">Quick fixes:</p>
              <div className="space-y-1">
                <p>• Install/enable Phantom or Solflare wallet</p>
                <p>• Check your internet connection</p>
                <p>• Refresh the page and try again</p>
              </div>
            </div>
          </div>

          {error && (
            <details className="text-xs text-muted-foreground text-left">
              <summary className="cursor-pointer hover:text-foreground">Technical Details</summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {error}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
