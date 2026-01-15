import type { Tier } from './pricing';

export type Feature = 
  | 'staking'
  | 'governance' 
  | 'liquidity-pools'
  | 'nft-minting'
  | 'dao-treasury'
  | 'advanced-swap'
  | 'analytics'
  | 'monitoring';

export interface FeatureConfig {
  enabled: boolean;
  tier: Tier;
  description: string;
  upgradeUrl?: string;
  implementation?: 'full' | 'scaffold' | 'stub';
}

// Map features to their minimum required tiers
export const FEATURE_TIER_MAP: Record<Feature, Tier> = {
  'staking': 'professional',
  'governance': 'professional', 
  'liquidity-pools': 'professional',
  'nft-minting': 'enterprise',
  'dao-treasury': 'enterprise',
  'advanced-swap': 'enterprise',
  'analytics': 'professional',
  'monitoring': 'enterprise',
};

// Feature descriptions for upgrade banners
export const FEATURE_DESCRIPTIONS: Record<Feature, string> = {
  'staking': 'Stake tokens and earn rewards with flexible APY settings',
  'governance': 'Create and vote on proposals with token-weighted voting',
  'liquidity-pools': 'Create and manage liquidity pools with fee sharing',
  'nft-minting': 'Mint and manage NFT collections with custom metadata',
  'dao-treasury': 'Manage community funds with multi-signature controls',
  'advanced-swap': 'Advanced token swapping with slippage protection',
  'analytics': 'Track user behavior and protocol metrics',
  'monitoring': 'Real-time alerts and system health monitoring',
};

// Get feature configuration for a specific tier
export function getFeatureConfig(feature: Feature, currentTier: Tier): FeatureConfig {
  const requiredTier = FEATURE_TIER_MAP[feature];
  const tierOrder: Record<Tier, number> = {
    starter: 1,
    professional: 2,
    enterprise: 3,
  };
  
  const currentLevel = tierOrder[currentTier];
  const requiredLevel = tierOrder[requiredTier];
  
  const isEnabled = currentLevel >= requiredLevel;
  
  // Determine implementation type based on tier
  let implementation: 'full' | 'scaffold' | 'stub' = 'stub';
  if (isEnabled) {
    if (currentTier === 'enterprise') {
      implementation = 'full';
    } else if (currentTier === 'professional') {
      implementation = 'scaffold';
    }
  }
  
  return {
    enabled: isEnabled,
    tier: requiredTier,
    description: FEATURE_DESCRIPTIONS[feature],
    upgradeUrl: `/upgrade?feature=${feature}&tier=${requiredTier}`,
    implementation,
  };
}

// Get all features for a tier
export function getTierFeatures(currentTier: Tier): Record<Feature, FeatureConfig> {
  const features: Feature[] = [
    'staking',
    'governance', 
    'liquidity-pools',
    'nft-minting',
    'dao-treasury',
    'advanced-swap',
    'analytics',
    'monitoring',
  ];
  
  return features.reduce((acc, feature) => {
    acc[feature] = getFeatureConfig(feature, currentTier);
    return acc;
  }, {} as Record<Feature, FeatureConfig>);
}

// Check if a feature is available in the current tier
export function isFeatureEnabled(feature: Feature, currentTier: Tier): boolean {
  return getFeatureConfig(feature, currentTier).enabled;
}

// Get features that need upgrade banners for a tier
export function getUpgradeFeatures(currentTier: Tier): Feature[] {
  const features = getTierFeatures(currentTier);
  return Object.entries(features)
    .filter(([_, config]) => !config.enabled)
    .map(([feature, _]) => feature as Feature);
}
