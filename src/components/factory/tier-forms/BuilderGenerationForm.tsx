'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Hammer, Info, Star } from 'lucide-react';
import type { BaseGenerationFormProps } from '@/types/generation-forms';

export default function BuilderGenerationForm({ onComplete, selectedTier }: BaseGenerationFormProps) {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerEmail: '',
    telegramHandle: '',

    // Project Basics - More options for builder
    projectName: '',
    projectDescription: '',
    projectType: 'both' as 'dapp' | 'token' | 'both',
    tier: 'professional' as const,

    // Token Configuration - Enhanced options
    tokenName: '',
    tokenSymbol: '',
    tokenDecimals: 9,
    tokenTotalSupply: '10000000',
    tokenLogoUrl: '',

    // NFT Configuration - Available in builder
    isNFT: false,
    nftCollectionName: '',
    nftRoyaltyPercentage: 5,
    nftDescription: '',

    // dApp Configuration - More features
    dappFeatures: [] as string[],
    primaryColor: '#6366f1',
    targetAudience: '',

    // Social & Metadata - Enhanced
    websiteUrl: '',
    twitterHandle: '',
    discordUrl: '',
    telegramUrl: '',

    // Advanced Options - More capabilities
    customRequirements: '',

    // Builder tier specific
    apiAccessLevel: 'basic' as 'basic' | 'advanced',
    deploymentTargets: [] as string[],
    integrationLevel: 'basic' as 'basic' | 'advanced',
  });

  const [featureInput, setFeatureInput] = useState('');

  // Set tier from URL parameter
  useEffect(() => {
    if (selectedTier && (selectedTier === 'builder' || selectedTier === 'professional')) {
      setFormData(prev => ({
        ...prev,
        tier: 'professional'
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
          tokenConfig: (formData.projectType === 'token' || formData.projectType === 'both') ? {
            name: formData.tokenName,
            symbol: formData.tokenSymbol,
            decimals: formData.tokenDecimals,
            totalSupply: parseInt(formData.tokenTotalSupply) || 10000000,
            logoUrl: formData.tokenLogoUrl,
            isNFT: formData.isNFT,
            nftCollectionName: formData.nftCollectionName,
            royaltyPercentage: formData.nftRoyaltyPercentage,
          } : undefined,
          features: formData.dappFeatures.slice(0, 8), // Limit to 8 features for builder
          metadata: {
            primaryColor: formData.primaryColor,
            targetAudience: formData.targetAudience,
            websiteUrl: formData.websiteUrl,
            twitterHandle: formData.twitterHandle,
            discordUrl: formData.discordUrl,
            telegramUrl: formData.telegramUrl,
            customRequirements: formData.customRequirements,
          },
          // Builder tier specific capabilities
          capabilities: {
            maxFeatures: 8,
            nftSupport: true,
            basicWhiteLabel: false,
            apiAccess: formData.apiAccessLevel,
            deploymentTargets: formData.deploymentTargets,
            integrationLevel: formData.integrationLevel,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create generation');
      }

      const result = await response.json();
      onComplete(result.generationId, 79); // Builder tier price
    } catch (error) {
      console.error('Error creating generation:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim() && formData.dappFeatures.length < 8) {
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

  const toggleDeploymentTarget = (target: string) => {
    setFormData(prev => ({
      ...prev,
      deploymentTargets: prev.deploymentTargets.includes(target)
        ? prev.deploymentTargets.filter(t => t !== target)
        : [...prev.deploymentTargets, target]
    }));
  };

  if (!address) {
    return (
      <Card>
        <CardHeader className="text-center">
          <Hammer className="mx-auto mb-4 h-12 w-12 text-primary" />
          <CardTitle>Connect Wallet to Get Started</CardTitle>
          <CardDescription>
            Connect your Solana wallet to start building with the Builder tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            The Builder tier includes advanced features, NFT support, and enhanced integrations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Hammer className="h-5 w-5 text-blue-500" />
          <CardTitle>Builder Tier - Advanced Generation</CardTitle>
          <Badge variant="secondary">$79</Badge>
        </div>
        <CardDescription>
          For serious developers. Includes NFT support, advanced integrations, and up to 8 features.
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
            <div>
              <label className="block text-sm font-medium mb-1">Telegram Handle</label>
              <Input
                value={formData.telegramHandle}
                onChange={(e) => setFormData(prev => ({ ...prev, telegramHandle: e.target.value }))}
                placeholder="@yourhandle"
              />
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
                placeholder="My Advanced Project"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Description *</label>
              <Textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                placeholder="Describe your project in detail..."
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Type *</label>
              <Select value={formData.projectType} onValueChange={(value: 'dapp' | 'token' | 'both') => setFormData(prev => ({ ...prev, projectType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token">Token Only</SelectItem>
                  <SelectItem value="dapp">Advanced dApp</SelectItem>
                  <SelectItem value="both">Token + dApp Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Token Configuration */}
          {(formData.projectType === 'token' || formData.projectType === 'both') && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Token Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Token Name *</label>
                  <Input
                    value={formData.tokenName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
                    placeholder="My Advanced Token"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Token Symbol *</label>
                  <Input
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                    placeholder="MAT"
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
                    placeholder="10000000"
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
              
              {/* NFT Configuration - Builder tier feature */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNFT"
                    checked={formData.isNFT}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNFT: checked as boolean }))}
                  />
                  <label htmlFor="isNFT" className="text-sm font-medium">
                    Enable NFT Functionality
                  </label>
                  <Badge variant="outline"><Star className="h-3 w-3 mr-1" />Builder</Badge>
                </div>
                
                {formData.isNFT && (
                  <div className="space-y-3 ml-6 p-3 border rounded-lg">
                    <div>
                      <label className="block text-sm font-medium mb-1">NFT Collection Name</label>
                      <Input
                        value={formData.nftCollectionName}
                        onChange={(e) => setFormData(prev => ({ ...prev, nftCollectionName: e.target.value }))}
                        placeholder="My NFT Collection"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Royalty Percentage (%)</label>
                      <Input
                        type="number"
                        value={formData.nftRoyaltyPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, nftRoyaltyPercentage: parseInt(e.target.value) || 5 }))}
                        min={0}
                        max={10}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">NFT Description</label>
                      <Textarea
                        value={formData.nftDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, nftDescription: e.target.value }))}
                        placeholder="Describe your NFT collection..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* dApp Features */}
          {formData.projectType === 'dapp' || formData.projectType === 'both' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">dApp Features (Max 8)</h3>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add a feature (e.g., Advanced Dashboard, Staking, Governance)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  disabled={formData.dappFeatures.length >= 8}
                />
                <Button type="button" onClick={addFeature} disabled={formData.dappFeatures.length >= 8}>
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
              {formData.dappFeatures.length >= 8 && (
                <p className="text-sm text-muted-foreground">
                  <Info className="inline h-4 w-4 mr-1" />
                  Builder tier limited to 8 features. Upgrade to Launchpad for unlimited features.
                </p>
              )}
            </div>
          ) : null}

          {/* Advanced Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Configuration</h3>
            
            {/* API Access Level */}
            <div>
              <label className="block text-sm font-medium mb-1">API Access Level</label>
              <Select value={formData.apiAccessLevel} onValueChange={(value: 'basic' | 'advanced') => setFormData(prev => ({ ...prev, apiAccessLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic API Access</SelectItem>
                  <SelectItem value="advanced">Advanced API Access <Badge variant="outline"><Star className="h-3 w-3 mr-1" />Builder</Badge></SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Integration Level */}
            <div>
              <label className="block text-sm font-medium mb-1">Integration Level</label>
              <Select value={formData.integrationLevel} onValueChange={(value: 'basic' | 'advanced') => setFormData(prev => ({ ...prev, integrationLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Integrations</SelectItem>
                  <SelectItem value="advanced">Advanced Integrations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deployment Targets */}
            <div>
              <label className="block text-sm font-medium mb-2">Deployment Targets</label>
              <div className="grid grid-cols-2 gap-3">
                {['Mainnet', 'Devnet', 'Testnet', 'Local'].map((target) => (
                  <div key={target} className="flex items-center space-x-2">
                    <Checkbox
                      id={`deploy-${target}`}
                      checked={formData.deploymentTargets.includes(target)}
                      onCheckedChange={() => toggleDeploymentTarget(target)}
                    />
                    <label htmlFor={`deploy-${target}`} className="text-sm">
                      {target}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Styling and Branding */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Styling & Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary Color</label>
                <Input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="h-10 w-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Audience</label>
                <Input
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="e.g., DeFi users, Gamers, Artists"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Website URL</label>
                <Input
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="https://myproject.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Twitter Handle</label>
                <Input
                  value={formData.twitterHandle}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
                  placeholder="@myproject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discord Server</label>
                <Input
                  value={formData.discordUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, discordUrl: e.target.value }))}
                  placeholder="https://discord.gg/myproject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telegram</label>
                <Input
                  value={formData.telegramUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, telegramUrl: e.target.value }))}
                  placeholder="https://t.me/myproject"
                />
              </div>
            </div>
          </div>

          {/* Custom Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Custom Requirements</h3>
            <Textarea
              value={formData.customRequirements}
              onChange={(e) => setFormData(prev => ({ ...prev, customRequirements: e.target.value }))}
              placeholder="Any specific requirements, custom features, or technical specifications..."
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Generation...
              </>
            ) : (
              `Generate Builder Project - $79`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
