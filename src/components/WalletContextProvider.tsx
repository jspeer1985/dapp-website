'use client';

import { FC, ReactNode, useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';

require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [network, setNetwork] = useState<WalletAdapterNetwork>(WalletAdapterNetwork.Devnet);
  const [endpoint, setEndpoint] = useState<string>('');

  useEffect(() => {
    const net = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) ||
                WalletAdapterNetwork.Devnet;
    const ep = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
               `https://api.${net}.solana.com`;
    
    setNetwork(net);
    setEndpoint(ep);
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network]
  );

  if (!endpoint) {
    return <div>Loading...</div>;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
