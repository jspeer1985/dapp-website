import { ProjectConfig } from './types';

export class CodeTemplates {
  // ==================== CORE FILES ====================  
  static getPackageJson(config: ProjectConfig): string {
    return JSON.stringify({
      name: config.project.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        'db:push': 'prisma db push',
        'db:seed': 'tsx db/seed.ts',
        'deploy:token': 'tsx scripts/deploy-token.ts'
      },
      dependencies: {
        'next': '^14.0.0',
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        '@solana/web3.js': '^1.87.0',
        '@solana/spl-token': '^0.3.9',
        '@solana/wallet-adapter-react': '^0.15.35',
        '@solana/wallet-adapter-react-ui': '^0.9.35',
        '@solana/wallet-adapter-wallets': '^0.19.26',
        '@prisma/client': '^5.0.0',
        '@metaplex-foundation/js': '^0.19.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        'typescript': '^5.0.0',
        'prisma': '^5.0.0',
        'tsx': '^4.0.0',
        'tailwindcss': '^3.3.0',
        'autoprefixer': '^10.4.16',
        'postcss': '^8.4.31'
      }
    }, null, 2);
  }

  static getRootLayout(config: ProjectConfig): string {
    return `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/WalletProvider';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${config.project.name}',
  description: 'Powered by ${config.token.symbol}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <Navigation />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}`;
  }

  static getHomePage(config: ProjectConfig): string {
    return `import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4" style={{ color: '${config.dapp.brandColor}' }}>
            ${config.project.name}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Powered by ${config.token.symbol} Token
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-lg font-semibold transition"
            >
              Launch App
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
          ${config.dapp.features.map(feature => `
          <div className="bg-gray-800 p-8 rounded-lg border-2 border-gray-700 hover:border-[${config.dapp.brandColor}] transition">
            <h2 className="text-2xl font-bold mb-2 capitalize">${feature.replace('-', ' ')}</h2>
            <p className="text-gray-400">Access ${feature} features</p>
          </div>`).join('\n          ')}
        </div>
      </div>
    </main>
  );
}`;
  }

  static getWalletProvider(): string {
    return `'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css');

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network })
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}`;
  }

  static getNavigation(config: ProjectConfig): string {
    return `'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    ${config.dapp.features.map(f => {
      const template = { staking: 'Staking', governance: 'Governance', lp: 'Liquidity', 'nft-mint': 'Mint NFT', dao: 'DAO', swap: 'Swap' }[f];
      const page = { staking: 'staking', governance: 'governance', lp: 'liquidity', 'nft-mint': 'mint', dao: 'dao', swap: 'swap' }[f];
      return `{ href: '/${page}', label: '${template}' }`;
    }).join(',\n    ')}
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={\`text-gray-300 hover:text-white transition \${
                pathname === link.href ? 'text-white font-semibold' : ''
              }\`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <WalletMultiButton />
      </div>
    </nav>
  );
}`;
  }

  // ==================== STAKING FEATURE ====================
  static getStakingPage(config: ProjectConfig): string {
    return `'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { StakingPool } from '@/components/StakingPool';
import { StakingStats } from '@/components/StakingStats';
import { RewardsCalculator } from '@/components/RewardsCalculator';

export default function StakingPage() {
  const { publicKey, connected } = useWallet();
  const [stakedAmount, setStakedAmount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-2">Stake ${config.token.symbol}</h1>
        <p className="text-gray-400 mb-8">Earn rewards by staking your tokens</p>
        
        {!connected ? (
          <div className="bg-gray-800 p-12 rounded-lg text-center border-2 border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300">Connect your wallet to start staking ${config.token.symbol} tokens</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <StakingStats />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <StakingPool 
                tokenSymbol="${config.token.symbol}"
                onStake={setStakedAmount}
              />
              <RewardsCalculator 
                stakedAmount={stakedAmount}
                tokenSymbol="${config.token.symbol}"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}`;
  }

  // Add more feature templates as needed...
  // This is a starting point - you can expand with all features
}
