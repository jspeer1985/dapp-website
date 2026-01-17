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
            // Create Stripe checkout session
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    templateId: templateId,
                    templateName: template.title,
                    price: parseInt(template.price.replace('$', '')),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const session = await response.json();
            
            if (session.url) {
                // Redirect to Stripe Checkout
                window.location.href = session.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Failed to initiate purchase. Please try again.');
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
                                        {template.technicalSpecs.smartContracts.map((contract: string, i: number) => (
                                            <li key={i}>• {contract}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
