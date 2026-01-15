'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import ProjectFactory from '@/components/ProjectFactory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Wallet } from 'lucide-react';

export default function FactoryPage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <Wallet className="mx-auto mb-4 h-12 w-12 text-primary" />
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                Connect your Solana wallet to start generating dApps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Click the "Connect Wallet" button in the navigation bar to get started.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <img 
            src="/optik-logo.png" 
            alt="OPTIK dApp Factory" 
            className="mx-auto mb-4 h-12 w-auto"
          />
          <h1 className="mb-3 text-4xl font-bold">Create Your dApp</h1>
          <p className="text-lg text-muted-foreground">
            Describe your project and let AI generate production-ready code
          </p>
        </div>

        <ProjectFactory />
      </div>
    </div>
  );
}
