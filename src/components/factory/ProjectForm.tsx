'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload } from 'lucide-react';

interface ProjectFormProps {
  onComplete: (generationId: string, paymentAmount: number) => void;
  selectedTier?: string | null;
}

export default function ProjectForm({ onComplete, selectedTier }: ProjectFormProps) {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerEmail: '',
    telegramHandle: '',

    // Project Basics
    projectName: '',
    projectDescription: '',
    projectType: 'both' as 'dapp' | 'token' | 'both',
    tier: 'professional' as 'starter' | 'professional' | 'enterprise',

    // Token Configuration (for token or both)
    tokenName: '',
    tokenSymbol: '',
    tokenDecimals: 9,
    tokenTotalSupply: '',
    tokenLogoUrl: '',

    // NFT Configuration (optional)
    isNFT: false,
    nftCollectionName: '',
    nftRoyaltyPercentage: 5,
    nftDescription: '',

    // dApp Configuration (for dapp or both)
    dappFeatures: [] as string[],
    primaryColor: '#6366f1',
    targetAudience: '',

    // Social & Metadata
    websiteUrl: '',
    twitterHandle: '',
    discordUrl: '',
    telegramUrl: '',

    // Advanced Options
    customRequirements: '',
  });

  const [featureInput, setFeatureInput] = useState('');

  // Set tier from URL parameter
  useEffect(() => {
    if (selectedTier) {
      // Map URL-friendly tier names to actual tier values
      const tierMapping: Record<string, 'starter' | 'professional' | 'enterprise'> = {
        // Original PricingTiers mappings
        'development-starter': 'starter',
        'professional-stack': 'professional',
        'enterprise-foundation': 'enterprise',
        // DynamicPricingTiers mappings
        'starter': 'starter',
        'builder': 'professional', // Map builder to professional
        'launchpad': 'professional', // Map launchpad to professional
        'agency': 'enterprise', // Map agency to enterprise
        'enterprise': 'enterprise'
      };
      
      const mappedTier = tierMapping[selectedTier];
      if (mappedTier) {
        setFormData(prev => ({
          ...prev,
          tier: mappedTier
        }));
      }
    }
  }, [selectedTier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    try {
      // Use explicit origin to avoid port mismatch issues
      const apiUrl = `${window.location.origin}/api/generations/create`;
      console.log('Making request to:', apiUrl);
      
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
            totalSupply: parseInt(formData.tokenTotalSupply) || 1000000,
            logoUrl: formData.tokenLogoUrl,
            isNFT: formData.isNFT,
            nftCollectionName: formData.nftCollectionName,
            royaltyPercentage: formData.nftRoyaltyPercentage,
          } : undefined,
          features: formData.dappFeatures,
          metadata: {
            primaryColor: formData.primaryColor,
            targetAudience: formData.targetAudience,
            websiteUrl: formData.websiteUrl,
            twitterHandle: formData.twitterHandle,
            discordUrl: formData.discordUrl,
            telegramUrl: formData.telegramUrl,
            customRequirements: formData.customRequirements,
          },
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        onComplete(data.generationId, data.paymentAmount);
      } else {
        console.error('API Error:', data);
        alert('Error creating generation: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert('Failed to create generation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        dappFeatures: [...formData.dappFeatures, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      dappFeatures: formData.dappFeatures.filter((_, i) => i !== index),
    });
  };

  const showTokenFields = formData.projectType === 'token' || formData.projectType === 'both';
  const showDappFields = formData.projectType === 'dapp' || formData.projectType === 'both';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your dApp/Token</CardTitle>
        <CardDescription>
          Provide detailed information for a perfect custom-built project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* CUSTOMER INFORMATION */}
          <div className="space-y-4 pb-6 border-b border-border">
            <h3 className="text-lg font-semibold">Your Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address *</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telegram Handle (Optional)</label>
              <Input
                type="text"
                placeholder="@yourusername"
                value={formData.telegramHandle}
                onChange={(e) => setFormData({ ...formData, telegramHandle: e.target.value })}
              />
            </div>
          </div>

          {/* PROJECT BASICS */}
          <div className="space-y-4 pb-6 border-b border-border">
            <h3 className="text-lg font-semibold">Project Basics</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Type *</label>
              <Select
                value={formData.projectType}
                onValueChange={(value: 'dapp' | 'token' | 'both') =>
                  setFormData({ ...formData, projectType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token">Token Only (SPL Token Creation)</SelectItem>
                  <SelectItem value="dapp">dApp Only (Web Application)</SelectItem>
                  <SelectItem value="both">Complete Package (Token + dApp)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name *</label>
              <Input
                placeholder="My Awesome Project"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                required
                minLength={3}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Detailed Project Description *</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Describe your project in detail: What problem does it solve? Who is your target audience? What makes it unique?"
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                required
                minLength={50}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                Be specific! The more details you provide, the better your final product.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Input
                placeholder="e.g., DeFi traders, NFT collectors, GameFi enthusiasts"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              />
            </div>
          </div>

          {/* TOKEN CONFIGURATION */}
          {showTokenFields && (
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold">Token Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token Name *</label>
                  <Input
                    placeholder="My Token"
                    value={formData.tokenName}
                    onChange={(e) => setFormData({ ...formData, tokenName: e.target.value })}
                    required={showTokenFields}
                    maxLength={32}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Token Symbol *</label>
                  <Input
                    placeholder="MTK"
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value.toUpperCase() })}
                    required={showTokenFields}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Decimals *</label>
                  <Select
                    value={formData.tokenDecimals.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tokenDecimals: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 2, 6, 9].map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d} decimals {d === 9 && '(Recommended)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Supply *</label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={formData.tokenTotalSupply}
                    onChange={(e) => setFormData({ ...formData, tokenTotalSupply: e.target.value })}
                    required={showTokenFields}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Token Logo URL (Optional)</label>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.tokenLogoUrl}
                  onChange={(e) => setFormData({ ...formData, tokenLogoUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  PNG or SVG recommended. Will be used in wallets and explorers.
                </p>
              </div>

              {/* NFT Toggle */}
              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  id="isNFT"
                  checked={formData.isNFT}
                  onChange={(e) => setFormData({ ...formData, isNFT: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isNFT" className="text-sm font-medium cursor-pointer">
                  This is an NFT Collection
                </label>
              </div>

              {/* NFT-Specific Fields */}
              {formData.isNFT && (
                <div className="space-y-4 pl-4 border-l-2 border-primary">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">NFT Collection Name *</label>
                    <Input
                      placeholder="My NFT Collection"
                      value={formData.nftCollectionName}
                      onChange={(e) => setFormData({ ...formData, nftCollectionName: e.target.value })}
                      required={formData.isNFT}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">NFT Collection Description</label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Describe your NFT collection..."
                      value={formData.nftDescription}
                      onChange={(e) => setFormData({ ...formData, nftDescription: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Royalty Percentage *</label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={formData.nftRoyaltyPercentage}
                      onChange={(e) => setFormData({ ...formData, nftRoyaltyPercentage: parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentage of secondary sales you'll receive (typically 5-10%)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DAPP CONFIGURATION */}
          {showDappFields && (
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold">dApp Configuration</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Brand Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Key Features</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Token staking, NFT marketplace, Governance voting"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.dappFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.dappFeatures.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SOCIAL & METADATA */}
          <div className="space-y-4 pb-6 border-b border-border">
            <h3 className="text-lg font-semibold">Social & Links (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  type="url"
                  placeholder="https://yourproject.com"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Twitter Handle</label>
                <Input
                  placeholder="@yourproject"
                  value={formData.twitterHandle}
                  onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Discord URL</label>
                <Input
                  type="url"
                  placeholder="https://discord.gg/yourserver"
                  value={formData.discordUrl}
                  onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Telegram URL</label>
                <Input
                  type="url"
                  placeholder="https://t.me/yourgroup"
                  value={formData.telegramUrl}
                  onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* CUSTOM REQUIREMENTS */}
          <div className="space-y-4 pb-6 border-b border-border">
            <h3 className="text-lg font-semibold">Custom Requirements (Optional)</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Instructions</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Any special requirements, integrations, or features you'd like included..."
                value={formData.customRequirements}
                onChange={(e) => setFormData({ ...formData, customRequirements: e.target.value })}
                maxLength={1000}
              />
            </div>
          </div>

          {/* TIER SELECTION */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Your Package</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tier *</label>
              <Select
                value={formData.tier}
                onValueChange={(value: 'starter' | 'professional' | 'enterprise') =>
                  setFormData({ ...formData, tier: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">
                    Starter - ${Number(process.env.NEXT_PUBLIC_STARTER_PRICE_USD || '99').toLocaleString()} ({process.env.NEXT_PUBLIC_STARTER_PRICE_SOL || '0.4'} SOL)
                  </SelectItem>
                  <SelectItem value="professional">
                    Professional - ${Number(process.env.NEXT_PUBLIC_PROFESSIONAL_PRICE_USD || '299').toLocaleString()} ({process.env.NEXT_PUBLIC_PROFESSIONAL_PRICE_SOL || '1.2'} SOL) ⭐
                  </SelectItem>
                  <SelectItem value="enterprise">
                    Enterprise - ${Number(process.env.NEXT_PUBLIC_ENTERPRISE_PRICE_USD || '1000').toLocaleString()} ({process.env.NEXT_PUBLIC_ENTERPRISE_PRICE_SOL || '4.0'} SOL)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium mb-2">Generation Cost:</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-primary">
                  {formData.tier === 'starter' && (process.env.NEXT_PUBLIC_STARTER_PRICE_SOL || '0.4')}
                  {formData.tier === 'professional' && (process.env.NEXT_PUBLIC_PROFESSIONAL_PRICE_SOL || '1.2')}
                  {formData.tier === 'enterprise' && (process.env.NEXT_PUBLIC_ENTERPRISE_PRICE_SOL || '4.0')} SOL
                </p>
                <p className="text-lg text-muted-foreground">
                  ($
                  {formData.tier === 'starter' && Number(process.env.NEXT_PUBLIC_STARTER_PRICE_USD || '99').toLocaleString()}
                  {formData.tier === 'professional' && Number(process.env.NEXT_PUBLIC_PROFESSIONAL_PRICE_USD || '299').toLocaleString()}
                  {formData.tier === 'enterprise' && Number(process.env.NEXT_PUBLIC_ENTERPRISE_PRICE_USD || '1000').toLocaleString()}
                  )
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {formData.tier === 'starter' && 'Basic features - Perfect for testing'}
                {formData.tier === 'professional' && 'Advanced features - Best for most projects'}
                {formData.tier === 'enterprise' && 'Premium features - Full customization'}
              </p>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading || !address}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Your Project...
              </>
            ) : !address ? (
              'Connect Wallet to Continue'
            ) : (
              'Continue to Payment →'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
