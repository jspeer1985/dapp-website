import { ProjectConfig, TierLimits, Feature } from './types';

const TIER_MATRIX: Record<string, TierLimits> = {
  starter: {
    maxPages: 3,
    maxFeatures: 2,
    maxApiRoutes: 5,
    customDomain: false,
    advancedFeatures: []
  },
  professional: {
    maxPages: 6,
    maxFeatures: 5,
    maxApiRoutes: 12,
    customDomain: true,
    advancedFeatures: ['staking', 'governance', 'lp']
  },
  enterprise: {
    maxPages: Infinity,
    maxFeatures: Infinity,
    maxApiRoutes: Infinity,
    customDomain: true,
    advancedFeatures: ['staking', 'governance', 'lp', 'nft-mint', 'dao', 'swap']
  }
};

export class ConfigValidator {
  static validate(config: ProjectConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const tierLimits = TIER_MATRIX[config.project.tier];

    if (!tierLimits) {
      errors.push(`Invalid tier: ${config.project.tier}`);
      return { valid: false, errors };
    }

    // Validate tier limits
    if (config.dapp.features.length > tierLimits.maxFeatures) {
      errors.push(
        `${config.project.tier} tier allows max ${tierLimits.maxFeatures} features. You selected ${config.dapp.features.length}` 
      );
    }

    // Validate features are available in tier
    const invalidFeatures = config.dapp.features.filter(
      (f: Feature) => 
        !tierLimits.advancedFeatures.includes(f) && 
        config.project.tier !== 'enterprise'
    );
    
    if (invalidFeatures.length > 0) {
      errors.push(
        `These features require ${config.project.tier === 'starter' ? 'Professional' : 'Enterprise'} tier: ${invalidFeatures.join(', ')}` 
      );
    }

    // Validate required fields
    if (!config.project.name || config.project.name.trim().length === 0) {
      errors.push('Project name is required');
    }

    if (config.project.name.length > 50) {
      errors.push('Project name must be less than 50 characters');
    }

    if (config.token.enabled) {
      if (!config.token.symbol.match(/^[A-Z]{2,10}$/)) {
        errors.push('Token symbol must be 2-10 uppercase letters');
      }
      
      if (config.token.supply <= 0) {
        errors.push('Token supply must be greater than 0');
      }
      
      if (config.token.decimals < 0 || config.token.decimals > 18) {
        errors.push('Token decimals must be between 0 and 18');
      }
    }

    if (!config.dapp.brandColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.push('Brand color must be a valid hex color (e.g., #6366f1)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static getTierLimits(tier: string): TierLimits | null {
    return TIER_MATRIX[tier] || null;
  }
}
