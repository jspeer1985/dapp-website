export interface BaseGenerationFormProps {
  onComplete: (generationId: string, paymentAmount: number) => void;
  selectedTier?: string | null;
}

export interface FormData {
  // Customer Information
  customerName: string;
  customerEmail: string;
  telegramHandle: string;

  // Project Basics
  projectName: string;
  projectDescription: string;
  projectType: 'dapp' | 'token' | 'both';
  tier: 'starter' | 'professional' | 'enterprise';

  // Token Configuration (for token or both)
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenTotalSupply: string;
  tokenLogoUrl: string;

  // NFT Configuration (optional)
  isNFT: boolean;
  nftCollectionName: string;
  nftRoyaltyPercentage: number;
  nftDescription: string;

  // dApp Configuration (for dapp or both)
  dappFeatures: string[];
  primaryColor: string;
  targetAudience: string;

  // Social & Metadata
  websiteUrl: string;
  twitterHandle: string;
  discordUrl: string;
  telegramUrl: string;

  // Advanced Options
  customRequirements: string;

  // Tier-specific fields
  whiteLabelConfig?: WhiteLabelConfig;
  apiAccessLevel?: 'basic' | 'advanced' | 'enterprise';
  deploymentTargets?: string[];
  integrationLevel?: 'basic' | 'advanced' | 'full';
  complianceLevel?: 'basic' | 'standard' | 'enterprise';
  supportLevel?: 'community' | 'priority' | 'dedicated';
}

export interface WhiteLabelConfig {
  customDomain: string;
  branding: {
    logo: string;
    colors: {
      primary: string;
      secondary: string;
    };
    customCSS: string;
  };
  features: {
    customAuth: boolean;
    customUI: boolean;
    customBackend: boolean;
  };
}

export interface TierFeatureConfig {
  maxProjects: number;
  apiRateLimit: number;
  features: string[];
  deploymentOptions: string[];
  supportOptions: string[];
  integrations: string[];
}
