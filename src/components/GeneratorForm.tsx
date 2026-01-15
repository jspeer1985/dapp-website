'use client';

import { useState } from 'react';
import { DeterministicDAppCompiler } from '@/lib/compiler/DeterministicCompiler';
import { ConfigValidator } from '@/lib/compiler/ConfigValidator';
import { downloadZip } from '@/lib/utils/downloadZip';
import { getTierPrice, getTierInfo } from '@/lib/pricing';
import type { ProjectConfig } from '@/lib/compiler/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function GeneratorForm() {
  const [config, setConfig] = useState<ProjectConfig>({
    project: { name: '', type: 'token+dapp', tier: 'professional' },
    token: { enabled: true, name: '', symbol: '', decimals: 9, supply: 1000000000, nft: false },
    dapp: { pages: ['home'], features: ['staking'], brandColor: '#6366f1' },
    infra: { chain: 'solana', db: 'postgres', auth: 'wallet', hosting: 'vercel' }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; errors?: string[] } | null>(null);

  // Get current tier info and pricing
  const currentTierInfo = getTierInfo(config.project.tier);
  const currentTierPrice = getTierPrice(config.project.tier);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Convert base64 back to blob
        const binaryString = atob(data.zipData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/zip' });
        
        downloadZip(blob, `${config.project.name}-dapp.zip`);
        setResult({ success: true, message: `Generated ${data.fileCount} files successfully!` });
      } else {
        setResult({ success: false, errors: data.error ? [data.error] : ['Unknown error'] });
      }
    } catch (error) {
      setResult({ success: false, errors: ['Network error occurred'] });
    } finally {
      setIsGenerating(false);
    }
  };

  const validateAndGenerate = () => {
    const validation = ConfigValidator.validate(config);
    
    if (!validation.valid) {
      setResult({ success: false, errors: validation.errors });
      return;
    }
    
    handleGenerate();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 DApp Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate production-ready Solana dApps with deterministic templates
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Project Configuration</CardTitle>
              <CardDescription>
                Configure your dApp project and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Project Details</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <Input
                      value={config.project.name}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        project: { ...prev.project, name: e.target.value }
                      }))}
                      placeholder="My Awesome dApp"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tier
                    </label>
                    <Select
                      value={config.project.tier}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        project: { ...prev.project, tier: value as any }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">
                          Starter (${getTierPrice('starter').usd} / {getTierPrice('starter').sol} SOL)
                        </SelectItem>
                        <SelectItem value="professional">
                          Professional (${getTierPrice('professional').usd} / {getTierPrice('professional').sol} SOL)
                        </SelectItem>
                        <SelectItem value="enterprise">
                          Enterprise (${getTierPrice('enterprise').usd} / {getTierPrice('enterprise').sol} SOL)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Color
                  </label>
                  <Input
                    type="color"
                    value={config.dapp.brandColor}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      dapp: { ...prev.dapp, brandColor: e.target.value }
                      }))}
                    placeholder="#6366f1"
                    className="w-full h-10"
                  />
                </div>
              </div>

              {/* Token Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Token Configuration</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token Name
                    </label>
                    <Input
                      value={config.token.name}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        token: { ...prev.token, name: e.target.value }
                      }))}
                      placeholder="My Token"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Symbol
                    </label>
                    <Input
                      value={config.token.symbol}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        token: { ...prev.token, symbol: e.target.value.toUpperCase() }
                      }))}
                      placeholder="MTK"
                      maxLength={10}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supply
                    </label>
                    <Input
                      type="number"
                      value={config.token.supply}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        token: { ...prev.token, supply: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="1000000000"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Decimals
                    </label>
                    <Input
                      type="number"
                      value={config.token.decimals}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        token: { ...prev.token, decimals: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="9"
                      min={0}
                      max={18}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Infrastructure */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Infrastructure</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blockchain
                    </label>
                    <Select
                      value={config.infra.chain}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        infra: { ...prev.infra, chain: value as any }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solana">Solana</SelectItem>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Database
                    </label>
                    <Select
                      value={config.infra.db}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        infra: { ...prev.infra, db: value as any }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postgres">PostgreSQL</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result Display */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Result</CardTitle>
              <CardDescription>
                {result ? (result.success ? '✅ Success!' : '❌ Failed') : 'Ready to generate'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result && (
                <div className="space-y-4">
                  {result.success ? (
                    <div className="text-green-600">
                      <CheckCircle2 className="h-8 w-8 mb-2" />
                      <p className="font-semibold">{result.message}</p>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <div>
                        <p className="font-semibold mb-2">Generation Failed</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {result.errors?.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={validateAndGenerate}
              disabled={isGenerating}
              size="lg"
              className="min-w-48"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Generate dApp
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/factory'}
            >
              Pay with SOL
            </Button>
          </div>
        </div>

        {/* Feature Info */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Tier: {currentTierInfo.name}</CardTitle>
              <CardDescription>
                ${currentTierPrice.usd} USD / {currentTierPrice.sol} SOL - {currentTierInfo.target}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Current Tier */}
                <div className="space-y-3">
                  <Badge variant="outline" className="mb-2">Selected Tier</Badge>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• {currentTierInfo.generatedElements}</li>
                    <li>• {currentTierInfo.numberOfDesigns}</li>
                    <li>• {currentTierInfo.securityLevel}</li>
                  </ul>
                </div>

                {/* Features */}
                <div className="space-y-3 md:col-span-2">
                  <Badge variant="outline" className="mb-2">Features Included</Badge>
                  <ul className="text-sm space-y-1 text-gray-600">
                    {currentTierInfo.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
