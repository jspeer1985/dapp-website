'use client';

import { motion } from 'framer-motion';
import { Coins, PieChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function TokenomicsDashboard() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Coins className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Token Generation Made Easy
            </h2>
            <p className="text-lg text-muted-foreground">
              Create and deploy SPL tokens with custom tokenomics in minutes
            </p>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  Token Supply
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Total Supply</span>
                      <span className="font-bold">1,000,000,000</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Circulating</span>
                      <span className="font-bold">400,000,000</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Community</span>
                    <span className="font-bold">60%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Team</span>
                    <span className="font-bold">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Treasury</span>
                    <span className="font-bold">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Liquidity</span>
                    <span className="font-bold">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Holders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">2,547</div>
                    <p className="text-sm text-muted-foreground">Total Holders</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 mb-1">+152</div>
                    <p className="text-sm text-muted-foreground">Last 24h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
