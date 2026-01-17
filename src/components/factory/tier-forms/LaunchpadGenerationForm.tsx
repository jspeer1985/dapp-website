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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Rocket, Info, Crown, Sparkles } from 'lucide-react';
import type { BaseGenerationFormProps } from '@/types/generation-forms';

export default function LaunchpadGenerationForm({ onComplete, selectedTier }: BaseGenerationFormProps) {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerEmail: '',
    telegramHandle: '',

    // Project Basics - Full options for launchpad
    projectName: '',
    projectDescription: '',
    projectType: 'both' as 'dapp' | 'token' | 'both',
    tier: 'professional' as const,

    // Token Configuration - Premium options
    tokenName: '',
    tokenSymbol: '',
    tokenDecimals: 9,
    tokenTotalSupply: '100000000',
    tokenLogoUrl: '',

    // NFT Configuration - Full support
    isNFT: false,
    nftCollectionName: '',
    nftRoyaltyPercentage: 5,
    nftDescription: '',

    // dApp Configuration - Unlimited features
    dappFeatures: [] as string[],
    primaryColor: '#6366f1',
    targetAudience: '',

    // Social & Metadata - Full
    websiteUrl: '',
    twitterHandle: '',
    discordUrl: '',
    telegramUrl: '',

    // Advanced Options - Premium capabilities
    customRequirements: '',

    // Launchpad tier specific
    apiAccessLevel: 'advanced' as 'basic' | 'advanced' | 'enterprise',
    deploymentTargets: [] as string[],
    integrationLevel: 'advanced' as 'basic' | 'advanced' | 'full',
    complianceLevel: 'standard' as 'basic' | 'standard' | 'enterprise',
    supportLevel: 'priority' as 'community' | 'priority' | 'dedicated',

    // White-label basic options
    whiteLabelConfig: {
      customDomain: '',
      branding: {
        logo: '',
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6'
        },
        customCSS: ''
      },
      features: {
        customAuth: false,
        customUI: false,
        customBackend: false
      }
    }
  });

  const [featureInput, setFeatureInput] = useState('');

  // Set tier from URL parameter
  useEffect(() => {
    if (selectedTier && (selectedTier === 'launchpad' || selectedTier === 'professional')) {
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
            totalSupply: parseInt(formData.tokenTotalSupply) || 100000000,
            logoUrl: formData.tokenLogoUrl,
            isNFT: formData.isNFT,
            nftCollectionName: formData.nftCollectionName,
            royaltyPercentage: formData.nftRoyaltyPercentage,
          } : undefined,
          features: formData.dappFeatures, // Unlimited features for launchpad
          metadata: {
            primaryColor: formData.primaryColor,
            targetAudience: formData.targetAudience,
            websiteUrl: formData.websiteUrl,
            twitterHandle: formData.twitterHandle,
            discordUrl: formData.discordUrl,
            telegramUrl: formData.telegramUrl,
            customRequirements: formData.customRequirements,
          },
          // Launchpad tier specific capabilities
          capabilities: {
            maxFeatures: 999, // Unlimited
            nftSupport: true,
            basicWhiteLabel: true,
            apiAccess: formData.apiAccessLevel,
            deploymentTargets: formData.deploymentTargets,
            integrationLevel: formData.integrationLevel,
            complianceLevel: formData.complianceLevel,
            supportLevel: formData.supportLevel,
            whiteLabelConfig: formData.whiteLabelConfig
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create generation');
      }

      const result = await response.json();
      onComplete(result.generationId, 149); // Launchpad tier price
    } catch (error) {
      console.error('Error creating generation:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
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
          <Rocket className="mx-auto mb-4 h-12 w-12 text-primary" />
          <CardTitle>Connect Wallet to Get Started</CardTitle>
          <CardDescription>
            Connect your Solana wallet to start building with the Launchpad tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            The Launchpad tier includes unlimited features, basic white-label options, and priority support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-purple-500" />
          <CardTitle>Launchpad Tier - Premium Generation</CardTitle>
          <Badge variant="secondary">$149</Badge>
        </div>
        <CardDescription>
          For projects ready to launch. Unlimited features, basic white-label, and priority support.
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
              <label className="block text-sm font-medium mb-1">Telegram Handle *</label>
              <Input
                value={formData.telegramHandle}
                onChange={(e) => setFormData(prev => ({ ...prev, telegramHandle: e.target.value }))}
                placeholder="@yourhandle"
                required
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
                placeholder="My Launch Project"
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
                  <SelectItem value="dapp">Premium dApp</SelectItem>
                  <SelectItem value="both">Token + dApp Bundle <Badge variant="outline"><Crown className="h-3 w-3 mr-1" />Recommended</Badge></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Token Configuration */}
          {(formData.projectType === 'token' || formData.projectType === 'both') && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Advanced Token Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Token Name *</label>
                  <Input
                    value={formData.tokenName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
                    placeholder="My Launch Token"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Token Symbol *</label>
                  <Input
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                    placeholder="MLT"
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
                    placeholder="100000000"
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
              
              {/* NFT Configuration - Enhanced */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNFT"
                    checked={formData.isNFT}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNFT: checked as boolean }))}
                  />
                  <label htmlFor="isNFT" className="text-sm font-medium">
                    Enable Advanced NFT Functionality
                  </label>
                  <Badge variant="outline"><Sparkles className="h-3 w-3 mr-1" />Launchpad</Badge>
                </div>
                
                {formData.isNFT && (
                  <div className="space-y-3 ml-6 p-3 border rounded-lg bg-muted/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">NFT Collection Name</label>
                        <Input
                          value={formData.nftCollectionName}
                          onChange={(e) => setFormData(prev => ({ ...prev, nftCollectionName: e.target.value }))}
                          placeholder="My Premium NFT Collection"
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
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">NFT Description</label>
                      <Textarea
                        value={formData.nftDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, nftDescription: e.target.value }))}
                        placeholder="Describe your premium NFT collection..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* dApp Features - Unlimited */}
          {formData.projectType === 'dapp' || formData.projectType === 'both' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">dApp Features <Badge variant="outline"><Sparkles className="h-3 w-3 mr-1" />Unlimited</Badge></h3>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add any feature (e.g., Advanced Analytics, AI Integration, Multi-chain Support)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature}>
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
              <p className="text-sm text-muted-foreground">
                <Info className="inline h-4 w-4 mr-1" />
                Launchpad tier includes unlimited features. Add as many as you need!
              </p>
            </div>
          ) : null}

          {/* Advanced Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Premium Configuration</h3>
            
            <Tabs defaultValue="api" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="api">API Access</TabsTrigger>
                <TabsTrigger value="deployment">Deployment</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="whitelabel">White-label</TabsTrigger>
              </TabsList>
              
              <TabsContent value="api" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">API Access Level</label>
                  <Select value={formData.apiAccessLevel} onValueChange={(value: 'basic' | 'advanced' | 'enterprise') => setFormData(prev => ({ ...prev, apiAccessLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic API Access</SelectItem>
                      <SelectItem value="advanced">Advanced API Access</SelectItem>
                      <SelectItem value="enterprise">Enterprise API Access <Badge variant="outline"><Crown className="h-3 w-3 mr-1" />Launchpad</Badge></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Integration Level</label>
                  <Select value={formData.integrationLevel} onValueChange={(value: 'basic' | 'advanced' | 'full') => setFormData(prev => ({ ...prev, integrationLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Integrations</SelectItem>
                      <SelectItem value="advanced">Advanced Integrations</SelectItem>
                      <SelectItem value="full">Full Integration Suite <Badge variant="outline"><Sparkles className="h-3 w-3 mr-1" />Launchpad</Badge></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="deployment" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Deployment Targets</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Mainnet', 'Devnet', 'Testnet', 'Local', 'Multi-chain', 'Custom RPC'].map((target) => (
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
              </TabsContent>
              
              <TabsContent value="compliance" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Compliance Level</label>
                  <Select value={formData.complianceLevel} onValueChange={(value: 'basic' | 'standard' | 'enterprise') => setFormData(prev => ({ ...prev, complianceLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Compliance</SelectItem>
                      <SelectItem value="standard">Standard Compliance</SelectItem>
                      <SelectItem value="enterprise">Enterprise Compliance <Badge variant="outline"><Crown className="h-3 w-3 mr-1" />Launchpad</Badge></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Support Level</label>
                  <Select value={formData.supportLevel} onValueChange={(value: 'community' | 'priority' | 'dedicated') => setFormData(prev => ({ ...prev, supportLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">Community Support</SelectItem>
                      <SelectItem value="priority">Priority Support <Badge variant="outline"><Sparkles className="h-3 w-3 mr-1" />Launchpad</Badge></SelectItem>
                      <SelectItem value="dedicated">Dedicated Support (Enterprise Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="whitelabel" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable-whitelabel"
                      checked={!!formData.whiteLabelConfig.customDomain}
                      onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      whiteLabelConfig: {
                        ...prev.whiteLabelConfig,
                        customDomain: checked ? '' : prev.whiteLabelConfig.customDomain
                      }
                    }))}
                  />
                  <label htmlFor="enable-whitelabel" className="text-sm font-medium">
                    Enable Basic White-label
                  </label>
                  <Badge variant="outline"><Sparkles className="h-3 w-3 mr-1" />Launchpad</Badge>
                </div>
                
                {formData.whiteLabelConfig.customDomain !== null && (
                  <div className="space-y-3 ml-6 p-3 border rounded-lg bg-muted/50">
                    <div>
                      <label className="block text-sm font-medium mb-1">Custom Domain</label>
                      <Input
                        value={formData.whiteLabelConfig.customDomain}
                        onChange={(e) => setFormData(prev => ({
                        ...prev,
                        whiteLabelConfig: {
                          ...prev.whiteLabelConfig,
                          customDomain: e.target.value
                        }
                      }))}
                        placeholder="app.yourproject.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Primary Color</label>
                        <Input
                          type="color"
                          value={formData.whiteLabelConfig.branding.colors.primary}
                          onChange={(e) => setFormData(prev => ({
                          ...prev,
                          whiteLabelConfig: {
                            ...prev.whiteLabelConfig,
                            branding: {
                              ...prev.whiteLabelConfig.branding,
                              colors: {
                                ...prev.whiteLabelConfig.branding.colors,
                                primary: e.target.value
                              }
                            }
                          }
                        }))}
                        className="h-10 w-20"
                      />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Secondary Color</label>
                        <Input
                          type="color"
                          value={formData.whiteLabelConfig.branding.colors.secondary}
                          onChange={(e) => setFormData(prev => ({
                          ...prev,
                          whiteLabelConfig: {
                            ...prev.whiteLabelConfig,
                            branding: {
                              ...prev.whiteLabelConfig.branding,
                              colors: {
                                ...prev.whiteLabelConfig.branding.colors,
                                secondary: e.target.value
                              }
                            }
                          }
                        }))}
                        className="h-10 w-20"
                      />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          </div>

          {/* Submit Button */}
          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Generation...
                </>
              ) : (
                `Generate Launchpad Project - $149`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
