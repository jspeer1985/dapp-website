'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$39',
    description: 'Perfect for solo builders and testing',
    features: ['API Gateway access', 'Basic templates', '1 project']
  },
  {
    id: 'builder', 
    name: 'Builder',
    price: '$149',
    description: 'For MVP startups and growing teams',
    features: ['Full templates', 'Automated deployment', '5 projects'],
    popular: true
  },
  {
    id: 'launchpad',
    name: 'Launchpad', 
    price: '$399',
    description: 'For real token launches and staking',
    features: ['Staking contracts', 'Indexer services', '10 projects']
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$1,500',
    description: 'For agencies and white-label platforms',
    features: ['White-label service', 'Custom domains', '25+ projects']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$5,000+',
    description: 'For funds, chains, and regulated platforms',
    features: ['Dedicated instances', 'SLA guarantees', 'Unlimited projects']
  }
];

export default function SignUpPage() {
  const [selectedTier, setSelectedTier] = useState('builder');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup with tier:', selectedTier, formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/" className="inline-block mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                dApp Factory
              </h1>
            </Link>
            <h2 className="text-4xl font-bold mb-4">Start Building Today</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your plan and get instant access to professional dApp development tools
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tier Selection */}
            <div className="lg:col-span-2">
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {tiers.map((tier) => (
                  <motion.div
                    key={tier.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedTier === tier.id 
                          ? 'border-2 border-blue-500 bg-blue-50' 
                          : 'border-2 border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTier(tier.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{tier.name}</CardTitle>
                          {tier.popular && (
                            <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                          )}
                        </div>
                        <div className="text-3xl font-bold">{tier.price}</div>
                        <CardDescription>{tier.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {tier.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Signup Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Create Your Account</CardTitle>
                  <CardDescription>
                    Get started with your selected {tiers.find(t => t.id === selectedTier)?.name} plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company (Optional)</Label>
                        <Input
                          id="company"
                          type="text"
                          placeholder="Acme Corp"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" id="terms" className="mt-1" required />
                        <Label htmlFor="terms" className="text-sm">
                          I agree to the{' '}
                          <Link href="/terms" className="text-blue-600 hover:underline">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full py-3 text-lg"
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      <p>✨ 14-day free trial • No credit card required</p>
                      <p className="mt-2">
                        Already have an account?{' '}
                        <Link href="/auth/signin" className="text-blue-600 hover:underline">
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Why Choose dApp Factory?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Lightning Fast</h4>
                      <p className="text-sm text-muted-foreground">
                        Deploy professional dApps in minutes, not weeks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Enterprise Security</h4>
                      <p className="text-sm text-muted-foreground">
                        Bank-grade security for all your smart contracts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Proven Templates</h4>
                      <p className="text-sm text-muted-foreground">
                        Battle-tested templates used by 1000+ projects
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <h4 className="font-bold text-lg mb-2">Need Help?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our team is here to help you get started
                  </p>
                  <Button variant="outline" className="w-full">
                    Schedule a Call
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
