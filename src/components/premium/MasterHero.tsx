'use client';

import { motion } from 'framer-motion';
import { Sparkles, Rocket, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MasterHero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Web3 Application Factory</span>
            </div>
          </motion.div>

          <motion.h1
            className="mb-6 text-5xl font-bold tracking-tight md:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Build Web3{' '}
            <span className="text-gradient">Faster</span>
          </motion.h1>

          <motion.p
            className="mb-8 text-lg text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Generate production-grade dApp and token architectures in minutes.
            <br />
            <span className="text-primary font-semibold">Optik is an automated Web3 application factory.</span>
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/generate">
              <Button size="lg" variant="gradient" className="gap-2">
                <Rocket className="h-5 w-5" />
                Generate Now
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </motion.div>

          <motion.div
            className="mt-12 grid gap-8 sm:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              { icon: Sparkles, title: 'Smart Contract Templates', desc: 'Structured, deployable codebases' },
              { icon: Shield, title: 'Wallet-Enabled Frontends', desc: 'Complete application architectures' },
              { icon: Rocket, title: 'Backend Architecture', desc: 'API and database schemas' },
            ].map((feature, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-6 text-center transition-all hover:shadow-lg"
              >
                <feature.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
    </section>
  );
}
