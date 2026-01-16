'use client';

import { FC, ReactNode, useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';

require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [network, setNetwork] = useState<WalletAdapterNetwork>(WalletAdapterNetwork.Devnet);
  const [endpoint, setEndpoint] = useState<string>('https://api.devnet.solana.com');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Use more reliable fallback values
      const net = WalletAdapterNetwork.Devnet; // Default to devnet for stability
      const ep = 'https://api.devnet.solana.com'; // Use reliable devnet endpoint
      
      setNetwork(net);
      setEndpoint(ep);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize wallet provider:', err);
      setError('Failed to initialize wallet connection');
      // Fallback to devnet
      setNetwork(WalletAdapterNetwork.Devnet);
      setEndpoint('https://api.devnet.solana.com');
    }
  }, []);

  const wallets = useMemo(
    () => [
      // Phantom is now a standard wallet and will be automatically included
      // No need to explicitly import PhantomWalletAdapter
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="text-destructive text-lg font-semibold">Wallet Connection Error</div>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="button-primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="loading-skeleton w-8 h-8 rounded-full mx-auto" />
          <p className="text-muted-foreground">Initializing wallet connection...</p>
        </div>
      </div>
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false} // Disable autoConnect to prevent errors
        onError={(error) => {
          console.error('Wallet provider error:', error);
          setError(error.message);
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
