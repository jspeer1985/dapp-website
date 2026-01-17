'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Check,
  X,
  Zap,
  Sparkles,
  Crown,
  Shield,
  Building
} from 'lucide-react';

export type CompilerTier = 'builder' | 'launchpad' | 'agency' | 'enterprise';

interface TierConfig {
  name: string;
  icon: any;
  color: string;
  priceUSD: number;
  billing: string;
  target: string;
  included: string[];
  notIncluded: string[];
  popular?: boolean;
  cta: string;
  ctaAction: 'checkout' | 'contact';
}

// Subscription-based pricing tiers
const PRICING_TIERS: Record<CompilerTier, TierConfig> = {
  builder: {
    name: 'Builder',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    priceUSD: 149,
    billing: '/month',
    target: 'For solo developers and small teams',
    included: [
      '5 dApp generations per month',
      'Basic templates access',
      'Community support',
      'Standard deployment',
      'Basic analytics',
      'Email support'
    ],
    notIncluded: [
      'No advanced templates',
      'No white-label options',
      'No priority support',
      'No custom domains'
    ],
    cta: 'Get Started',
    ctaAction: 'checkout',
    popular: false
  },
  launchpad: {
    name: 'Launchpad',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    priceUSD: 399,
    billing: '/month',
    target: 'For startups launching tokens',
    included: [
      '20 dApp generations per month',
      'All templates access',
      'Priority support',
      'Advanced deployment',
      'Advanced analytics',
      'Custom domains',
      'API access',
      'Team collaboration (5 users)'
    ],
    notIncluded: [
      'Limited white-label options',
      'No dedicated account manager'
    ],
    cta: 'Get Started',
    ctaAction: 'checkout',
    popular: true
  },
  agency: {
    name: 'Agency',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    priceUSD: 1500,
    billing: '/month',
    target: 'For agencies and incubators',
    included: [
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
    notIncluded: [],
    cta: 'Get Started',
    ctaAction: 'checkout',
    popular: false
  },
  enterprise: {
    name: 'Enterprise',
    icon: Building,
    color: 'from-slate-600 to-slate-800',
    priceUSD: 5000,
    billing: '/month',
    target: 'For large organizations',
    included: [
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
    notIncluded: [],
    cta: 'Contact Sales',
    ctaAction: 'contact',
    popular: false
  }
};

export default function DynamicPricingTiers() {
  const [loading, setLoading] = useState<string | null>(null);

  // Handle CTA button clicks
  const handleTierCTA = async (tier: CompilerTier, config: TierConfig) => {
    setLoading(tier);

    try {
      if (config.ctaAction === 'contact') {
        // Enterprise - redirect to contact page
        window.location.href = '/contact?tier=enterprise';
        return;
      }

      // Create Stripe checkout session using price_data
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier,
          tierName: config.name,
          price: config.priceUSD,
          billing: 'monthly'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('CTA handler error:', error);
      alert(error instanceof Error ? error.message : 'Error processing request. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="py-20 bg-[#0A0A0A]">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include core features.
            </p>
          </motion.div>
        </div>

        {/* Pricing Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(PRICING_TIERS).map(([tier, config], index) => (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <Card className={`h-full bg-slate-900 border-slate-800 flex flex-col transition-all hover:border-slate-700 ${
                config.popular ? 'border-purple-500/50' : ''
              }`}>
                {/* Popular Badge */}
                {config.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-semibold border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pt-8 pb-4">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${config.color}`}>
                      <config.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Name & Description */}
                  <CardTitle className="text-2xl font-bold text-white">{config.name}</CardTitle>
                  <CardDescription className="text-gray-400 mt-2">{config.target}</CardDescription>

                  {/* Price */}
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-white">${config.priceUSD}</span>
                      <span className="text-gray-400 text-lg">{config.billing}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col px-6 pb-6">
                  {/* Features List */}
                  <div className="flex-1 space-y-3 mb-6">
                    {config.included.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                    {config.notIncluded.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <X className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                        <span className="text-gray-500 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    className={`w-full py-6 text-base font-semibold transition-all ${
                      config.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                        : config.ctaAction === 'contact'
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                        : 'bg-white hover:bg-gray-100 text-black'
                    }`}
                    onClick={() => handleTierCTA(tier as CompilerTier, config)}
                    disabled={loading === tier}
                  >
                    {loading === tier ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        Processing...
                      </div>
                    ) : (
                      config.cta
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm">
            All plans include security analysis, compliance checks, and 24h download access.
            <br />
            Need a custom solution? <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline">Contact our team</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
