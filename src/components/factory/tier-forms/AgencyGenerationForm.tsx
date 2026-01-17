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
import { Loader2, Building, Info, Crown, Briefcase } from 'lucide-react';
import type { BaseGenerationFormProps } from '@/types/generation-forms';

export default function AgencyGenerationForm({ onComplete, selectedTier }: BaseGenerationFormProps) {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Information - Enhanced for agency
    customerName: '',
    customerEmail: '',
    telegramHandle: '',
    agencyName: '',
    agencyWebsite: '',
    agencySize: 'small' as 'small' | 'medium' | 'large' | 'enterprise',

    // Project Basics - Full agency capabilities
    projectName: '',
    projectDescription: '',
    projectType: 'both' as 'dapp' | 'token' | 'both',
    tier: 'enterprise' as const,

    // Token Configuration - Professional options
    tokenName: '',
    tokenSymbol: '',
    tokenDecimals: 9,
    tokenTotalSupply: '500000000',
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

    // Advanced Options - Agency capabilities
    customRequirements: '',

    // Agency tier specific
    apiAccessLevel: 'enterprise' as 'basic' | 'advanced' | 'enterprise',
    deploymentTargets: [] as string[],
    integrationLevel: 'full' as 'basic' | 'advanced' | 'full',
    complianceLevel: 'enterprise' as 'basic' | 'standard' | 'enterprise',
    supportLevel: 'dedicated' as 'community' | 'priority' | 'dedicated',

    // Enhanced White-label options
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
        customAuth: true,
        customUI: true,
        customBackend: true
      }
    },

    // Agency specific features
    clientManagement: true,
    multiTenant: true,
    customIntegrations: [] as string[],
    teamCollaboration: true,
    advancedAnalytics: true,
    prioritySupport: true,
  });

  const [featureInput, setFeatureInput] = useState('');
  const [integrationInput, setIntegrationInput] = useState('');

  // Set tier from URL parameter
  useEffect(() => {
    if (selectedTier && (selectedTier === 'agency' || selectedTier === 'enterprise')) {
      setFormData(prev => ({
        ...prev,
        tier: 'enterprise'
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
            totalSupply: parseInt(formData.tokenTotalSupply) || 500000000,
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
          // Agency tier specific capabilities
          capabilities: {
            maxFeatures: 999,
            nftSupport: true,
            fullWhiteLabel: true,
            apiAccess: formData.apiAccessLevel,
            deploymentTargets: formData.deploymentTargets,
            integrationLevel: formData.integrationLevel,
            complianceLevel: formData.complianceLevel,
            supportLevel: formData.supportLevel,
            whiteLabelConfig: formData.whiteLabelConfig,
            agencyFeatures: {
              clientManagement: formData.clientManagement,
              multiTenant: formData.multiTenant,
              customIntegrations: formData.customIntegrations,
              teamCollaboration: formData.teamCollaboration,
              advancedAnalytics: formData.advancedAnalytics,
              prioritySupport: formData.prioritySupport,
            },
            agencyInfo: {
              agencyName: formData.agencyName,
              agencyWebsite: formData.agencyWebsite,
              agencySize: formData.agencySize
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create generation');
      }

      const result = await response.json();
      onComplete(result.generationId, 299); // Agency tier price
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

  const addIntegration = () => {
    if (integrationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        customIntegrations: [...prev.customIntegrations, integrationInput.trim()]
      }));
      setIntegrationInput('');
    }
  };

  const removeIntegration = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customIntegrations: prev.customIntegrations.filter((_, i) => i !== index)
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
          <Building className="mx-auto mb-4 h-12 w-12 text-primary" />
          <CardTitle>Connect Wallet to Get Started</CardTitle>
          <CardDescription>
            Connect your Solana wallet to start building with the Agency tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            The Agency tier includes full white-label options, multi-tenant support, and dedicated team collaboration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-orange-500" />
          <CardTitle>Agency Tier - Professional Services</CardTitle>
          <Badge variant="secondary">$299</Badge>
        </div>
        <CardDescription>
          For agencies and professional teams. Full white-label, multi-tenant, and advanced collaboration features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agency Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Agency Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Agency Name *</label>
                <Input
                  value={formData.agencyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, agencyName: e.target.value }))}
                  placeholder="Your Agency Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Agency Website *</label>
                <Input
                  value={formData.agencyWebsite}
                  onChange={(e) => setFormData(prev => ({ ...prev, agencyWebsite: e.target.value }))}
                  placeholder="https://youragency.com"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name *</label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email *</label>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Agency Size</label>
                <Select value={formData.agencySize} onValueChange={(value: 'small' | 'medium' | 'large' | 'enterprise') => setFormData(prev => ({ ...prev, agencySize: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1-10 people)</SelectItem>
                    <SelectItem value="medium">Medium (11-50 people)</SelectItem>
                    <SelectItem value="large">Large (51-200 people)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (200+ people)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telegram Handle *</label>
              <Input
                value={formData.telegramHandle}
                onChange={(e) => setFormData(prev => ({ ...prev, telegramHandle: e.target.value }))}
                placeholder="@youragency"
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
                placeholder="Client Project Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Description *</label>
              <Textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                placeholder="Detailed project description for client..."
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
                  <SelectItem value="dapp">Professional dApp</SelectItem>
                  <SelectItem value="both">Token + dApp Bundle <Badge variant="outline"><Briefcase className="h-3 w-3 mr-1" />Agency Recommended</Badge></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Token Configuration */}
          {(formData.projectType === 'token' || formData.projectType === 'both') && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Professional Token Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Token Name *</label>
                  <Input
                    value={formData.tokenName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
                    placeholder="Client Token Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Token Symbol *</label>
                  <Input
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                    placeholder="CTK"
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
                    placeholder="500000000"
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
              
              {/* NFT Configuration - Professional */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNFT"
                    checked={formData.isNFT}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNFT: checked as boolean }))}
                  />
                  <label htmlFor="isNFT" className="text-sm font-medium">
                    Enable Professional NFT Suite
                  </label>
                  <Badge variant="outline"><Briefcase className="h-3 w-3 mr-1" />Agency</Badge>
                </div>
                
                {formData.isNFT && (
                  <div className="space-y-3 ml-6 p-3 border rounded-lg bg-muted/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">NFT Collection Name</label>
                        <Input
                          value={formData.nftCollectionName}
                          onChange={(e) => setFormData(prev => ({ ...prev, nftCollectionName: e.target.value }))}
                          placeholder="Client NFT Collection"
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
                        placeholder="Professional NFT collection description..."
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
              <h3 className="text-lg font-semibold">dApp Features <Badge variant="outline"><Briefcase className="h-3 w-3 mr-1" />Unlimited</Badge></h3>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add any feature (e.g., Client Dashboard, Multi-chain, Advanced Analytics)"
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
            </div>
          ) : null}

          {/* Agency Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Agency Configuration</h3>
            
            <Tabs defaultValue="whitelabel" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="whitelabel">White-label</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="team">Team Features</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="whitelabel" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable-full-whitelabel"
                      checked={!!formData.whiteLabelConfig.customDomain}
                      onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      whiteLabelConfig: {
                        ...prev.whiteLabelConfig,
                        customDomain: checked ? '' : prev.whiteLabelConfig.customDomain
                      }
                    }))}
                  />
                    <label htmlFor="enable-full-whitelabel" className="text-sm font-medium">
                      Enable Full White-label Suite
                    </label>
                    <Badge variant="outline"><Crown className="h-3 w-3 mr-1" />Agency</Badge>
                  </div>
                  
                  {formData.whiteLabelConfig.customDomain !== null && (
                    <div className="space-y-3 ml-6 p-3 border rounded-lg bg-muted/50">
                      <div>
                        <label className="block text-sm font-medium mb-1">Custom Domain *</label>
                        <Input
                          value={formData.whiteLabelConfig.customDomain}
                          onChange={(e) => setFormData(prev => ({
                          ...prev,
                          whiteLabelConfig: {
                            ...prev.whiteLabelConfig,
                            customDomain: e.target.value
                          }
                        }))}
                          placeholder="client.youragency.com"
                          required
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
                      <div>
                        <label className="block text-sm font-medium mb-1">Custom CSS</label>
                        <Textarea
                          value={formData.whiteLabelConfig.branding.customCSS}
                          onChange={(e) => setFormData(prev => ({
                          ...prev,
                          whiteLabelConfig: {
                            ...prev.whiteLabelConfig,
                            branding: {
                              ...prev.whiteLabelConfig.branding,
                              customCSS: e.target.value
                            }
                          }
                        }))}
                          placeholder="Custom CSS for client branding..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="integrations" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Integrations</label>
                  <div className="flex gap-2">
                    <Input
                      value={integrationInput}
                      onChange={(e) => setIntegrationInput(e.target.value)}
                      placeholder="Add integration (e.g., Salesforce, HubSpot, Custom API)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIntegration())}
                    />
                    <Button type="button" onClick={addIntegration}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.customIntegrations.map((integration, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeIntegration(index)}>
                        {integration} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Deployment Targets</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Mainnet', 'Devnet', 'Testnet', 'Local', 'Multi-chain', 'Custom RPC', 'Enterprise Cloud', 'Private Infrastructure'].map((target) => (
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
              
              <TabsContent value="team" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="clientManagement"
                      checked={formData.clientManagement}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, clientManagement: checked as boolean }))}
                    />
                    <label htmlFor="clientManagement" className="text-sm font-medium">
                      Client Management Portal
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiTenant"
                      checked={formData.multiTenant}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, multiTenant: checked as boolean }))}
                    />
                    <label htmlFor="multiTenant" className="text-sm font-medium">
                      Multi-Tenant Architecture
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="teamCollaboration"
                      checked={formData.teamCollaboration}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, teamCollaboration: checked as boolean }))}
                    />
                    <label htmlFor="teamCollaboration" className="text-sm font-medium">
                      Advanced Team Collaboration
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="advancedAnalytics"
                      checked={formData.advancedAnalytics}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, advancedAnalytics: checked as boolean }))}
                    />
                    <label htmlFor="advancedAnalytics" className="text-sm font-medium">
                      Advanced Analytics Dashboard
                    </label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">API Access Level</label>
                    <Select value={formData.apiAccessLevel} onValueChange={(value: 'basic' | 'advanced' | 'enterprise') => setFormData(prev => ({ ...prev, apiAccessLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic API Access</SelectItem>
                        <SelectItem value="advanced">Advanced API Access</SelectItem>
                        <SelectItem value="enterprise">Enterprise API Access</SelectItem>
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
                        <SelectItem value="priority">Priority Support</SelectItem>
                        <SelectItem value="dedicated">Dedicated Support <Badge variant="outline"><Crown className="h-3 w-3 mr-1" />Agency</Badge></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  Creating Agency Generation...
                </>
              ) : (
                `Generate Agency Project - $299`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
