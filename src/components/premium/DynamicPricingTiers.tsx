'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Sparkles, Crown, Code, Palette, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState } from 'react';

export type CompilerTier = 'starter' | 'builder' | 'launchpad' | 'agency' | 'enterprise';

interface TierConfig {
  name: string;
  icon: any;
  color: string;
  priceUSD: number;
  target: string;
  features: string[];
  generatedElements: string;
  numberOfDesigns: string;
  technicalFeatures: string[];
  securityLevel: string;
  popular?: boolean;
}

// Pricing configurations using original script values
const COMPILER_TIER_PRICING: Record<CompilerTier, TierConfig> = {
  starter: {
    name: 'Starter (Developer Access)',
    icon: Zap,
    color: 'from-green-500 to-emerald-500',
    priceUSD: 39,
    target: 'For solo builders, testing, hackathons',
    features: [
      'API Gateway access',
      'Generator Service (basic templates)',
      'Token contract generation',
      'Manual deployment triggers',
      'Shared infrastructure',
      '1 active project'
    ],
    generatedElements: 'Token contract + Basic dApp scaffold',
    numberOfDesigns: 'Basic project templates',
    technicalFeatures: [
      'Low rate limits',
      'No staking / pools',
      'No backend workers',
      'No white-label'
    ],
    securityLevel: 'Basic security patterns',
    popular: false
  },
  builder: {
    name: 'Builder (Startup Launch)',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    priceUSD: 149,
    target: 'For MVP startups',
    features: [
      'Full generator templates',
      'Automated deployment orchestrator',
      'Backend APIs & DB provisioning',
      'Project dashboard',
      'Hosted environments',
      'Up to 5 projects'
    ],
    generatedElements: 'Complete dApp + Backend infrastructure',
    numberOfDesigns: 'Advanced project templates',
    technicalFeatures: [
      'Shared workers',
      'Moderate API & RPC limits',
      'No staking pools'
    ],
    securityLevel: 'Enhanced security patterns',
    popular: true
  },
  launchpad: {
    name: 'Launchpad (Public Token + Staking)',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    priceUSD: 399,
    target: 'For real token launches',
    features: [
      'Token + staking pool contracts',
      'Rewards distribution workers',
      'Indexer services',
      'Admin dashboards',
      'Monitoring & alerts',
      'Priority deployment queues',
      'Up to 10 projects'
    ],
    generatedElements: 'DeFi platform + Staking + Analytics',
    numberOfDesigns: 'Enterprise project templates',
    technicalFeatures: [
      'Semi-dedicated workers',
      'Higher RPC throughput'
    ],
    securityLevel: 'Enterprise-grade patterns',
    popular: false
  },
  agency: {
    name: 'Agency / White-Label Platform',
    icon: Shield,
    color: 'from-amber-500 to-orange-500',
    priceUSD: 1500,
    target: 'For agencies, incubators, regional launchpads',
    features: [
      'White-label provisioning service',
      'Custom domains & branding',
      'Client sub-accounts',
      'Project factories',
      'Usage-based billing passthrough',
      'Tenant isolation',
      '25–100+ projects'
    ],
    generatedElements: 'White-label platform + Multi-tenant architecture',
    numberOfDesigns: 'Custom branded templates',
    technicalFeatures: [
      'Dedicated infrastructure',
      'Custom integrations',
      'Advanced analytics'
    ],
    securityLevel: 'Agency-grade security',
    popular: false
  },
  enterprise: {
    name: 'Enterprise / Protocol Infrastructure',
    icon: Shield,
    color: 'from-red-500 to-rose-500',
    priceUSD: 5000,
    target: 'For funds, chains, regulated platforms',
    features: [
      'Dedicated service instances',
      'Custom deployment pipelines',
      'Governance & compliance modules',
      'SLA guarantees',
      'Priority engineering support',
      'Unlimited projects (contractual)'
    ],
    generatedElements: 'Custom enterprise solutions + Compliance modules',
    numberOfDesigns: 'Unlimited custom designs',
    technicalFeatures: [
      'Dedicated instances',
      'Custom pipelines',
      'Compliance modules',
      'SLA guarantees'
    ],
    securityLevel: 'Military-grade security',
    popular: false
  }
};

export default function DynamicPricingTiers() {
  const [selectedTier, setSelectedTier] = useState<CompilerTier>('builder');

  const handleTierSelect = (tier: CompilerTier) => {
    setSelectedTier(tier);
  };

  const currentTierConfig = COMPILER_TIER_PRICING[selectedTier];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Choose Your Compiler Tier
            </h2>
            <p className="text-lg text-muted-foreground">
              Select the compiler tier that matches your project requirements
            </p>
          </motion.div>
        </div>

        {/* Tier Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {Object.entries(COMPILER_TIER_PRICING).map(([tier, config]) => (
            <Button
              key={tier}
              variant={selectedTier === tier ? "default" : "outline"}
              onClick={() => handleTierSelect(tier as CompilerTier)}
              className={`px-4 py-2 text-sm ${
                selectedTier === tier 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background text-foreground border-border'
              }`}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Button>
          ))}
        </div>

        {/* Selected Tier Display */}
        <motion.div
          key={selectedTier}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="relative h-full border-primary shadow-xl scale-105">
            {currentTierConfig.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader>
              <div className="mb-4">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${currentTierConfig.color}`}>
                  <currentTierConfig.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">{currentTierConfig.name}</CardTitle>
              <CardDescription>{currentTierConfig.target}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${currentTierConfig.priceUSD}</span>
                  <span className="text-sm text-muted-foreground">One-time payment</span>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                <div className="flex items-start gap-2">
                  <Code className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Generated Elements</p>
                    <p className="text-xs text-muted-foreground">{currentTierConfig.generatedElements}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Palette className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Designs</p>
                    <p className="text-xs text-muted-foreground">{currentTierConfig.numberOfDesigns}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Security Level</p>
                    <p className="text-xs text-muted-foreground">{currentTierConfig.securityLevel}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-lg mb-3">Features Included:</h4>
                <ul className="space-y-2">
                  {currentTierConfig.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-lg mb-3">Technical Features:</h4>
                <ul className="space-y-2">
                  {currentTierConfig.technicalFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="mt-6 space-y-3 pt-6 border-t">
                <Button 
                  className="w-full py-3 text-lg"
                  onClick={() => window.location.href = '/auth/signup'}
                >
                  Get Started with {currentTierConfig.name}
                </Button>
                <div className="text-center">
                  <Link 
                    href={`/templates?tier=${selectedTier}`}
                    className="text-sm text-muted-foreground hover:text-primary underline"
                  >
                    Browse {currentTierConfig.name} Templates
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Why Choose Dynamic Pricing?</h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-medium mb-2">🎯 Targeted Solutions</h4>
                  <p className="text-sm text-muted-foreground">
                    Pay only for the features you need for your specific project type
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">💰 Cost Effective</h4>
                  <p className="text-sm text-muted-foreground">
                    No unnecessary features - optimize your development budget
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🚀 Faster Development</h4>
                  <p className="text-sm text-muted-foreground">
                    Get the right templates and tools for your specific use case
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🔒 Appropriate Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Security features matched to your project's complexity level
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 text-center text-white max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Build Your dApp?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Choose your tier and start building professional Web3 applications today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg"
                onClick={() => window.location.href = '/auth/signup'}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                className="bg-white/20 border-2 border-white text-white hover:bg-white/30 px-8 py-4 text-lg"
                onClick={() => window.location.href = '/templates'}
              >
                Browse Templates
              </Button>
            </div>
            <div className="mt-6 text-sm opacity-80">
              <p>✨ No credit card required for trial • Cancel anytime</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
