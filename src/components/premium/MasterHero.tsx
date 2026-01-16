'use client';

import { motion } from 'framer-motion';
import { Sparkles, Rocket, Shield, ArrowRight, Zap, Code, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MasterHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const featureCards = [
    { 
      icon: Code, 
      title: 'Smart Contract Templates', 
      desc: 'Production-ready, audited codebases',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: Shield, 
      title: 'Wallet-Enabled Frontends', 
      desc: 'Complete application architectures',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      icon: Database, 
      title: 'Backend Architecture', 
      desc: 'Scalable API and database schemas',
      color: 'from-green-500 to-emerald-500'
    },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 py-24 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-5xl text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/5 px-6 py-3 backdrop-blur-sm">
              <div className="relative">
                <Sparkles className="h-5 w-5 text-primary" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
              </div>
              <span className="text-sm font-semibold text-primary">Web3 Application Factory</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="mb-8 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl xl:text-8xl"
          >
            <span className="block mb-2">Accelerate</span>
            <span className="block text-gradient">Web3 Development</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mb-8 text-xl text-muted-foreground md:text-2xl leading-relaxed max-w-4xl mx-auto"
          >
            Generate professional-grade dApp and token scaffolds in minutes.
            <br />
            <span className="text-primary font-semibold">Production-quality templates that accelerate your development.</span>
          </motion.p>

          {/* Warning Banner */}
          <motion.div
            variants={itemVariants}
            className="mb-10 max-w-2xl mx-auto"
          >
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Zap className="h-5 w-5 text-yellow-400 mt-0.5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-yellow-200">
                    ⚠️ <strong>Important:</strong> Generated code requires security review and customization before mainnet deployment
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-6 sm:flex-row mb-16"
          >
            <Link href="/factory">
              <Button size="lg" variant="gradient" className="gap-3 text-base px-8 py-4 h-14 shadow-xl hover:shadow-2xl group">
                <Rocket className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                Generate Now
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
            <Link href="#preview">
              <Button size="lg" variant="outline" className="gap-3 text-base px-8 py-4 h-14 border-2 hover:border-primary/50 group">
                View Example dApps
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="grid gap-8 sm:grid-cols-3"
          >
            {featureCards.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative"
              >
                <div className="card-elevated p-8 text-center h-full">
                  {/* Icon with gradient background */}
                  <div className="relative mb-6 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                       style={{ backgroundImage: `linear-gradient(135deg, ${feature.color.split(' ').join(', ')})` }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50 blur-lg group-hover:opacity-75 transition-opacity duration-300"
                         style={{ backgroundImage: `linear-gradient(135deg, ${feature.color.split(' ').join(', ')})` }}
                    />
                  </div>
                  
                  <h3 className="mb-3 font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
    </section>
  );
}
