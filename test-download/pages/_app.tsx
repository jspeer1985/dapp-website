import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useMemo } from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

require('@solana/wallet-adapter-react-ui/styles.css');

function MyApp({ Component, pageProps }: AppProps) {
  const network = useMemo(() => clusterApiUrl('devnet'), []);
  const wallet = useMemo(() => new PhantomWalletAdapter(), []);

  return (
    <WalletProvider wallets={[wallet]} autoConnect>
      <WalletModalProvider>
        <Component {...pageProps} />
      </WalletModalProvider>
    </WalletProvider>
  );
}

export default MyApp;
