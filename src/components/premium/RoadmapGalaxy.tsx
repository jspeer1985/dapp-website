'use client';

import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function RoadmapGalaxy() {
  const milestones = [
    {
      quarter: 'Q1 2024',
      title: 'Platform Launch',
      description: 'Initial release with core AI generation features',
      status: 'completed',
    },
    {
      quarter: 'Q2 2024',
      title: 'Advanced Templates',
      description: 'Pre-built templates for DeFi, NFT, and DAO projects',
      status: 'completed',
    },
    {
      quarter: 'Q3 2024',
      title: 'Multi-Chain Support',
      description: 'Expand beyond Solana to Ethereum and Polygon',
      status: 'in-progress',
    },
    {
      quarter: 'Q4 2024',
      title: 'DAO Governance',
      description: 'Community-driven platform development',
      status: 'planned',
    },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MapPin className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Our Roadmap
            </h2>
            <p className="text-lg text-muted-foreground">
              Building the future of decentralized app development
            </p>
          </motion.div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}>
                  <div className="flex-1">
                    <Card className={`p-6 ${index % 2 === 0 ? 'md:ml-auto md:mr-8' : 'md:mr-auto md:ml-8'} max-w-md`}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 p-2 rounded-full ${
                          milestone.status === 'completed'
                            ? 'bg-green-500/10'
                            : milestone.status === 'in-progress'
                            ? 'bg-blue-500/10'
                            : 'bg-slate-500/10'
                        }`}>
                          {milestone.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : milestone.status === 'in-progress' ? (
                            <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-primary">
                              {milestone.quarter}
                            </span>
                          </div>
                          <h3 className="mb-2 text-xl font-bold">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2">
                    <div className={`h-8 w-8 rounded-full border-4 border-background ${
                      milestone.status === 'completed'
                        ? 'bg-green-500'
                        : milestone.status === 'in-progress'
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-slate-500'
                    }`} />
                  </div>

                  <div className="flex-1 hidden md:block" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
