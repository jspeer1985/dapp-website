'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Info } from 'lucide-react';
import type { BaseGenerationFormProps } from '@/types/generation-forms';

export default function StarterGenerationForm({ onComplete, selectedTier }: BaseGenerationFormProps) {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerEmail: '',
    telegramHandle: '',

    // Project Basics - Limited options for starter
    projectName: '',
    projectDescription: '',
    projectType: 'token' as 'dapp' | 'token',
    tier: 'starter' as const,

    // Token Configuration - Basic only
    tokenName: '',
    tokenSymbol: '',
    tokenDecimals: 9,
    tokenTotalSupply: '1000000',
    tokenLogoUrl: '',

    // NFT - Not available in starter
    isNFT: false,
    nftCollectionName: '',
    nftRoyaltyPercentage: 5,
    nftDescription: '',

    // dApp Configuration - Limited features
    dappFeatures: [] as string[],
    primaryColor: '#6366f1',
    targetAudience: '',

    // Social & Metadata - Basic only
    websiteUrl: '',
    twitterHandle: '',
    discordUrl: '',
    telegramUrl: '',

    // Advanced Options - Limited
    customRequirements: '',
  });

  const [featureInput, setFeatureInput] = useState('');

  // Set tier from URL parameter
  useEffect(() => {
    if (selectedTier && selectedTier === 'starter') {
      setFormData(prev => ({
        ...prev,
        tier: 'starter'
      }));
    }
  }, [selectedTier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    try {
      const apiUrl = `${window.location.origin}/api/generations/create`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          telegramHandle: formData.telegramHandle,
          projectName: formData.projectName,
          projectDescription: formData.projectDescription,
          projectType: formData.projectType,
          tier: formData.tier,
          tokenConfig: (formData.projectType === 'token') ? {
            name: formData.tokenName,
            symbol: formData.tokenSymbol,
            decimals: formData.tokenDecimals,
            totalSupply: parseInt(formData.tokenTotalSupply) || 1000000,
            logoUrl: formData.tokenLogoUrl,
            isNFT: false, // NFT not available in starter
          } : undefined,
          features: formData.dappFeatures.slice(0, 3), // Limit to 3 features for starter
          metadata: {
            primaryColor: formData.primaryColor,
            targetAudience: formData.targetAudience,
            websiteUrl: formData.websiteUrl,
            twitterHandle: formData.twitterHandle,
            discordUrl: formData.discordUrl,
            telegramUrl: formData.telegramUrl,
            customRequirements: formData.customRequirements,
          },
          // Starter tier specific limitations
          limitations: {
            maxFeatures: 3,
            noNFT: true,
            noWhiteLabel: true,
            basicDeployment: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create generation');
      }

      const result = await response.json();
      onComplete(result.generationId, 39); // Starter tier price
    } catch (error) {
      console.error('Error creating generation:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim() && formData.dappFeatures.length < 3) {
      setFormData(prev => ({
        ...prev,
        dappFeatures: [...prev.dappFeatures, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dappFeatures: prev.dappFeatures.filter((_, i) => i !== index)
    }));
  };

  if (!address) {
    return (
      <Card>
        <CardHeader className="text-center">
          <Zap className="mx-auto mb-4 h-12 w-12 text-primary" />
          <CardTitle>Connect Wallet to Get Started</CardTitle>
          <CardDescription>
            Connect your Solana wallet to start building with the Starter tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            The Starter tier includes basic token generation and simple dApp scaffolding.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-500" />
          <CardTitle>Starter Tier - Basic Generation</CardTitle>
          <Badge variant="secondary">$39</Badge>
        </div>
        <CardDescription>
          Perfect for solo builders and hackathon projects. Limited to 3 features and basic templates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Project Basics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Details</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Project Name *</label>
              <Input
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="My Awesome Project"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Description *</label>
              <Textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                placeholder="Describe your project in a few sentences..."
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Type *</label>
              <Select value={formData.projectType} onValueChange={(value: 'dapp' | 'token') => setFormData(prev => ({ ...prev, projectType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token">Token Only</SelectItem>
                  <SelectItem value="dapp">Basic dApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Token Configuration (if token selected) */}
          {formData.projectType === 'token' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Token Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Token Name *</label>
                  <Input
                    value={formData.tokenName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
                    placeholder="My Token"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Token Symbol *</label>
                  <Input
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                    placeholder="MTK"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Total Supply *</label>
                  <Input
                    type="number"
                    value={formData.tokenTotalSupply}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenTotalSupply: e.target.value }))}
                    placeholder="1000000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Decimals</label>
                  <Input
                    type="number"
                    value={formData.tokenDecimals}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenDecimals: parseInt(e.target.value) || 9 }))}
                    min={0}
                    max={18}
                  />
                </div>
              </div>
            </div>
          )}

          {/* dApp Features (if dapp selected) */}
          {formData.projectType === 'dapp' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">dApp Features (Max 3)</h3>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add a feature (e.g., User Dashboard, Wallet Connect)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  disabled={formData.dappFeatures.length >= 3}
                />
                <Button type="button" onClick={addFeature} disabled={formData.dappFeatures.length >= 3}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.dappFeatures.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(index)}>
                    {feature} ×
                  </Badge>
                ))}
              </div>
              {formData.dappFeatures.length >= 3 && (
                <p className="text-sm text-muted-foreground">
                  <Info className="inline h-4 w-4 mr-1" />
                  Starter tier limited to 3 features. Upgrade to unlock more.
                </p>
              )}
            </div>
          )}

          {/* Basic Styling */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Styling</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Primary Color</label>
              <Input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="h-10 w-20"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Generation...
              </>
            ) : (
              `Generate Starter Project - $39`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
