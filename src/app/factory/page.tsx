'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import ProjectFactory from '@/components/ProjectFactory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Wallet, Loader2 } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

function FactoryPageContent() {
  const { connected } = useWallet();
  const searchParams = useSearchParams();
  const [isProcessingTemplate, setIsProcessingTemplate] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    const cloneParam = searchParams.get('clone');
    const generationId = searchParams.get('generationId');
    const tierParam = searchParams.get('tier');
    
    if (tierParam) {
      setSelectedTier(tierParam);
    }
    
    if (cloneParam) {
      setTemplateId(cloneParam);
      // Auto-clone the template
      handleTemplateClone(cloneParam);
    } else if (generationId) {
      // Load existing generation
      // This would load the generation data and populate the form
      console.log('Loading generation:', generationId);
    }
  }, [searchParams]);

  const handleTemplateClone = async (templateId: string) => {
    setIsProcessingTemplate(true);
    
    try {
      // Find template data (in real app, this would come from API)
      const templates = {
        'uniswap-v3-clone': {
          title: 'DeFi Swap Protocol',
          projectType: 'both',
          tier: 'professional',
          features: ['DeFi Swap', 'Liquidity Pools', 'Yield Farming', 'Analytics Dashboard'],
          tokenConfig: {
            name: 'Liquidity Token',
            symbol: 'LIQ',
            decimals: 9,
            totalSupply: '1000000000'
          }
        },
        'nft-marketplace-pro': {
          title: 'NFT Marketplace Pro',
          projectType: 'both',
          tier: 'professional',
          features: ['NFT Marketplace', 'Auctions', 'Royalties', 'Launchpad'],
          tokenConfig: {
            name: 'NFT Platform Token',
            symbol: 'NFT',
            decimals: 9,
            totalSupply: '500000000'
          }
        },
        'dao-governance': {
          title: 'DAO Governance Suite',
          projectType: 'both',
          tier: 'professional',
          features: ['DAO Governance', 'Quadratic Voting', 'Treasury Management', 'Proposal System'],
          tokenConfig: {
            name: 'Governance Token',
            symbol: 'GOV',
            decimals: 9,
            totalSupply: '100000000'
          }
        },
        'p2e-staking': {
          title: 'GameFi Staking Hub',
          projectType: 'both',
          tier: 'professional',
          features: ['GameFi Staking', 'Level System', 'Rewards Multiplier', 'Leaderboard'],
          tokenConfig: {
            name: 'Game Token',
            symbol: 'GAME',
            decimals: 9,
            totalSupply: '2000000000'
          }
        }
      };
      
      const template = templates[templateId as keyof typeof templates];
      if (!template) {
        throw new Error('Template not found');
      }

      // Create generation from template
      const response = await fetch('/api/generations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: 'template-user', // Will be updated with actual wallet
          customerName: 'Template User',
          customerEmail: 'user@template.com',
          projectName: `${template.title} - Clone`,
          projectDescription: `Cloned from ${template.title} template`,
          projectType: template.projectType,
          tier: template.tier,
          features: template.features,
          tokenConfig: template.tokenConfig ? {
            name: template.tokenConfig.name,
            symbol: template.tokenConfig.symbol,
            decimals: template.tokenConfig.decimals,
            totalSupply: parseInt(template.tokenConfig.totalSupply),
            logoUrl: '',
            isNFT: templateId === 'nft-marketplace-pro',
            nftCollectionName: templateId === 'nft-marketplace-pro' ? template.title : undefined,
            royaltyPercentage: 5,
          } : undefined,
          metadata: {
            primaryColor: '#6366f1',
            targetAudience: templateId.split('-')[0],
            customRequirements: `Cloned from ${template.title} template`,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create generation');
      }

      const result = await response.json();
      
      // Update URL to show generation ID instead of template ID
      window.history.replaceState({}, '', `/factory?generationId=${result.generationId}`);
      setTemplateId(null);
      
    } catch (error) {
      console.error('Error cloning template:', error);
      alert('Failed to clone template. Please try again.');
    } finally {
      setIsProcessingTemplate(false);
    }
  };

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
                Click to "Connect Wallet" button in the navigation bar to get started.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isProcessingTemplate) {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 text-primary animate-spin" />
              <CardTitle>Cloning Template</CardTitle>
              <CardDescription>
                Setting up your project from template...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                This will only take a moment.
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

        <ProjectFactory selectedTier={selectedTier} />
      </div>
    </div>
  );
}

export default function FactoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
      <AuthGuard requireAuth={true}>
        <FactoryPageContent />
      </AuthGuard>
    </Suspense>
  );
}
