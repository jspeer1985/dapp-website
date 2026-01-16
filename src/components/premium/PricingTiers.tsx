'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Sparkles, Crown, Code, Palette, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getAllTiers } from '@/lib/pricing';

export default function PricingTiers() {
  const tierData = getAllTiers();

  const tiers = [
    {
      ...tierData[0],
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      ...tierData[1],
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
    },
    {
      ...tierData[2],
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Choose Your Launch Tier
            </h2>
            <p className="text-lg text-muted-foreground">
              Select the perfect plan for your project's needs
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${tier.popular ? 'border-primary shadow-xl scale-105' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="mb-4">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${tier.color}`}>
                      <tier.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.target}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-4xl font-bold">${tier.priceUSD}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">One-time payment</p>
                  </div>

                  <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-start gap-2">
                      <Code className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Generated Elements</p>
                        <p className="text-xs text-muted-foreground">{tier.generatedElements}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Palette className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Designs</p>
                        <p className="text-xs text-muted-foreground">{tier.numberOfDesigns}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Security</p>
                        <p className="text-xs text-muted-foreground">{tier.securityLevel}</p>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/factory" className="block">
                    <Button
                      size="lg"
                      variant={tier.popular ? 'gradient' : 'outline'}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            All tiers include security analysis, compliance checks, and 24h download access.
            <br />
            Enterprise customers get priority support and custom features.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
