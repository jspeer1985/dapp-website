'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Shield, Zap, CheckCircle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const templateData: Record<string, any> = {
    // DeFi Templates (5 total)
    'defi-yield-farm': {
        title: 'DeFi Yield Farm',
        description: 'Multi-pool yield farming protocol with auto-compounding, governance tokens, and analytics.',
        category: 'DeFi',
        price: '$299',
        rating: 4.9,
        reviews: 156,
        audited: true,
        features: ['Auto-compounding', 'Multi-pool Support', 'Governance Token', 'Analytics Dashboard'],
        image: '🌾',
        codePreview: {
            'Smart Contract': `// Yield Farming Contract
import { Program, web3 } from '@project-serum/anchor';

export class YieldFarm {
  static async stake(
    ctx: web3.Context,
    poolId: number,
    amount: number
  ) {
    const pool = await this.getPool(ctx, poolId);
    await pool.deposit(ctx.accounts.user, amount);
    
    const rewards = await this.calculateRewards(ctx, poolId, amount);
    return rewards;
  }
}`,
            'Frontend Component': `// Farming Interface
import { useConnection } from '@solana/wallet-adapter-react';

export default function YieldFarm() {
  const handleStake = async (poolId, amount) => {
    const tx = await createStakeTransaction(poolId, amount);
    await sendTransaction(tx);
  };

  return <div className="yield-farm">{/* Staking UI */}</div>;
}`
        }
    },
    'defi-dex-exchange': {
        title: 'DEX Exchange',
        description: 'Decentralized exchange with limit orders, order book, and advanced trading features.',
        category: 'DeFi',
        price: '$349',
        rating: 4.7,
        reviews: 78,
        audited: true,
        features: ['Limit Orders', 'Order Book', 'Advanced Trading', 'Liquidity Pools'],
        image: '💱',
        codePreview: {
            'Smart Contract': `// DEX Exchange Contract
export class DEXExchange {
  static async createLimitOrder(
    ctx: web3.Context,
    tokenA: string,
    tokenB: string,
    amount: number,
    price: number
  ) {
    const order = await this.placeOrder(ctx, tokenA, tokenB, amount, price, 'limit');
    return order;
  }
}`,
            'Frontend Component': `// DEX Trading Interface
import { useConnection } from '@solana/wallet-adapter-react';

export default function DEXExchange() {
  const handleTrade = async (tokenA, tokenB, amount, price) => {
    const tx = await createTradeTransaction(tokenA, tokenB, amount, price);
    await sendTransaction(tx);
  };

  return <div className="dex-exchange">{/* Trading UI */}</div>;
}`
        }
    },
    'defi-staking-pools': {
        title: 'Staking Pools Platform',
        description: 'Multi-token staking platform with flexible rewards, lock periods, and governance.',
        category: 'DeFi',
        price: '$279',
        rating: 4.6,
        reviews: 61,
        audited: true,
        features: ['Multi-token Staking', 'Flexible Rewards', 'Lock Periods', 'Governance Integration'],
        image: '🏊',
        codePreview: {
            'Smart Contract': `// Staking Pools Contract
export class StakingPools {
  static async createPool(
    ctx: web3.Context,
    rewardToken: string,
    apr: number,
    lockPeriod: number
  ) {
    const pool = await this.initializePool(ctx, rewardToken, apr, lockPeriod);
    return pool;
  }
}`,
            'Frontend Component': `// Staking Interface
import { useWallet } from '@solana/wallet-adapter-react';

export default function StakingPools() {
  const handleStake = async (poolId, amount) => {
    const tx = await createStakeTransaction(poolId, amount);
    await sendTransaction(tx);
  };

  return <div className="staking-pools">{/* Staking UI */}</div>;
}`
        }
    },
    'defi-lending-protocol': {
        title: 'Lending Protocol',
        description: 'Decentralized lending protocol with collateralized loans and interest rates.',
        category: 'DeFi',
        price: '$389',
        rating: 4.7,
        reviews: 73,
        audited: true,
        features: ['Collateralized Loans', 'Interest Rates', 'Liquidation Protection', 'Risk Management'],
        image: '💸',
        codePreview: {
            'Smart Contract': `// Lending Protocol Contract
export class LendingProtocol {
  static async depositCollateral(
    ctx: web3.Context,
    token: string,
    amount: number
  ) {
    const deposit = await this.lockCollateral(ctx, token, amount);
    return deposit;
  }
}`,
            'Frontend Component': `// Lending Interface
import { useConnection } from '@solana/wallet-adapter-react';

export default function LendingProtocol() {
  const handleBorrow = async (collateral, borrowAmount) => {
    const tx = await createBorrowTransaction(collateral, borrowAmount);
    await sendTransaction(tx);
  };

  return <div className="lending-protocol">{/* Lending UI */}</div>;
}`
        }
    },
    'defi-cross-chain-bridge': {
        title: 'Cross-Chain Bridge',
        description: 'Cross-chain bridge protocol with multi-asset support and security features.',
        category: 'DeFi',
        price: '$449',
        rating: 4.8,
        reviews: 54,
        audited: true,
        features: ['Multi-Asset Bridge', 'Security Features', 'Cross-Chain Transfers', 'Validator Network'],
        image: '🌉',
        codePreview: {
            'Smart Contract': `// Cross-Chain Bridge Contract
export class CrossChainBridge {
  static async initiateTransfer(
    ctx: web3.Context,
    targetChain: string,
    token: string,
    amount: number,
    recipient: string
  ) {
    const transfer = await this.lockTokens(ctx, token, amount, targetChain, recipient);
    return transfer;
  }
}`,
            'Frontend Component': `// Bridge Interface
import { useConnection } from '@solana/wallet-adapter-react';

export default function CrossChainBridge() {
  const handleBridge = async (targetChain, token, amount, recipient) => {
    const tx = await createBridgeTransaction(targetChain, token, amount, recipient);
    await sendTransaction(tx);
  };

  return <div className="cross-chain-bridge">{/* Bridge UI */}</div>;
}`
        }
    },

    // NFT Templates (5 total)
    'nft-marketplace': {
        title: 'NFT Marketplace',
        description: 'Complete NFT marketplace with auctions, instant buy, royalties, and collection launchpad.',
        category: 'NFT',
        price: '$199',
        rating: 4.7,
        reviews: 89,
        audited: true,
        features: ['Auctions & Fixed Price', 'Creator Royalties', 'Collection Launchpad', 'Activity Feed'],
        image: '🖼️',
        codePreview: {
            'Smart Contract': `// NFT Marketplace Contract
import { MetadataProgram } from '@metaplex-foundation/mpl-token-metadata';

export class NFTMarketplace {
  static async listNFT(
    ctx: web3.Context,
    nftMint: string,
    price: number
  ) {
    const listing = await this.createListing(ctx, nftMint, price);
    return listing;
  }
}`,
            'Frontend Component': `// NFT Gallery Component
import { useWallet } from '@solana/wallet-adapter-react';

export default function NFTGallery() {
  const handlePurchase = async (listingId) => {
    const tx = await createPurchaseTransaction(listingId);
    await sendTransaction(tx);
  };

  return <div className="nft-gallery">{/* NFT Gallery UI */}</div>;
}`
        }
    },
    'nft-auction-house': {
        title: 'NFT Auction House',
        description: 'Advanced auction platform with bidding wars, reserve prices, and timed auctions.',
        category: 'NFT',
        price: '$249',
        rating: 4.6,
        reviews: 67,
        audited: true,
        features: ['Timed Auctions', 'Reserve Prices', 'Bidding Wars', 'Auction History'],
        image: '🏛️',
        codePreview: {
            'Smart Contract': `// NFT Auction Contract
export class NFTAuctionHouse {
  static async createAuction(
    ctx: web3.Context,
    nftMint: string,
    reservePrice: number,
    duration: number
  ) {
    const auction = await this.initializeAuction(ctx, nftMint, reservePrice, duration);
    return auction;
  }
}`,
            'Frontend Component': `// Auction Interface
import { useWallet } from '@solana/wallet-adapter-react';

export default function NFTAuctionHouse() {
  const handleBid = async (auctionId, amount) => {
    const tx = await createBidTransaction(auctionId, amount);
    await sendTransaction(tx);
  };

  return <div className="nft-auction">{/* Auction UI */}</div>;
}`
        }
    },
    'nft-staking-platform': {
        title: 'NFT Staking Platform',
        description: 'Stake your NFTs to earn rewards, governance tokens, and exclusive benefits.',
        category: 'NFT',
        price: '$179',
        rating: 4.5,
        reviews: 45,
        audited: true,
        features: ['NFT Staking', 'Reward Distribution', 'Governance Access', 'Exclusive Benefits'],
        image: '🎯',
        codePreview: {
            'Smart Contract': `// NFT Staking Contract
export class NFTStaking {
  static async stakeNFT(
    ctx: web3.Context,
    nftMint: string,
    duration: number
  ) {
    const stake = await this.lockNFT(ctx, nftMint, duration);
    return stake;
  }
}`,
            'Frontend Component': `// NFT Staking Interface
import { useWallet } from '@solana/wallet-adapter-react';

export default function NFTStakingPlatform() {
  const handleStake = async (nftMint, duration) => {
    const tx = await createStakeTransaction(nftMint, duration);
    await sendTransaction(tx);
  };

  return <div className="nft-staking">{/* Staking UI */}</div>;
}`
        }
    },
    'nft-gaming-assets': {
        title: 'NFT Gaming Assets',
        description: 'Gaming NFT platform with in-game assets, character skins, and virtual items.',
        category: 'NFT',
        price: '$229',
        rating: 4.7,
        reviews: 82,
        audited: true,
        features: ['In-Game Assets', 'Character Skins', 'Virtual Items', 'Game Integration'],
        image: '🎮',
        codePreview: {
            'Smart Contract': `// Gaming NFT Contract
export class GamingNFT {
  static async mintGameAsset(
    ctx: web3.Context,
    assetType: string,
    rarity: string,
    metadata: any
  ) {
    const asset = await this.createGameAsset(ctx, assetType, rarity, metadata);
    return asset;
  }
}`,
            'Frontend Component': `// Gaming NFT Interface
import { useWallet } from '@solana/wallet-adapter-react';

export default function GamingNFTAssets() {
  const handleMint = async (assetType, rarity, metadata) => {
    const tx = await createMintTransaction(assetType, rarity, metadata);
    await sendTransaction(tx);
  };

  return <div className="gaming-nft">{/* Gaming NFT UI */}</div>;
}`
        }
    },
    'nft-music-platform': {
        title: 'NFT Music Platform',
        description: 'Music NFT marketplace for artists to sell songs, albums, and exclusive content.',
        category: 'NFT',
        price: '$199',
        rating: 4.4,
        reviews: 38,
        audited: true,
        features: ['Music NFTs', 'Artist Royalties', 'Exclusive Content', 'Fan Engagement'],
        image: '🎵',
        codePreview: {
            'Smart Contract': `// Music NFT Contract
export class MusicNFT {
  static async mintMusicNFT(
    ctx: web3.Context,
    artist: string,
    songTitle: string,
    audioUrl: string
  ) {
    const musicNFT = await this.createMusicNFT(ctx, artist, songTitle, audioUrl);
    return musicNFT;
  }
}`,
            'Frontend Component': `// Music NFT Interface
import { useWallet } from '@solana/wallet-adapter-react';

export default function MusicNFTPlatform() {
  const handleMint = async (artist, songTitle, audioUrl) => {
    const tx = await createMusicMintTransaction(artist, songTitle, audioUrl);
    await sendTransaction(tx);
  };

  return <div className="music-nft">{/* Music NFT UI */}</div>;
}`
        }
    },
    'uniswap-v3-clone': {
        title: 'DeFi Swap Protocol',
        description: 'Full-featured AMM DEX with concentrated liquidity, farming, and router. Includes React frontend.',
        category: 'DeFi',
        price: '$499',
        rating: 4.9,
        reviews: 124,
        audited: true,
        features: ['Concentrated Liquidity', 'Yield Farming', 'Analytics Dashboard', 'Smart Router'],
        image: '🌊',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['AMM', 'Liquidity Pool', 'Farming Contract', 'Router'],
            frontend: ['React Components', 'Web3 Integration', 'Responsive Design'],
            features: ['Swap Interface', 'Liquidity Management', 'Yield Farming', 'Analytics Dashboard']
        },
        codePreview: {
            'Smart Contract': `// AMM Swap Contract Example
import { Program, web3 } from '@project-serum/anchor';

export class SwapProgram {
  static async swap(
    ctx: web3.Context,
    amountIn: number,
    minimumAmountOut: number
  ) {
    // Concentrated liquidity swap logic
    const result = await this.performSwap(
      ctx.accounts.pool,
      amountIn,
      minimumAmountOut
    );
    
    return result;
  }
}`,
            'Frontend Component': `// Swap Interface Component
import { useConnection } from '@solana/wallet-adapter-react';

export default function SwapInterface() {
  const { connection } = useConnection();
  
  const handleSwap = async (tokenA, tokenB, amount) => {
    // Web3 swap implementation
    const tx = await createSwapTransaction(
      tokenA, 
      tokenB, 
      amount
    );
    
    await sendTransaction(tx);
  };

  return (
    <div className="swap-interface">
      {/* Swap UI components */}
    </div>
  );
}`
        }
    },
    'nft-marketplace-pro': {
        title: 'NFT Marketplace Pro',
        description: 'Complete marketplace with auctions, instant buy, royalties, and collection launchpad.',
        category: 'NFT',
        price: '$399',
        rating: 4.7,
        reviews: 89,
        audited: true,
        features: ['Auctions & Fixed Price', 'Creator Royalties', 'Collection Launchpad', 'Activity Feed'],
        image: '🖼️',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Metaplex',
            smartContracts: ['NFT Standard', 'Auction Contract', 'Royalty System'],
            frontend: ['Gallery View', 'Bidding Interface', 'Collection Management'],
            features: ['NFT Gallery', 'Auction System', 'Royalty Distribution', 'Launchpad']
        },
        codePreview: {
            'Smart Contract': `// NFT Minting Contract
import { MetadataProgram } from '@metaplex-foundation/mpl-token-metadata';

export class NFTProgram {
  static async mintNFT(
    ctx: web3.Context,
    metadata: Metadata
  ) {
    const nft = await MetadataProgram.createMetadata(
      ctx,
      metadata
    );
    
    return nft;
  }
}`,
            'Frontend Component': `// NFT Gallery Component
import { useWallet } from '@solana/wallet-adapter-react';

export default function NFTGallery() {
  const { publicKey } = useWallet();
  
  const handleMint = async (metadata) => {
    const tx = await createMintTransaction(metadata);
    await sendTransaction(tx);
  };

  return (
    <div className="nft-gallery">
      {/* NFT display and minting UI */}
    </div>
  );
}`
        }
    },
    'dao-governance': {
        title: 'DAO Governance Suite',
        description: 'On-chain voting system with treasury management, proposal lifecycle, and forum integration.',
        category: 'DAO',
        price: '$299',
        rating: 4.8,
        reviews: 56,
        audited: true,
        features: ['Quadratic Voting', 'Treasury Multisig', 'Proposal Dashboard', 'Token Gating'],
        image: '⚖️',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Solana Program Library',
            smartContracts: ['Governance Token', 'Voting System', 'Treasury Management'],
            frontend: ['Proposal Dashboard', 'Voting Interface', 'Forum Integration'],
            features: ['On-chain Voting', 'Treasury Management', 'Proposal System', 'Forum']
        },
        codePreview: {
            'Smart Contract': `// Governance Voting Contract
export class GovernanceProgram {
  static async vote(
    ctx: web3.Context,
    proposalId: number,
    vote: boolean
  ) {
    const voterWeight = await calculateVotingWeight(
      ctx.accounts.voter
    );
    
    await this.castVote(
      ctx,
      proposalId,
      vote,
      voterWeight
    );
  }
}`,
            'Frontend Component': `// Proposal Dashboard Component
export default function ProposalDashboard() {
  const { publicKey } = useWallet();
  
  const handleVote = async (proposalId, vote) => {
    const tx = await createVoteTransaction(proposalId, vote);
    await sendTransaction(tx);
  };

  return (
    <div className="proposal-dashboard">
      {/* Proposal listing and voting UI */}
    </div>
  );
}`
        }
    },
    'p2e-staking': {
        title: 'GameFi Staking Hub',
        description: 'Staking system for gaming tokens with level-up mechanics, rewards multiplier, and leaderboards.',
        category: 'Gaming',
        price: '$349',
        rating: 4.6,
        reviews: 42,
        audited: false,
        features: ['Level-up System', 'Rewards Multiplier', 'Leaderboard', 'NFT Staking'],
        image: '🎮',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Gaming SDK',
            smartContracts: ['Staking Contract', 'Reward System', 'Level Management'],
            frontend: ['Game Dashboard', 'Staking Interface', 'Leaderboard'],
            features: ['Token Staking', 'Level System', 'Rewards Multiplier', 'Leaderboard']
        },
        codePreview: {
            'Smart Contract': `// Game Staking Contract
export class GameStakingProgram {
  static async stake(
    ctx: web3.Context,
    amount: number,
    gameLevel: number
  ) {
    const multiplier = this.calculateRewardMultiplier(gameLevel);
    const rewards = amount * multiplier;
    
    await this.updateStake(ctx, amount, rewards);
  }
}`,
            'Frontend Component': `// Game Dashboard Component
export default function GameDashboard() {
  const { publicKey } = useWallet();
  
  const handleStake = async (amount) => {
    const tx = await createStakeTransaction(amount);
    await sendTransaction(tx);
  };

  return (
    <div className="game-dashboard">
      {/* Game staking and rewards UI */}
    </div>
  );
}`
        }
    },

    // Additional DeFi Templates (5 more)
    'defi-liquidity-mining': {
        title: 'Liquidity Mining Platform',
        description: 'Advanced liquidity mining with dynamic rewards, pool creation, and yield optimization.',
        category: 'DeFi',
        price: '$329',
        rating: 4.7,
        reviews: 84,
        audited: true,
        features: ['Dynamic Rewards', 'Pool Creation', 'Yield Optimization', 'Liquidity Analytics'],
        image: '⛏️',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Mining Contract', 'Reward Calculator', 'Pool Manager'],
            frontend: ['Mining Dashboard', 'Pool Creator', 'Analytics Charts'],
            features: ['Liquidity Mining', 'Dynamic Rewards', 'Pool Management', 'Yield Tracking']
        },
        codePreview: {
            'Smart Contract': `// Liquidity Mining Contract
import { Program, web3 } from '@project-serum/anchor';

export class LiquidityMining {
  static async calculateRewards(
    ctx: web3.Context,
    liquidityAmount: number,
    poolDuration: number
  ) {
    const baseReward = liquidityAmount * 0.05;
    const timeBonus = poolDuration * 0.02;
    return baseReward + timeBonus;
  }
}`,
            'Frontend Component': `// Mining Dashboard
import { useConnection } from '@solana/wallet-adapter-react';

export default function LiquidityMining() {
  const { connection } = useConnection();
  
  const handleCreatePool = async (params) => {
    const pool = await createMiningPool(params);
    // Pool creation logic
  };
}`
        }
    },

    'defi-yield-aggregator': {
        title: 'Yield Aggregator',
        description: 'Multi-protocol yield aggregator that automatically finds and allocates to best yields.',
        category: 'DeFi',
        price: '$419',
        rating: 4.8,
        reviews: 92,
        audited: true,
        features: ['Auto-compounding', 'Multi-protocol', 'Risk Assessment', 'Portfolio Management'],
        image: '📊',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Aggregator Contract', 'Protocol Manager', 'Risk Calculator'],
            frontend: ['Aggregator Dashboard', 'Protocol Selector', 'Risk Analysis'],
            features: ['Yield Aggregation', 'Protocol Switching', 'Risk Management', 'Auto-rebalancing']
        },
        codePreview: {
            'Smart Contract': `// Yield Aggregator Contract
export class YieldAggregator {
  static async findBestYield(
    ctx: web3.Context,
    tokenAmount: number,
    riskLevel: string
  ) {
    const protocols = await this.getAvailableProtocols();
    const bestYield = this.compareYields(protocols, tokenAmount, riskLevel);
    
    return bestYield;
  }
}`,
            'Frontend Component': `// Aggregator Interface
export default function YieldAggregator() {
  const [protocols, setProtocols] = useState([]);
  
  const handleOptimize = async (amount, risk) => {
    const bestYield = await findOptimalYield(amount, risk);
    // Auto-allocate to best yield
  };
}`
        }
    },

    'defi-options-protocol': {
        title: 'DeFi Options Protocol',
        description: 'Decentralized options trading with European/American options, Greeks calculator, and liquidity pools.',
        category: 'DeFi',
        price: '$529',
        rating: 4.6,
        reviews: 67,
        audited: true,
        features: ['Options Trading', 'Greeks Calculator', 'Liquidity Pools', 'Risk Management'],
        image: '📈',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Options Contract', 'Greeks Calculator', 'Settlement Engine'],
            frontend: ['Options Dashboard', 'Trading Interface', 'Risk Analytics'],
            features: ['Options Trading', 'Premium Calculation', 'Settlement System', 'Liquidity Management']
        },
        codePreview: {
            'Smart Contract': `// Options Trading Contract
export class OptionsProtocol {
  static async calculatePremium(
    ctx: web3.Context,
    strikePrice: number,
    currentPrice: number,
    timeToExpiry: number,
    volatility: number
  ) {
    // Black-Scholes calculation
    const d1 = this.calculateD1(currentPrice, strikePrice, timeToExpiry, volatility);
    const premium = this.blackScholes(d1, timeToExpiry);
    
    return premium;
  }
}`,
            'Frontend Component': `// Options Trading Interface
export default function OptionsTrading() {
  const handleCreateOption = async (params) => {
    const premium = calculateOptionPremium(params);
    // Create option contract
  };

  return (
    <div className="options-trading">
      {/* Options trading UI */}
    </div>
  );
}`
        }
    },

    'defi-synthetic-assets': {
        title: 'Synthetic Assets Platform',
        description: 'Create and trade synthetic assets with price feeds, collateralization, and minting/burning.',
        category: 'DeFi',
        price: '$459',
        rating: 4.5,
        reviews: 58,
        audited: true,
        features: ['Synthetic Assets', 'Price Feeds', 'Collateralization', 'Mint/Burn'],
        image: '🎯',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Synthetic Contract', 'Oracle Feed', 'Collateral Manager'],
            frontend: ['Assets Dashboard', 'Minting Interface', 'Collateral Manager'],
            features: ['Asset Creation', 'Price Tracking', 'Collateral Management', 'Trading']
        },
        codePreview: {
            'Smart Contract': `// Synthetic Assets Contract
export class SyntheticAssets {
  static async mintSynthetic(
    ctx: web3.Context,
    collateralAmount: number,
    targetPrice: number,
    assetSymbol: string
  ) {
    const requiredCollateral = collateralAmount * 1.5; // 150% collateralization
    const syntheticAmount = collateralAmount / targetPrice;
    
    await this.mintToken(ctx.accounts.syntheticMint, syntheticAmount);
  }
}`,
            'Frontend Component': `// Synthetic Assets Interface
export default function SyntheticAssets() {
  const handleMintSynthetic = async (collateral, targetPrice) => {
    const syntheticAmount = await calculateSyntheticAmount(collateral, targetPrice);
    // Mint synthetic asset
  };

  return (
    <div className="synthetic-assets">
      {/* Synthetic assets UI */}
    </div>
  );
}`
        }
    },

    'defi-flash-loans': {
        title: 'Flash Loans Protocol',
        description: 'Arbitrage flash loans with instant execution, collateral-free borrowing, and fee optimization.',
        category: 'DeFi',
        price: '$379',
        rating: 4.7,
        reviews: 73,
        audited: true,
        features: ['Flash Loans', 'Arbitrage', 'Instant Execution', 'Fee Optimization'],
        image: '⚡',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Flash Loan Contract', 'Arbitrage Engine', 'Fee Calculator'],
            frontend: ['Loans Dashboard', 'Arbitrage Interface', 'Fee Analytics'],
            features: ['Flash Lending', 'Arbitrage Execution', 'Instant Settlement', 'Fee Management']
        },
        codePreview: {
            'Smart Contract': `// Flash Loans Contract
export class FlashLoans {
  static async executeFlashLoan(
    ctx: web3.Context,
    loanAmount: number,
    arbitrageOpportunity: any
  ) {
    // Execute arbitrage in single transaction
    const profit = await this.performArbitrage(loanAmount, arbitrageOpportunity);
    const fee = loanAmount * 0.0009; // 0.09% fee
    
    // Repay loan + fee
    await this.repayLoan(ctx.accounts.loanPool, loanAmount + fee);
    
    return profit - fee;
  }
}`,
            'Frontend Component': `// Flash Loans Interface
export default function FlashLoans() {
  const handleExecuteFlashLoan = async (amount, opportunity) => {
    const profit = await executeArbitrage(amount, opportunity);
    // Flash loan execution
  };

  return (
    <div className="flash-loans">
      {/* Flash loans UI */}
    </div>
  );
}`
        }
    },

    // DAO Templates (5 total)
    'dao-governance-suite': {
        title: 'DAO Governance Suite',
        description: 'Comprehensive DAO governance with voting, treasury management, proposal system, and delegation.',
        category: 'DAO',
        price: '$399',
        rating: 4.8,
        reviews: 94,
        audited: true,
        features: ['On-chain Voting', 'Treasury Management', 'Proposal System', 'Delegation'],
        image: '🏛️',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Governance Contract', 'Treasury Contract', 'Proposal Contract'],
            frontend: ['Governance Dashboard', 'Proposal Interface', 'Treasury Manager'],
            features: ['Voting System', 'Treasury Management', 'Proposal Creation', 'Token Delegation']
        },
        codePreview: {
            'Smart Contract': `// DAO Governance Contract
export class DAOGovernance {
  static async createProposal(
    ctx: web3.Context,
    title: string,
    description: string,
    votingPeriod: number
  ) {
    const proposalId = await this.generateProposalId();
    
    await this.initializeProposal(ctx.accounts.proposal, {
      id: proposalId,
      title,
      description,
      votingPeriod,
      createdAt: Date.now()
    });
  }
}`,
            'Frontend Component': `// DAO Governance Interface
export default function DAOGovernance() {
  const handleCreateProposal = async (proposalData) => {
    const proposal = await createDAOProposal(proposalData);
    // Proposal creation logic
  };

  return (
    <div className="dao-governance">
      {/* Governance UI */}
    </div>
  );
}`
        }
    },

    'dao-treasury-manager': {
        title: 'DAO Treasury Manager',
        description: 'Advanced treasury management with multi-sig, budget allocation, and financial reporting.',
        category: 'DAO',
        price: '$349',
        rating: 4.6,
        reviews: 78,
        audited: true,
        features: ['Multi-sig Wallet', 'Budget Allocation', 'Financial Reporting', 'Fund Management'],
        image: '💰',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Treasury Contract', 'Multi-sig Contract', 'Budget Contract'],
            frontend: ['Treasury Dashboard', 'Budget Manager', 'Financial Reports'],
            features: ['Multi-signature', 'Budget Planning', 'Fund Allocation', 'Reporting System']
        },
        codePreview: {
            'Smart Contract': `// DAO Treasury Contract
export class DAOTreasury {
  static async allocateFunds(
    ctx: web3.Context,
    amount: number,
    recipient: string,
    purpose: string,
    requiredSignatures: number
  ) {
    await this.createAllocation(ctx.accounts.allocation, {
      amount,
      recipient,
      purpose,
      requiredSignatures,
      createdAt: Date.now()
    });
  }
}`,
            'Frontend Component': `// Treasury Management Interface
export default function DAOTreasury() {
  const handleAllocateFunds = async (allocationData) => {
    const allocation = await createFundAllocation(allocationData);
    // Fund allocation logic
  };

  return (
    <div className="dao-treasury">
      {/* Treasury management UI */}
    </div>
  );
}`
        }
    },

    'dao-voting-portal': {
        title: 'DAO Voting Portal',
        description: 'Advanced voting portal with quadratic voting, delegation, and proposal tracking.',
        category: 'DAO',
        price: '$279',
        rating: 4.5,
        reviews: 62,
        audited: true,
        features: ['Quadratic Voting', 'Delegation System', 'Proposal Tracking', 'Vote Analytics'],
        image: '🗳️',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Voting Contract', 'Delegation Contract', 'Analytics Contract'],
            frontend: ['Voting Portal', 'Delegation Interface', 'Analytics Dashboard'],
            features: ['Quadratic Voting', 'Vote Delegation', 'Proposal Tracking', 'Analytics']
        },
        codePreview: {
            'Smart Contract': `// DAO Voting Contract
export class DAOVoting {
  static async castQuadraticVote(
    ctx: web3.Context,
    proposalId: string,
    voteWeight: number,
    voteDirection: boolean
  ) {
    const quadraticWeight = Math.sqrt(voteWeight);
    
    await this.recordVote(ctx.accounts.voting, {
      proposalId,
      voter: ctx.accounts.user.publicKey,
      weight: quadraticWeight,
      direction: voteDirection,
      timestamp: Date.now()
    });
  }
}`,
            'Frontend Component': `// Voting Portal Interface
export default function DAOVoting() {
  const handleCastVote = async (proposalId, voteWeight, direction) => {
    const quadraticWeight = Math.sqrt(voteWeight);
    // Cast quadratic vote
  };

  return (
    <div className="dao-voting">
      {/* Voting portal UI */}
    </div>
  );
}`
        }
    },

    'dao-reputation-system': {
        title: 'DAO Reputation System',
        description: 'Reputation-based governance with contribution tracking, levels, and reward distribution.',
        category: 'DAO',
        price: '$319',
        rating: 4.4,
        reviews: 56,
        audited: true,
        features: ['Contribution Tracking', 'Reputation Levels', 'Reward Distribution', 'Governance Rights'],
        image: '⭐',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Reputation Contract', 'Contribution Contract', 'Reward Contract'],
            frontend: ['Reputation Dashboard', 'Contribution Tracker', 'Reward Manager'],
            features: ['Reputation Scoring', 'Contribution Tracking', 'Level System', 'Reward Distribution']
        },
        codePreview: {
            'Smart Contract': `// DAO Reputation Contract
export class DAOReputation {
  static async recordContribution(
    ctx: web3.Context,
    contributor: string,
    contributionType: string,
    impact: number
  ) {
    const reputationPoints = this.calculateReputation(contributionType, impact);
    
    await this.updateReputation(ctx.accounts.reputation, {
      contributor,
      contributionType,
      impact,
      points: reputationPoints,
      timestamp: Date.now()
    });
  }
}`,
            'Frontend Component': `// Reputation System Interface
export default function DAOReputation() {
  const handleRecordContribution = async (contributionData) => {
    const reputation = await calculateReputation(contributionData);
    // Record contribution
  };

  return (
    <div className="dao-reputation">
      {/* Reputation system UI */}
    </div>
  );
}`
        }
    },

    'dao-community-fund': {
        title: 'DAO Community Fund',
        description: 'Community-driven fund management with grant proposals, voting, and milestone tracking.',
        category: 'DAO',
        price: '$299',
        rating: 4.6,
        reviews: 71,
        audited: true,
        features: ['Grant Proposals', 'Community Voting', 'Milestone Tracking', 'Fund Distribution'],
        image: '🤝',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Fund Contract', 'Grant Contract', 'Milestone Contract'],
            frontend: ['Fund Dashboard', 'Grant Portal', 'Milestone Tracker'],
            features: ['Grant Management', 'Community Voting', 'Milestone Tracking', 'Fund Distribution']
        },
        codePreview: {
            'Smart Contract': `// DAO Community Fund Contract
export class CommunityFund {
  static async submitGrantProposal(
    ctx: web3.Context,
    title: string,
    description: string,
    requestedAmount: number,
    milestones: any[]
  ) {
    await this.createGrantProposal(ctx.accounts.proposal, {
      title,
      description,
      requestedAmount,
      milestones,
      proposer: ctx.accounts.user.publicKey,
      createdAt: Date.now()
    });
  }
}`,
            'Frontend Component': `// Community Fund Interface
export default function CommunityFund() {
  const handleSubmitGrant = async (grantData) => {
    const proposal = await createGrantProposal(grantData);
    // Grant proposal submission
  };

  return (
    <div className="community-fund">
      {/* Community fund UI */}
    </div>
  );
}`
        }
    },

    // Gaming Templates (5 total)
    'gaming-p2e-arena': {
        title: 'P2E Battle Arena',
        description: 'Play-to-earn battle arena with NFT characters, skill-based combat, and tournament system.',
        category: 'Gaming',
        price: '$429',
        rating: 4.7,
        reviews: 103,
        audited: true,
        features: ['NFT Characters', 'Battle System', 'Tournaments', 'Play-to-Earn'],
        image: '⚔️',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Battle Contract', 'Character Contract', 'Tournament Contract'],
            frontend: ['Battle Arena', 'Character Manager', 'Tournament Hub'],
            features: ['Character Battles', 'Tournament System', 'Reward Distribution', 'NFT Integration']
        },
        codePreview: {
            'Smart Contract': `// P2E Battle Contract
export class BattleArena {
  static async executeBattle(
    ctx: web3.Context,
    attacker: string,
    defender: string,
    battleType: string
  ) {
    const attackerStats = await this.getCharacterStats(attacker);
    const defenderStats = await this.getCharacterStats(defender);
    
    const result = this.calculateBattleOutcome(attackerStats, defenderStats);
    const rewards = this.calculateRewards(result, battleType);
    
    await this.distributeRewards(ctx.accounts.rewards, rewards);
  }
}`,
            'Frontend Component': `// Battle Arena Interface
export default function BattleArena() {
  const handleStartBattle = async (attacker, defender, battleType) => {
    const result = await executeBattle(attacker, defender, battleType);
    // Battle execution logic
  };

  return (
    <div className="battle-arena">
      {/* Battle arena UI */}
    </div>
  );
}`
        }
    },

    'gaming-virtual-world': {
        title: 'Virtual World Metaverse',
        description: 'Decentralized virtual world with land ownership, avatar customization, and social features.',
        category: 'Gaming',
        price: '$549',
        rating: 4.8,
        reviews: 127,
        audited: true,
        features: ['Virtual Land', 'Avatar System', 'Social Features', 'Economy'],
        image: '🌍',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Land Contract', 'Avatar Contract', 'Economy Contract'],
            frontend: ['World Explorer', 'Avatar Customizer', 'Social Hub'],
            features: ['Land Ownership', 'Avatar Customization', 'Social Interaction', 'Virtual Economy']
        },
        codePreview: {
            'Smart Contract': `// Virtual World Contract
export class VirtualWorld {
  static async purchaseLand(
    ctx: web3.Context,
    landId: number,
    coordinates: { x: number, y: number },
    price: number
  ) {
    await this.transferLandOwnership(ctx.accounts.landRegistry, {
      landId,
      coordinates,
      newOwner: ctx.accounts.user.publicKey,
      price,
      timestamp: Date.now()
    });
  }
}`,
            'Frontend Component': `// Virtual World Interface
export default function VirtualWorld() {
  const handlePurchaseLand = async (landId, coordinates, price) => {
    const land = await purchaseVirtualLand(landId, coordinates, price);
    // Land purchase logic
  };

  return (
    <div className="virtual-world">
      {/* Virtual world UI */}
    </div>
  );
}`
        }
    },

    'gaming-fantasy-sports': {
        title: 'Fantasy Sports League',
        description: 'Blockchain-based fantasy sports with real-world data integration, prize pools, and NFT rewards.',
        category: 'Gaming',
        price: '$379',
        rating: 4.6,
        reviews: 89,
        audited: true,
        features: ['Fantasy Teams', 'Real Data', 'Prize Pools', 'NFT Rewards'],
        image: '🏈',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['League Contract', 'Team Contract', 'Prize Contract'],
            frontend: ['Team Builder', 'League Dashboard', 'Prize Manager'],
            features: ['Team Management', 'Real-time Data', 'Prize Distribution', 'NFT Rewards']
        },
        codePreview: {
            'Smart Contract': `// Fantasy Sports Contract
export class FantasySports {
  static async createFantasyTeam(
    ctx: web3.Context,
    teamName: string,
    players: string[],
    leagueId: number
  ) {
    await this.registerTeam(ctx.accounts.teamRegistry, {
      teamName,
      players,
      leagueId,
      owner: ctx.accounts.user.publicKey,
      createdAt: Date.now()
    });
  }
}`,
            'Frontend Component': `// Fantasy Sports Interface
export default function FantasySports() {
  const handleCreateTeam = async (teamName, players, leagueId) => {
    const team = await createFantasyTeam(teamName, players, leagueId);
    // Team creation logic
  };

  return (
    <div className="fantasy-sports">
      {/* Fantasy sports UI */}
    </div>
  );
}`
        }
    },

    'gaming-card-game': {
        title: 'Blockchain Card Game',
        description: 'Collectible card game with NFT cards, deck building, ranked matches, and tournaments.',
        category: 'Gaming',
        price: '$329',
        rating: 4.5,
        reviews: 76,
        audited: true,
        features: ['NFT Cards', 'Deck Building', 'Ranked Matches', 'Tournaments'],
        image: '🃏',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Card Contract', 'Deck Contract', 'Match Contract'],
            frontend: ['Card Collection', 'Deck Builder', 'Match Arena'],
            features: ['Card Collection', 'Deck Management', 'Match System', 'Tournament Play']
        },
        codePreview: {
            'Smart Contract': `// Card Game Contract
export class CardGame {
  static async playCard(
    ctx: web3.Context,
    cardId: number,
    target: string,
    gameSession: string
  ) {
    const cardStats = await this.getCardStats(cardId);
    const targetStats = await this.getTargetStats(target);
    
    const result = this.calculateCardEffect(cardStats, targetStats);
    
    await this.updateGameState(ctx.accounts.gameState, result);
  }
}`,
            'Frontend Component': `// Card Game Interface
export default function CardGame() {
  const handlePlayCard = async (cardId, target, gameSession) => {
    const result = await executeCardPlay(cardId, target, gameSession);
    // Card play logic
  };

  return (
    <div className="card-game">
      {/* Card game UI */}
    </div>
  );
}`
        }
    },

    'gaming-racing-game': {
        title: 'Web3 Racing Game',
        description: 'Racing game with NFT cars, track ownership, betting system, and championship tournaments.',
        category: 'Gaming',
        price: '$389',
        rating: 4.4,
        reviews: 68,
        audited: true,
        features: ['NFT Cars', 'Track Ownership', 'Betting System', 'Championships'],
        image: '🏎️',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Car Contract', 'Track Contract', 'Race Contract'],
            frontend: ['Racing Interface', 'Car Garage', 'Betting Platform'],
            features: ['Car Customization', 'Track Management', 'Race Betting', 'Championship System']
        },
        codePreview: {
            'Smart Contract': `// Racing Game Contract
export class RacingGame {
  static async executeRace(
    ctx: web3.Context,
    participants: string[],
    trackId: number,
    betAmount: number
  ) {
    const raceResults = await this.simulateRace(participants, trackId);
    const winners = this.determineWinners(raceResults);
    
    await this.distributePrizes(ctx.accounts.prizePool, winners, betAmount);
  }
}`,
            'Frontend Component': `// Racing Game Interface
export default function RacingGame() {
  const handleStartRace = async (participants, trackId, betAmount) => {
    const results = await executeRace(participants, trackId, betAmount);
    // Race execution logic
  };

  return (
    <div className="racing-game">
      {/* Racing game UI */}
    </div>
  );
}`
        }
    },

    // Token Templates (5 total)
    'token-launchpad-pro': {
        title: 'Token Launchpad Pro',
        description: 'Professional token launch platform with presale, vesting, liquidity locks, and marketing tools.',
        category: 'Token',
        price: '$499',
        rating: 4.8,
        reviews: 142,
        audited: true,
        features: ['Token Presale', 'Vesting System', 'Liquidity Locks', 'Marketing Tools'],
        image: '🚀',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Token Contract', 'Presale Contract', 'Vesting Contract'],
            frontend: ['Launch Dashboard', 'Presale Interface', 'Token Manager'],
            features: ['Token Creation', 'Presale Management', 'Vesting Schedule', 'Liquidity Management']
        },
        codePreview: {
            'Smart Contract': `// Token Launchpad Contract
export class TokenLaunchpad {
  static async createToken(
    ctx: web3.Context,
    tokenName: string,
    tokenSymbol: string,
    totalSupply: number,
    decimals: number
  ) {
    await this.initializeToken(ctx.accounts.tokenMint, {
      name: tokenName,
      symbol: tokenSymbol,
      supply: totalSupply,
      decimals,
      mintAuthority: ctx.accounts.user.publicKey
    });
  }
}`,
            'Frontend Component': `// Token Launchpad Interface
export default function TokenLaunchpad() {
  const handleCreateToken = async (tokenData) => {
    const token = await createToken(tokenData);
    // Token creation logic
  };

  return (
    <div className="token-launchpad">
      {/* Token launchpad UI */}
    </div>
  );
}`
        }
    },

    'token-staking-platform': {
        title: 'Token Staking Platform',
        description: 'Flexible staking platform with multiple pools, reward mechanisms, and governance integration.',
        category: 'Token',
        price: '$359',
        rating: 4.6,
        reviews: 94,
        audited: true,
        features: ['Multiple Pools', 'Reward Mechanisms', 'Governance Integration', 'APY Tracking'],
        image: '🎯',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Staking Contract', 'Reward Contract', 'Pool Contract'],
            frontend: ['Staking Dashboard', 'Pool Manager', 'Reward Tracker'],
            features: ['Token Staking', 'Pool Management', 'Reward Distribution', 'Governance Voting']
        },
        codePreview: {
            'Smart Contract': `// Token Staking Contract
export class TokenStaking {
  static async stakeTokens(
    ctx: web3.Context,
    amount: number,
    poolId: number,
    lockPeriod: number
  ) {
    const rewardRate = await this.getPoolRewardRate(poolId);
    const lockBonus = this.calculateLockBonus(lockPeriod);
    
    await this.createStake(ctx.accounts.stake, {
      amount,
      poolId,
      lockPeriod,
      rewardRate: rewardRate * lockBonus,
      timestamp: Date.now()
    });
  }
}`,
            'Frontend Component': `// Token Staking Interface
export default function TokenStaking() {
  const handleStake = async (amount, poolId, lockPeriod) => {
    const stake = await createTokenStake(amount, poolId, lockPeriod);
    // Token staking logic
  };

  return (
    <div className="token-staking">
      {/* Token staking UI */}
    </div>
  );
}`
        }
    },

    'token-governance-system': {
        title: 'Token Governance System',
        description: 'Comprehensive governance system with voting power, proposal creation, and treasury management.',
        category: 'Token',
        price: '$419',
        rating: 4.7,
        reviews: 108,
        audited: true,
        features: ['Voting Power', 'Proposal Creation', 'Treasury Management', 'Delegation'],
        image: '🗳️',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Governance Contract', 'Treasury Contract', 'Voting Contract'],
            frontend: ['Governance Dashboard', 'Proposal Portal', 'Treasury Manager'],
            features: ['Token Voting', 'Proposal System', 'Treasury Control', 'Power Delegation']
        },
        codePreview: {
            'Smart Contract': `// Token Governance Contract
export class TokenGovernance {
  static async createProposal(
    ctx: web3.Context,
    title: string,
    description: string,
    votingPower: number,
    executionDelay: number
  ) {
    await this.initializeProposal(ctx.accounts.proposal, {
      title,
      description,
      requiredPower: votingPower,
      executionDelay,
      proposer: ctx.accounts.user.publicKey,
      createdAt: Date.now()
    });
  }
}`,
            'Frontend Component': `// Token Governance Interface
export default function TokenGovernance() {
  const handleCreateProposal = async (proposalData) => {
    const proposal = await createGovernanceProposal(proposalData);
    // Proposal creation logic
  };

  return (
    <div className="token-governance">
      {/* Token governance UI */}
    </div>
  );
}`
        }
    },

    'token-bridge-protocol': {
        title: 'Token Bridge Protocol',
        description: 'Cross-chain token bridge with wrapped assets, liquidity pools, and security features.',
        category: 'Token',
        price: '$529',
        rating: 4.8,
        reviews: 87,
        audited: true,
        features: ['Cross-chain Bridge', 'Wrapped Assets', 'Liquidity Pools', 'Security Features'],
        image: '🌉',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Bridge Contract', 'Wrapper Contract', 'Security Contract'],
            frontend: ['Bridge Interface', 'Asset Manager', 'Security Dashboard'],
            features: ['Token Bridging', 'Asset Wrapping', 'Liquidity Management', 'Security Validation']
        },
        codePreview: {
            'Smart Contract': `// Token Bridge Contract
export class TokenBridge {
  static async bridgeToken(
    ctx: web3.Context,
    tokenAmount: number,
    targetChain: string,
    recipient: string
  ) {
    const bridgeFee = tokenAmount * 0.001; // 0.1% bridge fee
    const wrappedAmount = tokenAmount - bridgeFee;
    
    await this.lockToken(ctx.accounts.vault, tokenAmount);
    await this.mintWrappedToken(targetChain, recipient, wrappedAmount);
  }
}`,
            'Frontend Component': `// Token Bridge Interface
export default function TokenBridge() {
  const handleBridgeToken = async (amount, targetChain, recipient) => {
    const bridge = await executeTokenBridge(amount, targetChain, recipient);
    // Token bridging logic
  };

  return (
    <div className="token-bridge">
      {/* Token bridge UI */}
    </div>
  );
}`
        }
    },

    'token-farming-protocol': {
        title: 'Token Farming Protocol',
        description: 'Advanced farming protocol with yield optimization, auto-compounding, and reward multipliers.',
        category: 'Token',
        price: '$389',
        rating: 4.5,
        reviews: 73,
        audited: true,
        features: ['Yield Optimization', 'Auto-compounding', 'Reward Multipliers', 'Pool Management'],
        image: '🌾',
        technicalSpecs: {
            blockchain: 'Solana',
            language: 'TypeScript, React',
            framework: 'Next.js, Anchor',
            smartContracts: ['Farming Contract', 'Reward Contract', 'Pool Contract'],
            frontend: ['Farming Dashboard', 'Pool Manager', 'Reward Tracker'],
            features: ['Token Farming', 'Yield Optimization', 'Auto-compounding', 'Reward Management']
        },
        codePreview: {
            'Smart Contract': `// Token Farming Contract
export class TokenFarming {
  static async farmTokens(
    ctx: web3.Context,
    tokenAmount: number,
    poolId: number,
    compoundFrequency: number
  ) {
    const baseAPY = await this.getPoolAPY(poolId);
    const compoundBonus = this.calculateCompoundBonus(compoundFrequency);
    const effectiveAPY = baseAPY * compoundBonus;
    
    await this.createFarm(ctx.accounts.farm, {
      amount: tokenAmount,
      poolId,
      apy: effectiveAPY,
      compoundFrequency,
      timestamp: Date.now()
    });
  }
}`,
            'Frontend Component': `// Token Farming Interface
export default function TokenFarming() {
  const handleFarmTokens = async (amount, poolId, compoundFrequency) => {
    const farm = await createTokenFarm(amount, poolId, compoundFrequency);
    // Token farming logic
  };

  return (
    <div className="token-farming">
      {/* Token farming UI */}
    </div>
  );
}`
        }
    }
};

export default function TemplatePreview() {
    const params = useParams();
    const templateId = params.templateId as string;
    const template = templateData[templateId];
    const [isPurchasing, setIsPurchasing] = useState(false);

    const handlePurchase = async () => {
        if (isPurchasing) return;
        
        setIsPurchasing(true);
        try {
            // Validate template data
            if (!templateId || !template.title || !template.price) {
                throw new Error('Missing template information');
            }

            const price = parseInt(template.price.replace('$', ''));
            if (isNaN(price) || price <= 0) {
                throw new Error('Invalid template price');
            }

            console.log('Creating checkout session:', { templateId, templateName: template.title, price });

            // Create Stripe checkout session
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    templateId: templateId,
                    templateName: template.title,
                    price: price,
                }),
            });

            const responseText = await response.text();
            console.log('Stripe API response:', response.status, responseText);

            if (!response.ok) {
                let errorMessage = 'Failed to create checkout session';
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const session = JSON.parse(responseText);
            
            if (session.url) {
                // Redirect to Stripe Checkout
                window.location.href = session.url;
            } else {
                throw new Error('No checkout URL returned from Stripe');
            }
        } catch (error) {
            console.error('Purchase failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to initiate purchase. Please try again.';
            alert(errorMessage);
        } finally {
            setIsPurchasing(false);
        }
    };

    if (!template) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Template Not Found</h1>
                    <p className="text-gray-400 mb-6">The template you're looking for doesn't exist.</p>
                    <Button asChild>
                        <Link href="/templates">Back to Templates</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <div className="border-b border-slate-800">
                <div className="container py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/templates" className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Templates
                            </Link>
                        </Button>
                        <div className="flex-1"></div>
                        <Badge variant="outline" className="border-slate-700 text-slate-300">
                            {template.category}
                        </Badge>
                        {template.audited && (
                            <Badge className="bg-green-500/10 text-green-400 border-0">
                                <Shield className="w-3 h-3 mr-1" />
                                Audited
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="container py-12">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center text-5xl mx-auto">
                            {template.image}
                        </div>
                        <h1 className="text-5xl font-bold text-white">{template.title}</h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            {template.description}
                        </p>
                        <div className="flex items-center justify-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(template.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-white font-semibold">{template.rating}</span>
                                <span className="text-gray-400">({template.reviews} reviews)</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{template.price}</div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white">Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {template.features.map((feature: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                        <span className="text-slate-300">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Technical Specifications */}
                    {template.technicalSpecs && (
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-2xl text-white">Technical Specifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div>
                                        <h4 className="text-white font-semibold mb-2">Blockchain</h4>
                                        <p className="text-gray-400">{template.technicalSpecs.blockchain}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-2">Language</h4>
                                        <p className="text-gray-400">{template.technicalSpecs.language}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-2">Framework</h4>
                                        <p className="text-gray-400">{template.technicalSpecs.framework}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-2">Smart Contracts</h4>
                                        <ul className="text-gray-400 space-y-1">
                                            {template.technicalSpecs.smartContracts?.map((contract: string, i: number) => (
                                                <li key={i}>• {contract}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Code Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {(Object.entries(template.codePreview) as [string, string][]).map(([title, code]) => (
                            <Card key={title} className="bg-slate-900 border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-xl text-white">{title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto">
                                        <code className="text-sm text-slate-300">{String(code)}</code>
                                    </pre>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-white mb-4">Ready to Build?</h3>
                            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                                Clone this template and customize it for your specific needs. 
                                All templates include full source code, documentation, and deployment guides.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/templates">← Back to Templates</Link>
                                </Button>
                                <Button 
                                    size="lg" 
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                                    onClick={handlePurchase}
                                    disabled={isPurchasing}
                                >
                                    {isPurchasing ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Buy Now - {template.price}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
