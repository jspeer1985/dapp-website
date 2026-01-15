export type Tier = 'starter' | 'professional' | 'enterprise';
export type ProductType = 'token-only' | 'dapp-only' | 'token-and-dapp';

export interface TierInfo {
  name: string;
  priceSOL: number;
  priceUSD: number;
  target: string;
  features: string[];
  popular: boolean;
  generatedElements: string;
  numberOfDesigns: string;
  technicalFeatures: string[];
  securityLevel: string;
}

// Token-only pricing (lower since it's just a smart contract)
export function getTokenPrice(tier: Tier): { sol: number; usd: number } {
  const prices = {
    starter: {
      sol: parseFloat(process.env.NEXT_PUBLIC_TOKEN_STARTER_PRICE_SOL || '0.2'),
      usd: parseInt(process.env.NEXT_PUBLIC_TOKEN_STARTER_PRICE_USD || '49'),
    },
    professional: {
      sol: parseFloat(process.env.NEXT_PUBLIC_TOKEN_PROFESSIONAL_PRICE_SOL || '0.5'),
      usd: parseInt(process.env.NEXT_PUBLIC_TOKEN_PROFESSIONAL_PRICE_USD || '149'),
    },
    enterprise: {
      sol: parseFloat(process.env.NEXT_PUBLIC_TOKEN_ENTERPRISE_PRICE_SOL || '1.5'),
      usd: parseInt(process.env.NEXT_PUBLIC_TOKEN_ENTERPRISE_PRICE_USD || '499'),
    },
  };

  return prices[tier];
}

// dApp-only pricing (higher since it's a full application)
export function getDAppPrice(tier: Tier): { sol: number; usd: number } {
  const prices = {
    starter: {
      sol: parseFloat(process.env.NEXT_PUBLIC_DAPP_STARTER_PRICE_SOL || '0.6'),
      usd: parseInt(process.env.NEXT_PUBLIC_DAPP_STARTER_PRICE_USD || '149'),
    },
    professional: {
      sol: parseFloat(process.env.NEXT_PUBLIC_DAPP_PROFESSIONAL_PRICE_SOL || '1.5'),
      usd: parseInt(process.env.NEXT_PUBLIC_DAPP_PROFESSIONAL_PRICE_USD || '399'),
    },
    enterprise: {
      sol: parseFloat(process.env.NEXT_PUBLIC_DAPP_ENTERPRISE_PRICE_SOL || '4.0'),
      usd: parseInt(process.env.NEXT_PUBLIC_DAPP_ENTERPRISE_PRICE_USD || '999'),
    },
  };

  return prices[tier];
}

// Bundle pricing (token + dApp with discount)
export function getBundlePrice(tokenTier: Tier, dappTier: Tier): { sol: number; usd: number } {
  const tokenPrice = getTokenPrice(tokenTier);
  const dappPrice = getDAppPrice(dappTier);
  
  // Apply bundle discount (20% off when buying both)
  const combinedPrice = tokenPrice.usd + dappPrice.usd;
  const discountedPrice = Math.round(combinedPrice * 0.8); // 20% bundle discount
  
  return {
    sol: (tokenPrice.sol + dappPrice.sol) * 0.8,
    usd: discountedPrice,
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
      name: 'Starter Scaffold',
      priceSOL: price.sol,
      priceUSD: price.usd,
      target: 'For early builders and experiments',
      generatedElements: 'Token OR dApp scaffold',
      numberOfDesigns: 'Complete project structure',
      technicalFeatures: [
        'Token contract OR dApp scaffold',
        'Wallet integration',
        'API routes',
        'Project file structure',
        'Setup documentation',
      ],
      securityLevel: 'Development patterns',
      features: [
        'Token OR dApp scaffold',
        'Wallet integration',
        'API routes',
        'Project file structure',
        'Setup documentation',
        'Best for: prototypes, hackathons, MVPs',
      ],
      popular: false,
    },
    professional: {
      name: 'Professional Scaffold',
      priceSOL: price.sol,
      priceUSD: price.usd,
      target: 'For serious development teams',
      generatedElements: 'Token + dApp scaffold',
      numberOfDesigns: 'Complete development stack',
      technicalFeatures: [
        'Token + dApp scaffold',
        'Backend architecture',
        'Database schema templates',
        'Admin dashboard shell',
        'Deployment scripts',
      ],
      securityLevel: 'Enhanced patterns',
      features: [
        'Token + dApp scaffold',
        'Backend architecture',
        'Database schema templates',
        'Admin dashboard shell',
        'Deployment scripts',
        'Best for: funded startups, internal builds',
      ],
      popular: true,
    },
    enterprise: {
      name: 'Enterprise Scaffold',
      priceSOL: price.sol,
      priceUSD: price.usd,
      target: 'For production-scale projects',
      generatedElements: 'Multi-app architecture',
      numberOfDesigns: 'Complete enterprise stack',
      technicalFeatures: [
        'Multi-app architecture',
        'Full contract suite templates',
        'Modular backend services',
        'CI/CD scripts',
        'Infrastructure configuration',
        'Documentation pack',
      ],
      securityLevel: 'Enterprise patterns',
      features: [
        'Multi-app architecture',
        'Full contract suite templates',
        'Modular backend services',
        'CI/CD scripts',
        'Infrastructure configuration',
        'Documentation pack',
        'Best for: agencies, venture-backed teams, platform builders',
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
