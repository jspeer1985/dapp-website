'use client';

import { useState, useEffect } from 'react';
import { Check, X, Zap, Rocket, Crown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Subscription tiers
const subscriptionTiers = [
  {
    id: 'builder',
    name: 'Builder',
    price: 149,
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    description: 'For solo developers and small teams',
    features: [
      { text: '5 dApp generations per month', included: true },
      { text: 'Basic templates access', included: true },
      { text: 'Community support', included: true },
      { text: 'Standard deployment', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'Advanced templates', included: false },
      { text: 'White-label options', included: false },
      { text: 'Priority support', included: false },
      { text: 'Custom domains', included: false },
    ],
    popular: false,
    cta: 'Get Started',
    ctaAction: 'checkout',
    stripePriceId: 'price_builder_monthly' // Replace with your actual Stripe Price ID
  },
  {
    id: 'launchpad',
    name: 'Launchpad',
    price: 399,
    icon: Rocket,
    color: 'from-purple-500 to-pink-500',
    description: 'For startups launching tokens',
    features: [
      { text: '20 dApp generations per month', included: true },
      { text: 'All templates access', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced deployment', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom domains', included: true },
      { text: 'API access', included: true },
      { text: 'Team collaboration (5 users)', included: true },
      { text: 'Limited white-label options', included: true },
      { text: 'Dedicated account manager', included: false },
    ],
    popular: true,
    cta: 'Get Started',
    ctaAction: 'checkout',
    stripePriceId: 'price_launchpad_monthly' // Replace with your actual Stripe Price ID
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 1500,
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    description: 'For agencies and incubators',
    features: [
      { text: 'Unlimited dApp generations', included: true },
      { text: 'All templates + exclusive', included: true },
      { text: '24/7 dedicated support', included: true },
      { text: 'Enterprise deployment', included: true },
      { text: 'Custom analytics', included: true },
      { text: 'White-label options', included: true },
      { text: 'Advanced API access', included: true },
      { text: 'Team collaboration (20 users)', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom contracts', included: true },
      { text: 'Priority queue', included: true },
    ],
    popular: false,
    cta: 'Get Started',
    ctaAction: 'checkout',
    stripePriceId: 'price_agency_monthly' // Replace with your actual Stripe Price ID
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 5000,
    icon: Shield,
    color: 'from-emerald-500 to-teal-500',
    description: 'For large organizations',
    features: [
      { text: 'Everything in Agency', included: true },
      { text: 'Unlimited everything', included: true },
      { text: 'On-premise deployment', included: true },
      { text: 'Custom blockchain support', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Custom development', included: true },
      { text: 'Training & onboarding', included: true },
      { text: 'Compliance packages', included: true },
      { text: 'Audit coordination', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Dedicated infrastructure', included: true },
    ],
    popular: false,
    cta: 'Contact Sales',
    ctaAction: 'contact',
    stripePriceId: null
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8);
  };

  const handleCheckout = async (tier: typeof subscriptionTiers[0]) => {
    if (tier.ctaAction === 'contact') {
      window.location.href = '/contact?tier=enterprise';
      return;
    }

    setLoadingTier(tier.id);
    try {
      const price = billingCycle === 'monthly' ? tier.price : getAnnualPrice(tier.price);

      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier.id,
          tierName: tier.name,
          price: price,
          billing: billingCycle,
          stripePriceId: tier.stripePriceId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Error starting checkout');
    } finally {
      setLoadingTier(null);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
        </div>
        <div className="border-b border-white/10">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="h-8 bg-slate-800 rounded animate-pulse mb-4"></div>
            <div className="h-6 bg-slate-800 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur rounded-full p-1.5 border border-white/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {subscriptionTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div key={tier.id} className="relative">
                {/* Card */}
                <div
                  className={`h-full rounded-2xl p-6 backdrop-blur transition-all duration-300 hover:scale-105 ${
                    tier.popular
                      ? 'bg-gradient-to-b from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50 shadow-xl shadow-purple-500/20'
                      : 'bg-slate-800/50 border border-white/10'
                  }`}
                >
                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Tier Header */}
                  <div className="text-center mb-6 pt-2">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tier.color} mb-4 shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold mb-1">{tier.name}</h2>
                    <p className="text-slate-400 text-sm">{tier.description}</p>

                    {/* Price */}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          ${billingCycle === 'monthly' ? tier.price : getAnnualPrice(tier.price)}
                        </span>
                        <span className="text-slate-400">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </div>
                      {billingCycle === 'annual' && (
                        <p className="text-green-400 text-sm mt-1 font-medium">
                          Save ${tier.price * 12 - getAnnualPrice(tier.price)}/year
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full mb-6 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/50'
                        : tier.ctaAction === 'contact'
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-slate-700/50 hover:bg-slate-700 text-white border border-white/10'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={() => handleCheckout(tier)}
                    disabled={loadingTier === tier.id}
                  >
                    {loadingTier === tier.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Processing...
                      </span>
                    ) : (
                      tier.cta
                    )}
                  </button>

                  {/* Features List */}
                  <div className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${
                          feature.included ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, American Express) through Stripe, as well as SOL cryptocurrency payments for added flexibility.'
              },
              {
                q: 'Can I change my plan later?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we\'ll prorate any differences.'
              },
              {
                q: 'What\'s included in "dApp generations"?',
                a: 'Each generation includes a complete dApp with smart contracts, frontend components, deployment scripts, and documentation. You own the full source code.'
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 14-day money-back guarantee for all subscription plans. If you\'re not satisfied, contact us for a full refund.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
                <h3 className="text-lg font-semibold mb-2 text-white">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-white/10 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="container mx-auto px-4 py-16 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Ready to start building?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of developers building the future of decentralized applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => window.location.href = '/factory'}
            >
              Start Building Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = '/contact'}
            >
              Talk to Sales
            </Button>
          </div>
          <p className="text-muted-foreground text-sm mt-6">
            No credit card required for trial - 14-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}