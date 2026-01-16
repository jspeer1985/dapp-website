import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Shield, Zap, ExternalLink, Copy } from 'lucide-react';
import Link from 'next/link';

interface Template {
    id: string;
    title: string;
    description: string;
    category: 'DeFi' | 'NFT' | 'DAO' | 'Gaming';
    price: string;
    rating: number;
    reviews: number;
    audited: boolean;
    features: string[];
    image: string;
}

const templates: Template[] = [
    {
        id: 'uniswap-v3-clone',
        title: 'DeFi Swap Protocol',
        description: 'Full-featured AMM DEX with concentrated liquidity, farming, and router. Includes React frontend.',
        category: 'DeFi',
        price: '$499',
        rating: 4.9,
        reviews: 124,
        audited: true,
        features: ['Concentrated Liquidity', 'Yield Farming', 'Analytics Dashboard', 'Smart Router'],
        image: '🌊'
    },
    {
        id: 'nft-marketplace-pro',
        title: 'NFT Marketplace Pro',
        description: 'Complete marketplace with auctions, instant buy, royalties, and collection launchpad.',
        category: 'NFT',
        price: '$399',
        rating: 4.7,
        reviews: 89,
        audited: true,
        features: ['Auctions & Fixed Price', 'Creator Royalties', 'Collection Launchpad', 'Activity Feed'],
        image: '🖼️'
    },
    {
        id: 'dao-governance',
        title: 'DAO Governance Suite',
        description: 'On-chain voting system with treasury management, proposal lifecycle, and forum integration.',
        category: 'DAO',
        price: '$299',
        rating: 4.8,
        reviews: 56,
        audited: true,
        features: ['Quadratic Voting', 'Treasury Multisig', 'Proposal Dashboard', 'Token Gating'],
        image: '⚖️'
    },
    {
        id: 'p2e-staking',
        title: 'GameFi Staking Hub',
        description: 'Staking system for gaming tokens with level-up mechanics, rewards multiplier, and leaderboards.',
        category: 'Gaming',
        price: '$349',
        rating: 4.6,
        reviews: 42,
        audited: false,
        features: ['Level-up System', 'Rewards Multiplier', 'Leaderboard', 'NFT Staking'],
        image: '🎮'
    }
];

export default function TemplateMarketplace() {
    return (
        <div className="container py-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h1 className="text-4xl font-bold text-white mb-4">Template Marketplace</h1>
                <p className="text-gray-400 text-lg">
                    Accelerate your development with battle-tested, audited dApp templates.
                    Clone, customize, and deploy in minutes.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => (
                    <Card key={template.id} className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-colors">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-3xl">
                                    {template.image}
                                </div>
                                <div className="flex gap-2">
                                    {template.audited && (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-400 hover:bg-green-500/20 gap-1 border-0">
                                            <Shield className="w-3 h-3" /> Audited
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="border-slate-700 text-slate-400">
                                        {template.category}
                                    </Badge>
                                </div>
                            </div>
                            <CardTitle className="text-white text-xl mb-2">{template.title}</CardTitle>
                            <CardDescription className="text-slate-400">{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(template.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-slate-400">({template.reviews} reviews)</span>
                            </div>
                            <ul className="space-y-2 mb-6">
                                {template.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                        <Zap className="w-3 h-3 text-purple-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center border-t border-slate-800 pt-6">
                            <span className="text-2xl font-bold text-white">{template.price}</span>
                            <div className="flex gap-2">
                                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Preview
                                </Button>
                                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
                                    <Copy className="w-4 h-4 mr-2" />
                                    Clone
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
