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
import { Loader2, Crown, Info, Shield, Globe, Server } from 'lucide-react';
import type { BaseGenerationFormProps } from '@/types/generation-forms';

export default function EnterpriseGenerationForm({ onComplete, selectedTier }: BaseGenerationFormProps) {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Information - Enterprise level
    customerName: '',
    customerEmail: '',
    telegramHandle: '',
    companyName: '',
    companyWebsite: '',
    companySize: 'enterprise' as 'small' | 'medium' | 'large' | 'enterprise',
    industry: 'fintech' as 'fintech' | 'gaming' | 'defi' | 'healthcare' | 'supplychain' | 'other',
    complianceRequirements: [] as string[],

    // Project Basics - Enterprise capabilities
    projectName: '',
    projectDescription: '',
    projectType: 'both' as 'dapp' | 'token' | 'both',
    tier: 'enterprise' as const,

    // Token Configuration - Enterprise options
    tokenName: '',
    tokenSymbol: '',
    tokenDecimals: 9,
    tokenTotalSupply: '1000000000',
    tokenLogoUrl: '',

    // NFT Configuration - Full enterprise support
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

    // Advanced Options - Enterprise capabilities
    customRequirements: '',

    // Enterprise tier specific
    apiAccessLevel: 'enterprise' as 'basic' | 'advanced' | 'enterprise',
    deploymentTargets: [] as string[],
    integrationLevel: 'full' as 'basic' | 'advanced' | 'full',
    complianceLevel: 'enterprise' as 'basic' | 'standard' | 'enterprise',
    supportLevel: 'dedicated' as 'community' | 'priority' | 'dedicated',

    // Full Enterprise White-label
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

    // Enterprise specific features
    multiRegionDeployment: true,
    enterpriseSecurity: true,
    customBlockchain: false,
    privateInfrastructure: true,
    dedicatedNodes: false,
    advancedCompliance: true,
    customIntegrations: [] as string[],
    teamCollaboration: true,
    enterpriseAnalytics: true,
    prioritySupport: true,
    slaGuarantee: true,
    customReporting: true,
    auditSupport: true,
  });

  const [featureInput, setFeatureInput] = useState('');
  const [integrationInput, setIntegrationInput] = useState('');
  const [complianceInput, setComplianceInput] = useState('');

  // Set tier from URL parameter
  useEffect(() => {
    if (selectedTier && selectedTier === 'enterprise') {
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
            totalSupply: parseInt(formData.tokenTotalSupply) || 1000000000,
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
          // Enterprise tier specific capabilities
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
            enterpriseFeatures: {
              multiRegionDeployment: formData.multiRegionDeployment,
              enterpriseSecurity: formData.enterpriseSecurity,
              customBlockchain: formData.customBlockchain,
              privateInfrastructure: formData.privateInfrastructure,
              dedicatedNodes: formData.dedicatedNodes,
              advancedCompliance: formData.advancedCompliance,
              customIntegrations: formData.customIntegrations,
              teamCollaboration: formData.teamCollaboration,
              enterpriseAnalytics: formData.enterpriseAnalytics,
              prioritySupport: formData.prioritySupport,
              slaGuarantee: formData.slaGuarantee,
              customReporting: formData.customReporting,
              auditSupport: formData.auditSupport,
            },
            enterpriseInfo: {
              companyName: formData.companyName,
              companyWebsite: formData.companyWebsite,
              companySize: formData.companySize,
              industry: formData.industry,
              complianceRequirements: formData.complianceRequirements
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create generation');
      }

      const result = await response.json();
      onComplete(result.generationId, 599); // Enterprise tier price
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

  const addCompliance = () => {
    if (complianceInput.trim()) {
      setFormData(prev => ({
        ...prev,
        complianceRequirements: [...prev.complianceRequirements, complianceInput.trim()]
      }));
      setComplianceInput('');
    }
  };

  const removeCompliance = (index: number) => {
    setFormData(prev => ({
      ...prev,
      complianceRequirements: prev.complianceRequirements.filter((_, i) => i !== index)
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
          <Crown className="mx-auto mb-4 h-12 w-12 text-primary" />
          <CardTitle>Connect Wallet to Get Started</CardTitle>
          <CardDescription>
            Connect your Solana wallet to start building with the Enterprise tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            The Enterprise tier includes unlimited everything, custom blockchain development, private infrastructure, and dedicated support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <CardTitle>Enterprise Tier - Ultimate Solution</CardTitle>
          <Badge variant="secondary">$599</Badge>
        </div>
        <CardDescription>
          For enterprises and institutions. Custom blockchain development, private infrastructure, and unlimited everything.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enterprise Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enterprise Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Your Company Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company Website *</label>
                <Input
                  value={formData.companyWebsite}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                  placeholder="https://yourcompany.com"
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
                  placeholder="your@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Industry</label>
                <Select value={formData.industry} onValueChange={(value: 'fintech' | 'gaming' | 'defi' | 'healthcare' | 'supplychain' | 'other') => setFormData(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="defi">DeFi</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="supplychain">Supply Chain</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telegram Handle *</label>
              <Input
                value={formData.telegramHandle}
                onChange={(e) => setFormData(prev => ({ ...prev, telegramHandle: e.target.value }))}
                placeholder="@yourcompany"
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
                placeholder="Enterprise Project Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Description *</label>
              <Textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                placeholder="Detailed enterprise project description..."
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
                  <SelectItem value="dapp">Enterprise dApp</SelectItem>
                  <SelectItem value="both">Token + dApp Bundle <Badge variant="outline"><Crown className="h-3 w-3 mr-1" />Enterprise Recommended</Badge></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Token Configuration */}
          {(formData.projectType === 'token' || formData.projectType === 'both') && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Enterprise Token Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Token Name *</label>
                  <Input
                    value={formData.tokenName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
                    placeholder="Enterprise Token Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Token Symbol *</label>
                  <Input
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                    placeholder="ETK"
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
                    placeholder="1000000000"
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
              
              {/* NFT Configuration - Enterprise */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNFT"
                    checked={formData.isNFT}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNFT: checked as boolean }))}
                  />
                  <label htmlFor="isNFT" className="text-sm font-medium">
                    Enable Enterprise NFT Suite
                  </label>
                  <Badge variant="outline"><Crown className="h-3 w-3 mr-1" />Enterprise</Badge>
                </div>
                
                {formData.isNFT && (
                  <div className="space-y-3 ml-6 p-3 border rounded-lg bg-muted/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">NFT Collection Name</label>
                        <Input
                          value={formData.nftCollectionName}
                          onChange={(e) => setFormData(prev => ({ ...prev, nftCollectionName: e.target.value }))}
                          placeholder="Enterprise NFT Collection"
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
                        placeholder="Enterprise NFT collection description..."
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
              <h3 className="text-lg font-semibold">dApp Features <Badge variant="outline"><Crown className="h-3 w-3 mr-1" />Unlimited</Badge></h3>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add any feature (e.g., AI Integration, Quantum Computing, Custom Blockchain)"
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

          {/* Enterprise Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enterprise Configuration</h3>
            
            <Tabs defaultValue="infrastructure" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
              </TabsList>
              
              <TabsContent value="infrastructure" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privateInfrastructure"
                      checked={formData.privateInfrastructure}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privateInfrastructure: checked as boolean }))}
                    />
                    <label htmlFor="privateInfrastructure" className="text-sm font-medium">
                      Private Infrastructure
                    </label>
                    <Badge variant="outline"><Server className="h-3 w-3 mr-1" />Enterprise</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiRegionDeployment"
                      checked={formData.multiRegionDeployment}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, multiRegionDeployment: checked as boolean }))}
                    />
                    <label htmlFor="multiRegionDeployment" className="text-sm font-medium">
                      Multi-Region Deployment
                    </label>
                    <Badge variant="outline"><Globe className="h-3 w-3 mr-1" />Enterprise</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dedicatedNodes"
                      checked={formData.dedicatedNodes}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dedicatedNodes: checked as boolean }))}
                    />
                    <label htmlFor="dedicatedNodes" className="text-sm font-medium">
                      Dedicated Blockchain Nodes
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="customBlockchain"
                      checked={formData.customBlockchain}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, customBlockchain: checked as boolean }))}
                    />
                    <label htmlFor="customBlockchain" className="text-sm font-medium">
                      Custom Blockchain Development
                    </label>
                    <Badge variant="outline"><Crown className="h-3 w-3 mr-1" />Enterprise</Badge>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Deployment Targets</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Mainnet', 'Devnet', 'Testnet', 'Local', 'Multi-chain', 'Custom RPC', 'Enterprise Cloud', 'Private Infrastructure', 'Hybrid Cloud', 'On-Premise', 'Edge Computing', 'Quantum Network'].map((target) => (
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
              
              <TabsContent value="security" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enterpriseSecurity"
                      checked={formData.enterpriseSecurity}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enterpriseSecurity: checked as boolean }))}
                    />
                    <label htmlFor="enterpriseSecurity" className="text-sm font-medium">
                      Enterprise Security Suite
                    </label>
                    <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Enterprise</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="advancedCompliance"
                      checked={formData.advancedCompliance}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, advancedCompliance: checked as boolean }))}
                    />
                    <label htmlFor="advancedCompliance" className="text-sm font-medium">
                      Advanced Compliance Framework
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auditSupport"
                      checked={formData.auditSupport}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auditSupport: checked as boolean }))}
                    />
                    <label htmlFor="auditSupport" className="text-sm font-medium">
                      Audit Support & Certification
                    </label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="compliance" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Compliance Requirements</label>
                  <div className="flex gap-2">
                    <Input
                      value={complianceInput}
                      onChange={(e) => setComplianceInput(e.target.value)}
                      placeholder="Add compliance requirement (e.g., SOC 2, ISO 27001, GDPR)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompliance())}
                    />
                    <Button type="button" onClick={addCompliance}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.complianceRequirements.map((requirement, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeCompliance(index)}>
                        {requirement} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="integrations" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Enterprise Integrations</label>
                  <div className="flex gap-2">
                    <Input
                      value={integrationInput}
                      onChange={(e) => setIntegrationInput(e.target.value)}
                      placeholder="Add integration (e.g., SAP, Oracle, Custom ERP)"
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
              </TabsContent>
              
              <TabsContent value="support" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="prioritySupport"
                      checked={formData.prioritySupport}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, prioritySupport: checked as boolean }))}
                    />
                    <label htmlFor="prioritySupport" className="text-sm font-medium">
                      24/7 Priority Support
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="slaGuarantee"
                      checked={formData.slaGuarantee}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, slaGuarantee: checked as boolean }))}
                    />
                    <label htmlFor="slaGuarantee" className="text-sm font-medium">
                      SLA Guarantee (99.9% Uptime)
                    </label>
                    <Badge variant="outline"><Crown className="h-3 w-3 mr-1" />Enterprise</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="customReporting"
                      checked={formData.customReporting}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, customReporting: checked as boolean }))}
                    />
                    <label htmlFor="customReporting" className="text-sm font-medium">
                      Custom Reporting & Analytics
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enterpriseAnalytics"
                      checked={formData.enterpriseAnalytics}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enterpriseAnalytics: checked as boolean }))}
                    />
                    <label htmlFor="enterpriseAnalytics" className="text-sm font-medium">
                      Enterprise Analytics Suite
                    </label>
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
                  Creating Enterprise Generation...
                </>
              ) : (
                `Generate Enterprise Project - $599`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
