'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Download, 
  Eye, 
  ShoppingCart, 
  Check, 
  ExternalLink,
  Code,
  Zap,
  Shield,
  TrendingUp,
  Globe,
  Users,
  Rocket
} from 'lucide-react';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  features: string[];
  preview: {
    image: string;
    code: string;
    demo: string;
  };
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  popularity: number;
  downloads: number;
  rating: number;
  tags: string[];
  isPurchased?: boolean;
}

const templates: Template[] = [
  // DeFi Templates (10 total)
  {
    id: 'defi-yield-farm',
    name: 'DeFi Yield Farm',
    category: 'DeFi',
    price: 299,
    description: 'Multi-pool yield farming protocol with auto-compounding, governance tokens, and analytics.',
    features: [
      'Auto-compounding',
      'Multi-pool Support',
      'Governance Token',
      'Analytics Dashboard'
    ],
    preview: {
      image: '/templates/defi-yield-preview.png',
      code: `// Yield Farming Contract
import { Program, web3 } from '@project-serum/anchor';

export class YieldFarm {
  static async stake(ctx: web3.Context, amount: number) {
    // Staking logic with auto-compounding
  }
}`,
      demo: 'https://demo.defi-yield-farm.com'
    },
    difficulty: 'Advanced',
    popularity: 95,
    downloads: 1247,
    rating: 4.9,
    tags: ['DeFi', 'Yield', 'Staking', 'Governance']
  },
  {
    id: 'defi-dex-exchange',
    name: 'DEX Exchange',
    category: 'DeFi',
    price: 349,
    description: 'Decentralized exchange with limit orders, order book, and advanced trading features.',
    features: [
      'Limit Orders',
      'Order Book',
      'Advanced Trading',
      'Liquidity Pools'
    ],
    preview: {
      image: '/templates/dex-exchange-preview.png',
      code: `// DEX Exchange Contract
export class DEX {
  static async swap(ctx: web3.Context, tokenA: string, tokenB: string, amount: number) {
    // Advanced swap logic with limit orders
  }
}`,
      demo: 'https://demo.dex-exchange.com'
    },
    difficulty: 'Advanced',
    popularity: 88,
    downloads: 678,
    rating: 4.7,
    tags: ['DeFi', 'DEX', 'Trading', 'AMM']
  },
  {
    id: 'defi-staking-pools',
    name: 'Staking Pools Platform',
    category: 'DeFi',
    price: 279,
    description: 'Multi-token staking platform with flexible rewards, lock periods, and governance.',
    features: [
      'Multi-token Staking',
      'Flexible Rewards',
      'Lock Periods',
      'Governance Integration'
    ],
    preview: {
      image: '/templates/staking-pools-preview.png',
      code: `// Staking Pools Contract
export class StakingPool {
  static async stake(ctx: web3.Context, amount: number, lockPeriod: number) {
    // Flexible staking with rewards
  }
}`,
      demo: 'https://demo.staking-pools.com'
    },
    difficulty: 'Intermediate',
    popularity: 79,
    downloads: 534,
    rating: 4.6,
    tags: ['DeFi', 'Staking', 'Rewards', 'Yield']
  },
  {
    id: 'defi-lending-protocol',
    name: 'Lending Protocol',
    category: 'DeFi',
    price: 389,
    description: 'Decentralized lending protocol with collateralized loans and interest rates.',
    features: [
      'Collateralized Loans',
      'Interest Rates',
      'Risk Management',
      'Liquidation Protection'
    ],
    preview: {
      image: '/templates/lending-protocol-preview.png',
      code: `// Lending Protocol Contract
export class LendingProtocol {
  static async borrow(ctx: web3.Context, collateral: number, amount: number) {
    // Lending and borrowing logic
  }
}`,
      demo: 'https://demo.lending-protocol.com'
    },
    difficulty: 'Advanced',
    popularity: 81,
    downloads: 567,
    rating: 4.7,
    tags: ['DeFi', 'Lending', 'Borrowing', 'Collateral']
  },
  {
    id: 'defi-cross-chain-bridge',
    name: 'Cross-Chain Bridge',
    category: 'DeFi',
    price: 449,
    description: 'Cross-chain bridge protocol with multi-asset support and security features.',
    features: [
      'Multi-asset Support',
      'Security Features',
      'Cross-chain Transfers',
      'Validator Network'
    ],
    preview: {
      image: '/templates/bridge-preview.png',
      code: `// Cross-Chain Bridge Contract
export class CrossChainBridge {
  static async bridge(ctx: web3.Context, asset: string, targetChain: string) {
    // Secure cross-chain bridging
  }
}`,
      demo: 'https://demo.cross-chain-bridge.com'
    },
    difficulty: 'Advanced',
    popularity: 73,
    downloads: 389,
    rating: 4.8,
    tags: ['DeFi', 'Bridge', 'Cross-chain', 'Security']
  },
  {
    id: 'defi-liquidity-mining',
    name: 'Liquidity Mining Platform',
    category: 'DeFi',
    price: 329,
    description: 'Advanced liquidity mining with dynamic rewards, pool creation, and yield optimization.',
    features: [
      'Dynamic Rewards',
      'Pool Creation',
      'Yield Optimization',
      'Liquidity Analytics'
    ],
    preview: {
      image: '/templates/liquidity-mining-preview.png',
      code: `// Liquidity Mining Contract
export class LiquidityMining {
  static async calculateRewards(ctx: web3.Context, amount: number, duration: number) {
    // Dynamic reward calculation
  }
}`,
      demo: 'https://demo.liquidity-mining.com'
    },
    difficulty: 'Advanced',
    popularity: 84,
    downloads: 723,
    rating: 4.7,
    tags: ['DeFi', 'Mining', 'Rewards', 'Yield']
  },
  {
    id: 'defi-yield-aggregator',
    name: 'Yield Aggregator',
    category: 'DeFi',
    price: 419,
    description: 'Multi-protocol yield aggregator that automatically finds and allocates to best yields.',
    features: [
      'Auto-compounding',
      'Multi-protocol',
      'Risk Assessment',
      'Portfolio Management'
    ],
    preview: {
      image: '/templates/yield-aggregator-preview.png',
      code: `// Yield Aggregator Contract
export class YieldAggregator {
  static async findBestYield(ctx: web3.Context, amount: number, riskLevel: string) {
    // Automatic yield optimization
  }
}`,
      demo: 'https://demo.yield-aggregator.com'
    },
    difficulty: 'Advanced',
    popularity: 92,
    downloads: 891,
    rating: 4.8,
    tags: ['DeFi', 'Yield', 'Aggregator', 'Auto-compound']
  },
  {
    id: 'defi-options-protocol',
    name: 'DeFi Options Protocol',
    category: 'DeFi',
    price: 529,
    description: 'Decentralized options trading with European/American options, Greeks calculator, and liquidity pools.',
    features: [
      'Options Trading',
      'Greeks Calculator',
      'Liquidity Pools',
      'Risk Management'
    ],
    preview: {
      image: '/templates/options-protocol-preview.png',
      code: `// Options Trading Contract
export class OptionsProtocol {
  static async calculatePremium(ctx: web3.Context, strikePrice: number, currentPrice: number) {
    // Black-Scholes options pricing
  }
}`,
      demo: 'https://demo.options-protocol.com'
    },
    difficulty: 'Advanced',
    popularity: 67,
    downloads: 445,
    rating: 4.6,
    tags: ['DeFi', 'Options', 'Trading', 'Greeks']
  },
  {
    id: 'defi-synthetic-assets',
    name: 'Synthetic Assets Platform',
    category: 'DeFi',
    price: 459,
    description: 'Create and trade synthetic assets with price feeds, collateralization, and minting/burning.',
    features: [
      'Synthetic Assets',
      'Price Feeds',
      'Collateralization',
      'Mint/Burn'
    ],
    preview: {
      image: '/templates/synthetic-assets-preview.png',
      code: `// Synthetic Assets Contract
export class SyntheticAssets {
  static async mintSynthetic(ctx: web3.Context, collateral: number, targetPrice: number) {
    // Synthetic asset minting
  }
}`,
      demo: 'https://demo.synthetic-assets.com'
    },
    difficulty: 'Advanced',
    popularity: 58,
    downloads: 334,
    rating: 4.5,
    tags: ['DeFi', 'Synthetic', 'Assets', 'Collateral']
  },
  {
    id: 'defi-flash-loans',
    name: 'Flash Loans Protocol',
    category: 'DeFi',
    price: 379,
    description: 'Arbitrage flash loans with instant execution, collateral-free borrowing, and fee optimization.',
    features: [
      'Flash Loans',
      'Arbitrage',
      'Instant Execution',
      'Fee Optimization'
    ],
    preview: {
      image: '/templates/flash-loans-preview.png',
      code: `// Flash Loans Contract
export class FlashLoans {
  static async executeFlashLoan(ctx: web3.Context, amount: number, arbitrageOpportunity: any) {
    // Instant arbitrage execution
  }
}`,
      demo: 'https://demo.flash-loans.com'
    },
    difficulty: 'Advanced',
    popularity: 73,
    downloads: 512,
    rating: 4.7,
    tags: ['DeFi', 'Flash Loans', 'Arbitrage', 'Trading']
  },
  // NFT Templates (5 total)
  {
    id: 'nft-marketplace',
    name: 'NFT Marketplace',
    category: 'NFT',
    price: 199,
    description: 'Complete NFT marketplace with auctions, instant buy, royalties, and collection launchpad.',
    features: [
      'Auctions & Instant Buy',
      'Creator Royalties',
      'Collection Launchpad',
      'Advanced Search'
    ],
    preview: {
      image: '/templates/nft-marketplace-preview.png',
      code: `// NFT Marketplace Contract
export class NFTMarketplace {
  static async createListing(ctx: web3.Context, nftContract: string, tokenId: number, price: number) {
    // NFT listing creation
  }
}`,
      demo: 'https://demo.nft-marketplace.com'
    },
    difficulty: 'Intermediate',
    popularity: 89,
    downloads: 892,
    rating: 4.7,
    tags: ['NFT', 'Marketplace', 'Auction', 'Royalties']
  },
  {
    id: 'nft-auction-house',
    name: 'NFT Auction House',
    category: 'NFT',
    price: 249,
    description: 'Advanced auction platform with bidding wars, reserve prices, and timed auctions.',
    features: [
      'Bidding Wars',
      'Reserve Prices',
      'Timed Auctions',
      'Advanced Analytics'
    ],
    preview: {
      image: '/templates/nft-auction-house-preview.png',
      code: `// NFT Auction House Contract
export class AuctionHouse {
  static async createAuction(ctx: web3.Context, nftContract: string, tokenId: number, reservePrice: number) {
    // Advanced auction creation
  }
}`,
      demo: 'https://demo.nft-auction-house.com'
    },
    difficulty: 'Intermediate',
    popularity: 67,
    downloads: 543,
    rating: 4.6,
    tags: ['NFT', 'Auction', 'Bidding', 'Analytics']
  },
  {
    id: 'nft-staking-platform',
    name: 'NFT Staking Platform',
    category: 'NFT',
    price: 179,
    description: 'Stake your NFTs to earn rewards, governance tokens, and exclusive benefits.',
    features: [
      'NFT Staking',
      'Reward Distribution',
      'Governance Access',
      'Exclusive Benefits'
    ],
    preview: {
      image: '/templates/nft-staking-platform-preview.png',
      code: `// NFT Staking Contract
export class NFTStaking {
  static async stakeNFT(ctx: web3.Context, nftContract: string, tokenId: number) {
    // NFT staking with rewards
  }
}`,
      demo: 'https://demo.nft-staking-platform.com'
    },
    difficulty: 'Intermediate',
    popularity: 45,
    downloads: 312,
    rating: 4.5,
    tags: ['NFT', 'Staking', 'Rewards', 'Governance']
  },
  {
    id: 'nft-gaming-assets',
    name: 'NFT Gaming Assets',
    category: 'NFT',
    price: 229,
    description: 'Gaming NFT platform with in-game assets, character skins, and virtual items.',
    features: [
      'In-game Assets',
      'Character Skins',
      'Virtual Items',
      'Game Integration'
    ],
    preview: {
      image: '/templates/nft-gaming-assets-preview.png',
      code: `// Gaming NFT Contract
export class GamingAssets {
  static async mintGameAsset(ctx: web3.Context, assetType: string, rarity: number) {
    // Gaming asset minting
  }
}`,
      demo: 'https://demo.nft-gaming-assets.com'
    },
    difficulty: 'Intermediate',
    popularity: 82,
    downloads: 678,
    rating: 4.7,
    tags: ['NFT', 'Gaming', 'Assets', 'Skins']
  },
  {
    id: 'nft-music-platform',
    name: 'NFT Music Platform',
    category: 'NFT',
    price: 199,
    description: 'Music NFT marketplace for artists to sell songs, albums, and exclusive content.',
    features: [
      'Music NFTs',
      'Artist Royalties',
      'Exclusive Content',
      'Fan Engagement'
    ],
    preview: {
      image: '/templates/nft-music-platform-preview.png',
      code: `// Music NFT Contract
export class MusicNFT {
  static async mintMusicNFT(ctx: web3.Context, artist: string, songTitle: string, audioUrl: string) {
    // Music NFT minting
  }
}`,
      demo: 'https://demo.nft-music-platform.com'
    },
    difficulty: 'Intermediate',
    popularity: 38,
    downloads: 234,
    rating: 4.4,
    tags: ['NFT', 'Music', 'Artists', 'Royalties']
  },

  // DAO Templates (5 total)
  {
    id: 'dao-governance-suite',
    name: 'DAO Governance Suite',
    category: 'DAO',
    price: 399,
    description: 'Comprehensive DAO governance with voting, treasury management, proposal system, and delegation.',
    features: [
      'On-chain Voting',
      'Treasury Management',
      'Proposal System',
      'Delegation'
    ],
    preview: {
      image: '/templates/dao-governance-preview.png',
      code: `// DAO Governance Contract
export class DAOGovernance {
  static async createProposal(ctx: web3.Context, title: string, description: string, votingPeriod: number) {
    // DAO proposal creation
  }
}`,
      demo: 'https://demo.dao-governance.com'
    },
    difficulty: 'Advanced',
    popularity: 94,
    downloads: 723,
    rating: 4.8,
    tags: ['DAO', 'Governance', 'Voting', 'Treasury']
  },
  {
    id: 'dao-treasury-manager',
    name: 'DAO Treasury Manager',
    category: 'DAO',
    price: 349,
    description: 'Advanced treasury management with multi-sig, budget allocation, and financial reporting.',
    features: [
      'Multi-sig Wallet',
      'Budget Allocation',
      'Financial Reporting',
      'Fund Management'
    ],
    preview: {
      image: '/templates/dao-treasury-preview.png',
      code: `// DAO Treasury Contract
export class DAOTreasury {
  static async allocateFunds(ctx: web3.Context, amount: number, recipient: string, purpose: string) {
    // Treasury fund allocation
  }
}`,
      demo: 'https://demo.dao-treasury.com'
    },
    difficulty: 'Advanced',
    popularity: 78,
    downloads: 567,
    rating: 4.6,
    tags: ['DAO', 'Treasury', 'Multi-sig', 'Budget']
  },
  {
    id: 'dao-voting-portal',
    name: 'DAO Voting Portal',
    category: 'DAO',
    price: 279,
    description: 'Advanced voting portal with quadratic voting, delegation, and proposal tracking.',
    features: [
      'Quadratic Voting',
      'Delegation System',
      'Proposal Tracking',
      'Vote Analytics'
    ],
    preview: {
      image: '/templates/dao-voting-preview.png',
      code: `// DAO Voting Contract
export class DAOVoting {
  static async castQuadraticVote(ctx: web3.Context, proposalId: string, voteWeight: number, direction: boolean) {
    // Quadratic voting implementation
  }
}`,
      demo: 'https://demo.dao-voting.com'
    },
    difficulty: 'Intermediate',
    popularity: 62,
    downloads: 412,
    rating: 4.5,
    tags: ['DAO', 'Voting', 'Quadratic', 'Delegation']
  },
  {
    id: 'dao-reputation-system',
    name: 'DAO Reputation System',
    category: 'DAO',
    price: 319,
    description: 'Reputation-based governance with contribution tracking, levels, and reward distribution.',
    features: [
      'Contribution Tracking',
      'Reputation Levels',
      'Reward Distribution',
      'Governance Rights'
    ],
    preview: {
      image: '/templates/dao-reputation-preview.png',
      code: `// DAO Reputation Contract
export class DAOReputation {
  static async recordContribution(ctx: web3.Context, contributor: string, contributionType: string, impact: number) {
    // Reputation tracking
  }
}`,
      demo: 'https://demo.dao-reputation.com'
    },
    difficulty: 'Intermediate',
    popularity: 56,
    downloads: 345,
    rating: 4.4,
    tags: ['DAO', 'Reputation', 'Contributions', 'Rewards']
  },
  {
    id: 'dao-community-fund',
    name: 'DAO Community Fund',
    category: 'DAO',
    price: 299,
    description: 'Community-driven fund management with grant proposals, voting, and milestone tracking.',
    features: [
      'Grant Proposals',
      'Community Voting',
      'Milestone Tracking',
      'Fund Distribution'
    ],
    preview: {
      image: '/templates/dao-community-fund-preview.png',
      code: `// DAO Community Fund Contract
export class CommunityFund {
  static async submitGrantProposal(ctx: web3.Context, title: string, description: string, requestedAmount: number) {
    // Grant proposal submission
  }
}`,
      demo: 'https://demo.dao-community-fund.com'
    },
    difficulty: 'Intermediate',
    popularity: 71,
    downloads: 489,
    rating: 4.6,
    tags: ['DAO', 'Community', 'Grants', 'Funding']
  },

  // Gaming Templates (5 total)
  {
    id: 'gaming-p2e-arena',
    name: 'P2E Battle Arena',
    category: 'Gaming',
    price: 429,
    description: 'Play-to-earn battle arena with NFT characters, skill-based combat, and tournament system.',
    features: [
      'NFT Characters',
      'Battle System',
      'Tournaments',
      'Play-to-Earn'
    ],
    preview: {
      image: '/templates/gaming-p2e-arena-preview.png',
      code: `// P2E Battle Contract
export class BattleArena {
  static async executeBattle(ctx: web3.Context, attacker: string, defender: string, battleType: string) {
    // Battle execution with rewards
  }
}`,
      demo: 'https://demo.gaming-p2e-arena.com'
    },
    difficulty: 'Advanced',
    popularity: 103,
    downloads: 892,
    rating: 4.7,
    tags: ['Gaming', 'P2E', 'Battle', 'Tournaments']
  },
  {
    id: 'gaming-virtual-world',
    name: 'Virtual World Metaverse',
    category: 'Gaming',
    price: 549,
    description: 'Decentralized virtual world with land ownership, avatar customization, and social features.',
    features: [
      'Virtual Land',
      'Avatar System',
      'Social Features',
      'Economy'
    ],
    preview: {
      image: '/templates/gaming-virtual-world-preview.png',
      code: `// Virtual World Contract
export class VirtualWorld {
  static async purchaseLand(ctx: web3.Context, landId: number, coordinates: { x: number, y: number }) {
    // Virtual land purchase
  }
}`,
      demo: 'https://demo.gaming-virtual-world.com'
    },
    difficulty: 'Advanced',
    popularity: 127,
    downloads: 1234,
    rating: 4.8,
    tags: ['Gaming', 'Metaverse', 'Virtual Land', 'Social']
  },
  {
    id: 'gaming-fantasy-sports',
    name: 'Fantasy Sports League',
    category: 'Gaming',
    price: 379,
    description: 'Blockchain-based fantasy sports with real-world data integration, prize pools, and NFT rewards.',
    features: [
      'Fantasy Teams',
      'Real Data',
      'Prize Pools',
      'NFT Rewards'
    ],
    preview: {
      image: '/templates/gaming-fantasy-sports-preview.png',
      code: `// Fantasy Sports Contract
export class FantasySports {
  static async createFantasyTeam(ctx: web3.Context, teamName: string, players: string[], leagueId: number) {
    // Fantasy team creation
  }
}`,
      demo: 'https://demo.gaming-fantasy-sports.com'
    },
    difficulty: 'Intermediate',
    popularity: 89,
    downloads: 678,
    rating: 4.6,
    tags: ['Gaming', 'Fantasy Sports', 'Real Data', 'NFT']
  },
  {
    id: 'gaming-card-game',
    name: 'Blockchain Card Game',
    category: 'Gaming',
    price: 329,
    description: 'Collectible card game with NFT cards, deck building, ranked matches, and tournaments.',
    features: [
      'NFT Cards',
      'Deck Building',
      'Ranked Matches',
      'Tournaments'
    ],
    preview: {
      image: '/templates/gaming-card-game-preview.png',
      code: `// Card Game Contract
export class CardGame {
  static async playCard(ctx: web3.Context, cardId: number, target: string, gameSession: string) {
    // Card game mechanics
  }
}`,
      demo: 'https://demo.gaming-card-game.com'
    },
    difficulty: 'Intermediate',
    popularity: 76,
    downloads: 534,
    rating: 4.5,
    tags: ['Gaming', 'Card Game', 'NFT', 'Tournaments']
  },
  {
    id: 'gaming-racing-game',
    name: 'Web3 Racing Game',
    category: 'Gaming',
    price: 389,
    description: 'Racing game with NFT cars, track ownership, betting system, and championship tournaments.',
    features: [
      'NFT Cars',
      'Track Ownership',
      'Betting System',
      'Championships'
    ],
    preview: {
      image: '/templates/gaming-racing-game-preview.png',
      code: `// Racing Game Contract
export class RacingGame {
  static async executeRace(ctx: web3.Context, participants: string[], trackId: number, betAmount: number) {
    // Race execution with betting
  }
}`,
      demo: 'https://demo.gaming-racing-game.com'
    },
    difficulty: 'Intermediate',
    popularity: 68,
    downloads: 445,
    rating: 4.4,
    tags: ['Gaming', 'Racing', 'NFT Cars', 'Betting']
  },

  // Token Templates (5 total)
  {
    id: 'token-launchpad-pro',
    name: 'Token Launchpad Pro',
    category: 'Token',
    price: 499,
    description: 'Professional token launch platform with presale, vesting, liquidity locks, and marketing tools.',
    features: [
      'Token Presale',
      'Vesting System',
      'Liquidity Locks',
      'Marketing Tools'
    ],
    preview: {
      image: '/templates/token-launchpad-pro-preview.png',
      code: `// Token Launchpad Contract
export class TokenLaunchpad {
  static async createToken(ctx: web3.Context, tokenName: string, tokenSymbol: string, totalSupply: number) {
    // Professional token creation
  }
}`,
      demo: 'https://demo.token-launchpad-pro.com'
    },
    difficulty: 'Advanced',
    popularity: 142,
    downloads: 1123,
    rating: 4.8,
    tags: ['Token', 'Launchpad', 'Presale', 'Vesting']
  },
  {
    id: 'token-staking-platform',
    name: 'Token Staking Platform',
    category: 'Token',
    price: 359,
    description: 'Flexible staking platform with multiple pools, reward mechanisms, and governance integration.',
    features: [
      'Multiple Pools',
      'Reward Mechanisms',
      'Governance Integration',
      'APY Tracking'
    ],
    preview: {
      image: '/templates/token-staking-platform-preview.png',
      code: `// Token Staking Contract
export class TokenStaking {
  static async stakeTokens(ctx: web3.Context, amount: number, poolId: number, lockPeriod: number) {
    // Flexible token staking
  }
}`,
      demo: 'https://demo.token-staking-platform.com'
    },
    difficulty: 'Intermediate',
    popularity: 94,
    downloads: 734,
    rating: 4.6,
    tags: ['Token', 'Staking', 'Rewards', 'Governance']
  },
  {
    id: 'token-governance-system',
    name: 'Token Governance System',
    category: 'Token',
    price: 419,
    description: 'Comprehensive governance system with voting power, proposal creation, and treasury management.',
    features: [
      'Voting Power',
      'Proposal Creation',
      'Treasury Management',
      'Delegation'
    ],
    preview: {
      image: '/templates/token-governance-preview.png',
      code: `// Token Governance Contract
export class TokenGovernance {
  static async createProposal(ctx: web3.Context, title: string, description: string, votingPower: number) {
    // Token-based governance
  }
}`,
      demo: 'https://demo.token-governance.com'
    },
    difficulty: 'Advanced',
    popularity: 108,
    downloads: 867,
    rating: 4.7,
    tags: ['Token', 'Governance', 'Voting', 'Treasury']
  },
  {
    id: 'token-bridge-protocol',
    name: 'Token Bridge Protocol',
    category: 'Token',
    price: 529,
    description: 'Cross-chain token bridge with wrapped assets, liquidity pools, and security features.',
    features: [
      'Cross-chain Bridge',
      'Wrapped Assets',
      'Liquidity Pools',
      'Security Features'
    ],
    preview: {
      image: '/templates/token-bridge-protocol-preview.png',
      code: `// Token Bridge Contract
export class TokenBridge {
  static async bridgeToken(ctx: web3.Context, tokenAmount: number, targetChain: string, recipient: string) {
    // Cross-chain token bridging
  }
}`,
      demo: 'https://demo.token-bridge-protocol.com'
    },
    difficulty: 'Advanced',
    popularity: 87,
    downloads: 623,
    rating: 4.8,
    tags: ['Token', 'Bridge', 'Cross-chain', 'Security']
  },
  {
    id: 'token-farming-protocol',
    name: 'Token Farming Protocol',
    category: 'Token',
    price: 389,
    description: 'Advanced farming protocol with yield optimization, auto-compounding, and reward multipliers.',
    features: [
      'Yield Optimization',
      'Auto-compounding',
      'Reward Multipliers',
      'Pool Management'
    ],
    preview: {
      image: '/templates/token-farming-protocol-preview.png',
      code: `// Token Farming Contract
export class TokenFarming {
  static async farmTokens(ctx: web3.Context, tokenAmount: number, poolId: number, compoundFrequency: number) {
    // Advanced token farming
  }
}`,
      demo: 'https://demo.token-farming-protocol.com'
    },
    difficulty: 'Intermediate',
    popularity: 73,
    downloads: 512,
    rating: 4.5,
    tags: ['Token', 'Farming', 'Yield', 'Auto-compound']
  }
];

const categories = ['All', 'DeFi', 'NFT', 'DAO', 'Token', 'Gaming'];

export default function TemplateMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [purchasedTemplates, setPurchasedTemplates] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'All' || template.category === selectedCategory
  );

  const handlePurchase = async (template: Template) => {
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          templateName: template.name,
          price: template.price,
        }),
      });

      const session = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DeFi': return <TrendingUp className="h-4 w-4" />;
      case 'NFT': return <Globe className="h-4 w-4" />;
      case 'DAO': return <Users className="h-4 w-4" />;
      case 'Token': return <Zap className="h-4 w-4" />;
      case 'Gaming': return <Rocket className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4 text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Template Marketplace
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional dApp templates with instant deployment and comprehensive documentation
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="mb-12">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-white shadow-lg">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    {category}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Template Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group h-full border-2 border-transparent hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        {getCategoryIcon(template.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm">{template.category}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{template.description}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span>{template.downloads}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>{template.popularity}%</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    <ul className="space-y-1">
                      {template.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price and Actions */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold">${template.price}</span>
                        <span className="text-sm text-muted-foreground ml-2">one-time</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link href={`/templates/preview/${template.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePurchase(template)}
                        className="flex-1"
                        disabled={purchasedTemplates.includes(template.id)}
                      >
                        {purchasedTemplates.includes(template.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Purchased
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Buy Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Preview Modal */}
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedTemplate.name}</h3>
                    <p className="text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPreview(false)}
                  >
                    ×
                  </Button>
                </div>

                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-6">
                    <div className="space-y-4">
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Code className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                          <p className="text-lg font-semibold">Template Preview</p>
                          <p className="text-sm text-muted-foreground">
                            Interactive demo available at: {selectedTemplate.preview.demo}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="mt-6">
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        <code>{selectedTemplate.preview.code}</code>
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="mt-6">
                    <div className="grid gap-4">
                      {selectedTemplate.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                  <div className="text-2xl font-bold">${selectedTemplate.price}</div>
                  <Button
                    onClick={() => handlePurchase(selectedTemplate)}
                    disabled={purchasedTemplates.includes(selectedTemplate.id)}
                  >
                    {purchasedTemplates.includes(selectedTemplate.id) ? 'Purchased' : 'Purchase Template'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
