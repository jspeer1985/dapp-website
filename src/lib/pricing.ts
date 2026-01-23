export type Tier = 'starter' | 'professional' | 'enterprise';
export type ProductType = 'token-only' | 'dapp-only' | 'token-and-dapp';

export interface TierInfo {
  name: string;
  priceUSD: number;
  target: string;
  features: string[];
  popular: boolean;
  generatedElements: string;
  numberOfDesigns: string;
  technicalFeatures: string[];
  securityLevel: string;
}

// Token-only pricing - TESTING PRICES (0.001 SOL for all tiers)
export function getTokenPrice(tier: Tier): { sol: number; usd: number } {
  const prices = {
    starter: {
      sol: 0.001, // ~$0.01
      usd: 0.01,
    },
    professional: {
      sol: 0.001, // ~$0.01
      usd: 0.01,
    },
    enterprise: {
      sol: 0.001, // ~$0.01
      usd: 0.01,
    },
  };

  return prices[tier];
}

// dApp-only pricing - TESTING PRICES (0.001 SOL for all tiers)
export function getDAppPrice(tier: Tier): { sol: number; usd: number } {
  const prices = {
    starter: {
      sol: 0.001, // ~$0.01
      usd: 0.01,
    },
    professional: {
      sol: 0.001, // ~$0.01
      usd: 0.01,
    },
    enterprise: {
      sol: 0.001, // ~$0.01
      usd: 0.01,
    },
  };

  return prices[tier];
}

// Bundle pricing (token + dApp) - TESTING PRICES (0.001 SOL for all tiers)
export function getBundlePrice(tokenTier: Tier, dappTier: Tier): { sol: number; usd: number } {
  const prices = {
    starter: 0.01,
    professional: 0.01,
    enterprise: 0.01,
  };

  const tier = dappTier === 'enterprise' || tokenTier === 'enterprise' ? 'enterprise' :
    dappTier === 'professional' || tokenTier === 'professional' ? 'professional' : 'starter';

  return {
    sol: 0.001, // 0.001 SOL for all tiers
    usd: prices[tier],
  };
}

// Legacy function for backward compatibility
export function getTierPrice(tier: Tier): { sol: number; usd: number } {
  return getDAppPrice(tier); // Default to dApp pricing
}

export function getTierInfo(tier: Tier): TierInfo {
  const price = getDAppPrice(tier); // Use dApp pricing as default

  const tiers: Record<Tier, TierInfo> = {
    starter: {
      name: 'Development Starter',
      priceUSD: price.usd,
      target: 'For early builders and experiments',
      generatedElements: 'Project scaffold + Wallet integration',
      numberOfDesigns: 'Complete project structure',
      technicalFeatures: [
        'Fundamental scaffold templates',
        'Wallet integration patterns',
        'API route examples',
        'Project file structure',
      ],
      securityLevel: 'Basic code patterns',
      features: [
        'Project scaffold templates',
        'Wallet integration examples',
      ],
      popular: false,
    },
    professional: {
      name: 'Professional Stack',
      priceUSD: price.usd,
      target: 'For serious development teams',
      generatedElements: 'Advanced scaffold + Backend architecture',
      numberOfDesigns: 'Complete development stack',
      technicalFeatures: [
        'Professional scaffold templates',
        'Backend architecture patterns',
        'Database schema examples',
        'Admin dashboard templates',
      ],
      securityLevel: 'Enhanced code patterns',
      features: [
        'Advanced scaffold templates',
        'Backend architecture examples',
      ],
      popular: true,
    },
    enterprise: {
      name: 'Enterprise Foundation',
      priceUSD: price.usd,
      target: 'For production-scale projects',
      generatedElements: 'Multi-app architecture + Full contract templates',
      numberOfDesigns: 'Complete enterprise stack',
      technicalFeatures: [
        'Multi-app architecture templates',
        'Full contract suite examples',
        'Modular backend service patterns',
        'Infrastructure configuration templates',
      ],
      securityLevel: 'Enterprise-grade patterns',
      features: [
        'Multi-app architecture templates',
        'Full contract suite examples',
      ],
      popular: false,
    },
  };

  return tiers[tier];
}

export function getAllTiers(): TierInfo[] {
  return [
    getTierInfo('starter'),
    getTierInfo('professional'),
    getTierInfo('enterprise'),
  ];
}

