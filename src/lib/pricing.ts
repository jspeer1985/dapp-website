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

// Token-only pricing
export function getTokenPrice(tier: Tier): { sol: number; usd: number } {
  const prices = {
    starter: {
      sol: Number(process.env.NEXT_PUBLIC_TOKEN_STARTER_PRICE_SOL) || 1.5,
      usd: Number(process.env.NEXT_PUBLIC_TOKEN_STARTER_PRICE_USD) || 249,
    },
    professional: {
      sol: Number(process.env.NEXT_PUBLIC_TOKEN_PROFESSIONAL_PRICE_SOL) || 4.5,
      usd: Number(process.env.NEXT_PUBLIC_TOKEN_PROFESSIONAL_PRICE_USD) || 699,
    },
    enterprise: {
      sol: Number(process.env.NEXT_PUBLIC_TOKEN_ENTERPRISE_PRICE_SOL) || 12.5,
      usd: Number(process.env.NEXT_PUBLIC_TOKEN_ENTERPRISE_PRICE_USD) || 1899,
    },
  };

  return prices[tier];
}

// dApp-only pricing
export function getDAppPrice(tier: Tier): { sol: number; usd: number } {
  const prices = {
    starter: {
      sol: Number(process.env.NEXT_PUBLIC_DAPP_STARTER_PRICE_SOL) || 4.5,
      usd: Number(process.env.NEXT_PUBLIC_DAPP_STARTER_PRICE_USD) || 699,
    },
    professional: {
      sol: Number(process.env.NEXT_PUBLIC_DAPP_PROFESSIONAL_PRICE_SOL) || 12.5,
      usd: Number(process.env.NEXT_PUBLIC_DAPP_PROFESSIONAL_PRICE_USD) || 1899,
    },
    enterprise: {
      sol: Number(process.env.NEXT_PUBLIC_DAPP_ENTERPRISE_PRICE_SOL) || 35.0,
      usd: Number(process.env.NEXT_PUBLIC_DAPP_ENTERPRISE_PRICE_USD) || 4999,
    },
  };

  return prices[tier];
}

// Bundle pricing (token + dApp)
export function getBundlePrice(tokenTier: Tier, dappTier: Tier): { sol: number; usd: number } {
  const prices = {
    starter: Number(process.env.NEXT_PUBLIC_BUNDLE_STARTER_PRICE_USD) || 849,
    professional: Number(process.env.NEXT_PUBLIC_BUNDLE_PROFESSIONAL_PRICE_USD) || 2399,
    enterprise: Number(process.env.NEXT_PUBLIC_BUNDLE_ENTERPRISE_PRICE_USD) || 6299,
  };

  const tier = dappTier === 'enterprise' || tokenTier === 'enterprise' ? 'enterprise' :
    dappTier === 'professional' || tokenTier === 'professional' ? 'professional' : 'starter';

  return {
    sol: 0,
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

