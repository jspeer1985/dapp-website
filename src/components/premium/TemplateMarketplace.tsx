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
  TrendingUp
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
  {
    id: 'defi-yield-farm',
    name: 'DeFi Yield Farm',
    category: 'DeFi',
    price: 299,
    description: 'Complete yield farming protocol with multiple pools and rewards',
    features: [
      'Multi-pool yield farming',
      'Dynamic reward distribution',
      'LP token staking',
      'Governance integration',
      'Advanced analytics dashboard'
    ],
    preview: {
      image: '/templates/defi-yield-preview.png',
      code: `// Yield Farm Contract
contract YieldFarm {
    mapping(address => uint256) public stakedLP;
    mapping(address => uint256) public rewards;
    
    function stake(uint256 amount) external {
        // Staking logic
    }
}`,
      demo: 'https://demo.defi-yield-farm.com'
    },
    difficulty: 'Advanced',
    popularity: 95,
    downloads: 1247,
    rating: 4.8,
    tags: ['DeFi', 'Yield', 'Staking', 'Governance']
  },
  {
    id: 'nft-marketplace',
    name: 'NFT Marketplace',
    category: 'NFT',
    price: 199,
    description: 'Full-featured NFT marketplace with bidding and royalties',
    features: [
      'NFT minting and trading',
      'Auction system',
      'Creator royalties',
      'Collection management',
      'Advanced search filters'
    ],
    preview: {
      image: '/templates/nft-marketplace-preview.png',
      code: `// NFT Marketplace
contract NFTMarketplace {
    struct Listing {
        address nftContract;
        uint256 tokenId;
        uint256 price;
    }
    
    function createListing(...) external {
        // Listing logic
    }
}`,
      demo: 'https://demo.nft-marketplace.com'
    },
    difficulty: 'Intermediate',
    popularity: 88,
    downloads: 892,
    rating: 4.6,
    tags: ['NFT', 'Marketplace', 'Auction', 'Royalties']
  },
  {
    id: 'dao-governance',
    name: 'DAO Governance',
    category: 'DAO',
    price: 249,
    description: 'Complete DAO with voting, proposals, and treasury management',
    features: [
      'On-chain voting',
      'Proposal system',
      'Treasury management',
      'Delegation system',
      'Quorum-based decisions'
    ],
    preview: {
      image: '/templates/dao-governance-preview.png',
      code: `// DAO Governance
contract DAO {
    struct Proposal {
        uint256 id;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
    }
    
    function vote(uint256 proposalId, bool support) external {
        // Voting logic
    }
}`,
      demo: 'https://demo.dao-governance.com'
    },
    difficulty: 'Advanced',
    popularity: 82,
    downloads: 623,
    rating: 4.7,
    tags: ['DAO', 'Governance', 'Voting', 'Treasury']
  },
  {
    id: 'token-launchpad',
    name: 'Token Launchpad',
    category: 'Token',
    price: 149,
    description: 'Complete token launch platform with presale and vesting',
    features: [
      'Token creation wizard',
      'Presale mechanism',
      'Vesting schedules',
      'Anti-bot protection',
      'Liquidity lock'
    ],
    preview: {
      image: '/templates/token-launchpad-preview.png',
      code: `// Token Launchpad
contract TokenLaunchpad {
    struct Presale {
        uint256 tokensForSale;
        uint256 pricePerToken;
        uint256 startTime;
        uint256 endTime;
    }
    
    function buyTokens(uint256 amount) external payable {
        // Purchase logic
    }
}`,
      demo: 'https://demo.token-launchpad.com'
    },
    difficulty: 'Intermediate',
    popularity: 91,
    downloads: 1567,
    rating: 4.9,
    tags: ['Token', 'Launchpad', 'Presale', 'Vesting']
  },
  {
    id: 'gaming-platform',
    name: 'Gaming Platform',
    category: 'Gaming',
    price: 399,
    description: 'Web3 gaming platform with NFTs and play-to-earn mechanics',
    features: [
      'NFT game assets',
      'Play-to-earn rewards',
      'Tournament system',
      'Leaderboard',
      'In-game marketplace'
    ],
    preview: {
      image: '/templates/gaming-platform-preview.png',
      code: `// Gaming Platform
contract GamePlatform {
    struct GameAsset {
        uint256 tokenId;
        uint256 rarity;
        uint256 power;
    }
    
    function battle(uint256[] memory assets) external {
        // Battle logic
    }
}`,
      demo: 'https://demo.gaming-platform.com'
    },
    difficulty: 'Advanced',
    popularity: 78,
    downloads: 445,
    rating: 4.5,
    tags: ['Gaming', 'NFT', 'P2E', 'Tournament']
  },
  {
    id: 'dex-exchange',
    name: 'DEX Exchange',
    category: 'DeFi',
    price: 349,
    description: 'Decentralized exchange with AMM and advanced trading features',
    features: [
      'AMM liquidity pools',
      'Limit orders',
      'Trading charts',
      'Yield farming',
      'Cross-chain swaps'
    ],
    preview: {
      image: '/templates/dex-exchange-preview.png',
      code: `// DEX Exchange
contract DEX {
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
    }
    
    function swap(address tokenIn, uint256 amountIn) external {
        // Swap logic
    }
}`,
      demo: 'https://demo.dex-exchange.com'
    },
    difficulty: 'Advanced',
    popularity: 94,
    downloads: 1823,
    rating: 4.8,
    tags: ['DeFi', 'DEX', 'AMM', 'Trading']
  },
  {
    id: 'staking-pools',
    name: 'Staking Pools Platform',
    category: 'DeFi',
    price: 279,
    description: 'Multi-token staking platform with flexible reward distribution',
    features: [
      'Multi-token staking pools',
      'Flexible reward periods',
      'Auto-compounding rewards',
      'Pool performance analytics',
      'Emergency withdrawal protection'
    ],
    preview: {
      image: '/templates/staking-pools-preview.png',
      code: `// Staking Pools
contract StakingPools {
    struct Pool {
        address stakingToken;
        address rewardToken;
        uint256 rewardRate;
        uint256 lockPeriod;
    }
    
    function stake(uint256 poolId, uint256 amount) external {
        // Staking logic
    }
}`,
      demo: 'https://demo.staking-pools.com'
    },
    difficulty: 'Intermediate',
    popularity: 87,
    downloads: 934,
    rating: 4.7,
    tags: ['DeFi', 'Staking', 'Rewards', 'Multi-token']
  },
  {
    id: 'bridge-protocol',
    name: 'Cross-Chain Bridge',
    category: 'DeFi',
    price: 449,
    description: 'Secure cross-chain bridge protocol with multi-chain support',
    features: [
      'Multi-chain asset bridging',
      'Liquidity provider rewards',
      'Bridge fee optimization',
      'Cross-chain message passing',
      'Security monitoring dashboard'
    ],
    preview: {
      image: '/templates/bridge-protocol-preview.png',
      code: `// Cross-Chain Bridge
contract CrossChainBridge {
    struct BridgeRequest {
        address token;
        uint256 amount;
        uint256 targetChain;
        address recipient;
    }
    
    function bridgeToken(address token, uint256 amount, uint256 targetChain) external {
        // Bridge logic
    }
}`,
      demo: 'https://demo.bridge-protocol.com'
    },
    difficulty: 'Advanced',
    popularity: 79,
    downloads: 567,
    rating: 4.6,
    tags: ['DeFi', 'Bridge', 'Cross-chain', 'Security']
  },
  {
    id: 'prediction-market',
    name: 'Prediction Market',
    category: 'DeFi',
    price: 329,
    description: 'Decentralized prediction market platform with oracle integration',
    features: [
      'Binary options trading',
      'Real-world event markets',
      'Oracle price feeds',
      'Market creation tools',
      'Liquidity mining rewards'
    ],
    preview: {
      image: '/templates/prediction-market-preview.png',
      code: `// Prediction Market
contract PredictionMarket {
    struct Market {
        string question;
        uint256 endTime;
        bool resolved;
        uint256 outcome;
    }
    
    function placeBet(uint256 marketId, bool outcome, uint256 amount) external {
        // Betting logic
    }
}`,
      demo: 'https://demo.prediction-market.com'
    },
    difficulty: 'Advanced',
    popularity: 73,
    downloads: 389,
    rating: 4.5,
    tags: ['DeFi', 'Prediction', 'Oracle', 'Betting']
  },
  {
    id: 'social-token',
    name: 'Social Token Platform',
    category: 'Token',
    price: 179,
    description: 'Complete social token platform with creator economy features',
    features: [
      'Creator token issuance',
      'Fan token staking',
      'Content reward system',
      'Creator governance',
      'Social media integration'
    ],
    preview: {
      image: '/templates/social-token-preview.png',
      code: `// Social Token Platform
contract SocialToken {
    mapping(address => uint256) public creatorTokens;
    mapping(address => uint256) public fanRewards;
    
    function mintCreatorToken(uint256 amount) external {
        // Minting logic
    }
}`,
      demo: 'https://demo.social-token.com'
    },
    difficulty: 'Intermediate',
    popularity: 85,
    downloads: 712,
    rating: 4.6,
    tags: ['Token', 'Social', 'Creator', 'Economy']
  },
  {
    id: 'lending-protocol',
    name: 'Lending Protocol',
    category: 'DeFi',
    price: 389,
    description: 'Complete lending and borrowing protocol with collateral management',
    features: [
      'Multi-asset lending pools',
      'Dynamic interest rates',
      'Collateral management',
      'Liquidation protection',
      'Risk assessment tools'
    ],
    preview: {
      image: '/templates/lending-protocol-preview.png',
      code: `// Lending Protocol
contract LendingProtocol {
    struct Loan {
        address borrower;
        address collateral;
        uint256 amount;
        uint256 interestRate;
    }
    
    function borrow(address collateralToken, uint256 collateralAmount, uint256 borrowAmount) external {
        // Borrowing logic
    }
}`,
      demo: 'https://demo.lending-protocol.com'
    },
    difficulty: 'Advanced',
    popularity: 90,
    downloads: 1456,
    rating: 4.8,
    tags: ['DeFi', 'Lending', 'Borrowing', 'Collateral']
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
