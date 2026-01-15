'use client';

import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <img 
            src="/optik-logo.png" 
            alt="OPTIK dApp Factory" 
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold text-gradient">OPTIK dApp Factory</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/generate"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Advanced
          </Link>
          <Link
            href="/factory"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Quick Start
          </Link>
          <Link
            href="/terms"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Terms
          </Link>
          <Link
            href="/launch"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Launch
          </Link>
          <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
        </div>
      </div>
    </nav>
  );
}
