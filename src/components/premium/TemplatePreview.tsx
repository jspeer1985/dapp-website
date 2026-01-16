'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Eye, 
  Download, 
  Star, 
  Users, 
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Rocket,
  Check,
  ExternalLink,
  Copy
} from 'lucide-react';

interface TemplatePreviewProps {
  template: {
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
  };
  onPurchase: () => void;
  isPurchased?: boolean;
}

export default function TemplatePreview({ template, onPurchase, isPurchased = false }: TemplatePreviewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(template.preview.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DeFi': return <TrendingUp className="h-5 w-5" />;
      case 'NFT': return <Globe className="h-5 w-5" />;
      case 'DAO': return <Users className="h-5 w-5" />;
      case 'Token': return <Zap className="h-5 w-5" />;
      case 'Gaming': return <Rocket className="h-5 w-5" />;
      default: return <Code className="h-5 w-5" />;
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Preview */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="overflow-hidden border-2 border-transparent hover:border-blue-200 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white shadow-lg">
                  {getCategoryIcon(template.category)}
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">{template.name}</CardTitle>
                  <CardDescription className="text-lg">{template.category}</CardDescription>
                </div>
              </div>
              <Badge className={`px-3 py-1 ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-white">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="data-[state=active]:bg-white">
                  Code
                </TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:bg-white">
                  Features
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{template.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{template.rating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Download className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold">{template.downloads}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="text-2xl font-bold">{template.popularity}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Popularity</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <div className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="p-4 rounded-xl bg-white shadow-lg mb-4 inline-block">
                        {getCategoryIcon(template.category)}
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Interactive Preview</h4>
                      <p className="text-muted-foreground mb-4">
                        Experience the template in action
                      </p>
                      <Button variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Live Demo
                      </Button>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      💡 This is a preview of the template. Full functionality available after purchase.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Sample Code</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      {copiedCode ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto">
                    <pre className="text-sm leading-relaxed">
                      <code>{template.preview.code}</code>
                    </pre>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      📝 This is a sample of the template code. Full source code included with purchase.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Features Included</h3>
                  <div className="grid gap-3">
                    {template.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-green-100">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Purchase Card */}
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-2xl">${template.price}</CardTitle>
            <CardDescription>One-time purchase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Full source code</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Documentation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">1 year updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Email support</span>
              </div>
            </div>

            <Button
              onClick={onPurchase}
              className="w-full py-3 text-lg"
              disabled={isPurchased}
            >
              {isPurchased ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Purchased
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Purchase Template
                </>
              )}
            </Button>

            {isPurchased && (
              <div className="text-center">
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download Now
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <p>Secure payment via Stripe</p>
              <p>30-day money-back guarantee</p>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Node.js 18+</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm">React 18+</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm">TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Web3 wallet</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
