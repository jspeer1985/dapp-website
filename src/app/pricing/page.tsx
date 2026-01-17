'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Rocket, 
  Crown, 
  Users, 
  Shield,
  TrendingUp,
  ShoppingCart,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

// Template pricing data
const templatePricing = {
  // DeFi Templates
  'defi-yield-farm': { name: 'DeFi Yield Farm', price: 299, category: 'DeFi' },
  'defi-dex-exchange': { name: 'DEX Exchange', price: 349, category: 'DeFi' },
  'defi-staking-pools': { name: 'Staking Pools Platform', price: 279, category: 'DeFi' },
  'defi-lending-protocol': { name: 'Lending Protocol', price: 389, category: 'DeFi' },
  'defi-cross-chain-bridge': { name: 'Cross-Chain Bridge', price: 449, category: 'DeFi' },
  'defi-liquidity-mining': { name: 'Liquidity Mining Platform', price: 329, category: 'DeFi' },
  'defi-yield-aggregator': { name: 'Yield Aggregator', price: 419, category: 'DeFi' },
  'defi-options-protocol': { name: 'DeFi Options Protocol', price: 529, category: 'DeFi' },
  'defi-synthetic-assets': { name: 'Synthetic Assets Platform', price: 459, category: 'DeFi' },
  'defi-flash-loans': { name: 'Flash Loans Protocol', price: 379, category: 'DeFi' },

  // NFT Templates
  'nft-marketplace': { name: 'NFT Marketplace', price: 199, category: 'NFT' },
  'nft-auction-house': { name: 'NFT Auction House', price: 249, category: 'NFT' },
  'nft-staking-platform': { name: 'NFT Staking Platform', price: 179, category: 'NFT' },
  'nft-gaming-assets': { name: 'NFT Gaming Assets', price: 229, category: 'NFT' },
  'nft-music-platform': { name: 'NFT Music Platform', price: 199, category: 'NFT' },

  // DAO Templates
  'dao-governance-suite': { name: 'DAO Governance Suite', price: 399, category: 'DAO' },
  'dao-treasury-manager': { name: 'DAO Treasury Manager', price: 349, category: 'DAO' },
  'dao-voting-portal': { name: 'DAO Voting Portal', price: 279, category: 'DAO' },
  'dao-reputation-system': { name: 'DAO Reputation System', price: 319, category: 'DAO' },
  'dao-community-fund': { name: 'DAO Community Fund', price: 299, category: 'DAO' },

  // Gaming Templates
  'gaming-p2e-arena': { name: 'P2E Battle Arena', price: 429, category: 'Gaming' },
  'gaming-virtual-world': { name: 'Virtual World Metaverse', price: 549, category: 'Gaming' },
  'gaming-fantasy-sports': { name: 'Fantasy Sports League', price: 379, category: 'Gaming' },
  'gaming-card-game': { name: 'Blockchain Card Game', price: 329, category: 'Gaming' },
  'gaming-racing-game': { name: 'Web3 Racing Game', price: 389, category: 'Gaming' },

  // Token Templates
  'token-launchpad-pro': { name: 'Token Launchpad Pro', price: 499, category: 'Token' },
  'token-staking-platform': { name: 'Token Staking Platform', price: 359, category: 'Token' },
  'token-governance-system': { name: 'Token Governance System', price: 419, category: 'Token' },
  'token-bridge-protocol': { name: 'Token Bridge Protocol', price: 529, category: 'Token' },
  'token-farming-protocol': { name: 'Token Farming Protocol', price: 389, category: 'Token' },
};

// Subscription tiers
const subscriptionTiers = [
  {
    name: 'Builder',
    price: 149,
    monthly: true,
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    features: [
      '5 dApp generations per month',
      'Basic templates access',
      'Community support',
      'Standard deployment',
      'Basic analytics',
      'Email support'
    ],
    limitations: [
      'No advanced templates',
      'No white-label options',
      'No priority support',
      'No custom domains'
    ],
    popular: false
  },
  {
    name: 'Launchpad',
    price: 399,
    monthly: true,
    icon: Rocket,
    color: 'from-purple-500 to-pink-500',
    features: [
      '20 dApp generations per month',
      'All templates access',
      'Priority support',
      'Advanced deployment',
      'Advanced analytics',
      'Custom domains',
      'API access',
      'Team collaboration (5 users)'
    ],
    limitations: [
      'Limited white-label options',
      'No dedicated account manager'
    ],
    popular: true
  },
  {
    name: 'Agency',
    price: 1500,
    monthly: true,
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      'Unlimited dApp generations',
      'All templates + exclusive',
      '24/7 dedicated support',
      'Enterprise deployment',
      'Custom analytics',
      'White-label options',
      'Advanced API access',
      'Team collaboration (20 users)',
      'Custom integrations',
      'Dedicated account manager',
      'Custom contracts',
      'Priority queue'
    ],
    limitations: [],
    popular: false
  },
  {
    name: 'Enterprise',
    price: 5000,
    monthly: true,
    icon: Shield,
    color: 'from-emerald-500 to-teal-500',
    features: [
      'Everything in Agency',
      'Unlimited everything',
      'On-premise deployment',
      'Custom blockchain support',
      'SLA guarantee',
      'Custom development',
      'Training & onboarding',
      'Compliance packages',
      'Audit coordination',
      'Custom branding',
      'Dedicated infrastructure'
    ],
    limitations: [],
    popular: false
  }
];

export default function PricingPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Calculate category counts and prices
  const categoryStats = Object.values(templatePricing).reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = { count: 0, totalValue: 0, avgPrice: 0 };
    }
    acc[template.category].count++;
    acc[template.category].totalValue += template.price;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number; avgPrice: number }>);

  // Calculate average prices
  Object.keys(categoryStats).forEach(category => {
    categoryStats[category].avgPrice = Math.round(categoryStats[category].totalValue / categoryStats[category].count);
  });

  // Filter templates by category
  const filteredTemplates = Object.values(templatePricing).filter(
    template => selectedCategory === 'all' || template.category === selectedCategory
  );

  // Calculate annual discount
  const getAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% discount for annual
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Pricing & Plans
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your needs. From individual templates to enterprise solutions.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Pricing Navigation */}
        <div className="flex justify-center mb-12">
          <Tabs value="subscriptions" className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subscriptions">Subscription Plans</TabsTrigger>
              <TabsTrigger value="templates">Template Pricing</TabsTrigger>
            </TabsList>

            {/* Subscription Plans */}
            <TabsContent value="subscriptions" className="mt-8">
              {/* Billing Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-white rounded-lg border p-1 flex">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      billingCycle === 'monthly'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      billingCycle === 'annual'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Annual Billing
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Subscription Tiers */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subscriptionTiers.map((tier, index) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`relative h-full ${tier.popular ? 'border-2 border-blue-500 shadow-lg' : ''}`}>
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-500 text-white">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-4">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-r ${tier.color} flex items-center justify-center`}>
                          <tier.icon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                        <div className="mt-4">
                          <div className="text-4xl font-bold">
                            ${billingCycle === 'monthly' ? tier.price : getAnnualPrice(tier.price)}
                          </div>
                          <div className="text-gray-600">
                            {billingCycle === 'monthly' ? '/month' : '/year'}
                          </div>
                          {billingCycle === 'annual' && (
                            <div className="text-sm text-green-600 mt-1">
                              Save ${tier.price * 12 - getAnnualPrice(tier.price)} annually
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1">
                        <div className="space-y-3">
                          {tier.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                          {tier.limitations.map((limitation, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-500">{limitation}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          className={`w-full mt-6 bg-gradient-to-r ${tier.color} hover:opacity-90`}
                          size="lg"
                        >
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Template Pricing */}
            <TabsContent value="templates" className="mt-8">
              {/* Category Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">10</div>
                  <div className="text-sm text-gray-600">DeFi Templates</div>
                  <div className="text-xs text-gray-500">Avg: ${categoryStats.DeFi?.avgPrice || 0}</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">5</div>
                  <div className="text-sm text-gray-600">NFT Templates</div>
                  <div className="text-xs text-gray-500">Avg: ${categoryStats.NFT?.avgPrice || 0}</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-sm text-gray-600">DAO Templates</div>
                  <div className="text-xs text-gray-500">Avg: ${categoryStats.DAO?.avgPrice || 0}</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">5</div>
                  <div className="text-sm text-gray-600">Gaming Templates</div>
                  <div className="text-xs text-gray-500">Avg: ${categoryStats.Gaming?.avgPrice || 0}</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">5</div>
                  <div className="text-sm text-gray-600">Token Templates</div>
                  <div className="text-xs text-gray-500">Avg: ${categoryStats.Token?.avgPrice || 0}</div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex justify-center mb-8">
                <div className="bg-white rounded-lg border p-1 flex flex-wrap gap-1">
                  {['all', 'DeFi', 'NFT', 'DAO', 'Gaming', 'Token'].map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {category === 'all' ? 'All Templates' : category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{template.category}</Badge>
                          <div className="text-2xl font-bold text-green-600">${template.price}</div>
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            One-time purchase with full source code
                          </div>
                          <div className="text-sm text-gray-600">
                            ✓ Smart contracts included
                          </div>
                          <div className="text-sm text-gray-600">
                            ✓ Frontend components
                          </div>
                          <div className="text-sm text-gray-600">
                            ✓ Documentation & deployment guides
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/templates/preview/${template.name.toLowerCase().replace(/\s+/g, '-')}`}>
                              Preview
                            </Link>
                          </Button>
                          <Button size="sm" className="flex-1">
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Buy Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Value Proposition */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Get Started Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of developers building the future of decentralized applications
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
