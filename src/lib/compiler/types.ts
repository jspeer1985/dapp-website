export type Feature = 'staking' | 'governance' | 'lp' | 'nft-mint' | 'dao' | 'swap';
export type Tier = 'starter' | 'professional' | 'enterprise';
export type Chain = 'solana' | 'ethereum';
export type Database = 'postgres' | 'mongodb';

export interface ProjectConfig {
  project: {
    name: string;
    type: string;
    tier: Tier;
  };
  token: {
    enabled: boolean;
    name: string;
    symbol: string;
    decimals: number;
    supply: number;
    nft: boolean;
  };
  dapp: {
    pages: string[];
    features: Feature[];
    brandColor: string;
  };
  infra: {
    chain: Chain;
    db: Database;
    auth: string;
    hosting: string;
  };
}

export interface TierLimits {
  maxPages: number;
  maxFeatures: number;
  maxApiRoutes: number;
  customDomain: boolean;
  advancedFeatures: Feature[];
}

export interface FeatureTemplate {
  pages: string[];
  apiRoutes: string[];
  components: string[];
  dbModels: string[];
}

export interface CompilationResult {
  success: boolean;
  errors?: string[];
  zipBlob?: Blob;
  fileCount?: number;
}
