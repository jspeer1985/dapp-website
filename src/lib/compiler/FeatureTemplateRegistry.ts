import { Feature, FeatureTemplate } from './types';

export class FeatureTemplateRegistry {
  private static templates: Record<Feature, FeatureTemplate> = {
    staking: {
      pages: ['staking'],
      apiRoutes: ['stake', 'unstake', 'rewards'],
      components: ['StakingPool', 'StakingStats', 'RewardsCalculator'],
      dbModels: ['Stake', 'Reward']
    },
    governance: {
      pages: ['governance'],
      apiRoutes: ['proposals', 'vote', 'delegate'],
      components: ['ProposalCard', 'VotingInterface', 'DelegateModal'],
      dbModels: ['Proposal', 'Vote']
    },
    lp: {
      pages: ['liquidity'],
      apiRoutes: ['add-liquidity', 'remove-liquidity', 'pool-stats'],
      components: ['LiquidityPool', 'PoolStats', 'AddLiquidityForm'],
      dbModels: ['Pool', 'LiquidityPosition']
    },
    'nft-mint': {
      pages: ['mint'],
      apiRoutes: ['mint-nft', 'collection', 'metadata'],
      components: ['MintInterface', 'NFTPreview', 'CollectionGallery'],
      dbModels: ['NFT', 'Collection']
    },
    dao: {
      pages: ['dao'],
      apiRoutes: ['treasury', 'members', 'execute-proposal'],
      components: ['TreasuryDashboard', 'MemberList', 'ProposalExecutor'],
      dbModels: ['Treasury', 'Member', 'Transaction']
    },
    swap: {
      pages: ['swap'],
      apiRoutes: ['swap', 'quote', 'swap-history'],
      components: ['SwapInterface', 'PriceChart', 'SwapHistory'],
      dbModels: ['Swap', 'Price']
    }
  };

  static getTemplate(feature: Feature): FeatureTemplate {
    return this.templates[feature];
  }

  static getRequiredFiles(features: Feature[]): {
    pages: string[];
    apiRoutes: string[];
    components: string[];
    dbModels: string[];
  } {
    const result = {
      pages: [] as string[],
      apiRoutes: [] as string[],
      components: [] as string[],
      dbModels: [] as string[]
    };

    features.forEach(feature => {
      const template = this.getTemplate(feature);
      if (template) {
        result.pages.push(...template.pages);
        result.apiRoutes.push(...template.apiRoutes);
        result.components.push(...template.components);
        result.dbModels.push(...template.dbModels);
      }
    });

    return result;
  }

  static getAllFeatures(): Feature[] {
    return Object.keys(this.templates) as Feature[];
  }
}
