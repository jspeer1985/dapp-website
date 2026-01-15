'use client';

import { motion } from 'framer-motion';
import { FileText, Cpu, Rocket } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: 'Describe Your dApp',
      description: 'Tell us what you want to build. Our AI understands natural language and technical requirements.',
      color: 'text-blue-500',
    },
    {
      icon: Cpu,
      title: 'AI Generates Code',
      description: 'Advanced AI generates production-ready code, complete with tests, documentation, and best practices.',
      color: 'text-purple-500',
    },
    {
      icon: Rocket,
      title: 'Production Ready',
      description: 'Receive your complete, deployable codebase with one-command launch scripts for Solana mainnet.',
      color: 'text-green-500',
    },
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              From idea to deployment in three simple steps
            </p>
          </motion.div>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent hidden md:block" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="flex-1">
                    <div className={`max-w-md ${index % 2 === 0 ? 'md:ml-auto md:text-right' : ''}`}>
                      <div className="mb-4">
                        <span className="text-sm font-semibold text-primary">Step {index + 1}</span>
                      </div>
                      <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>

                  <div className="relative z-10 hidden md:block">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-card shadow-lg">
                      <step.icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="md:hidden flex items-center gap-3 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-card">
                        <step.icon className={`h-6 w-6 ${step.color}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
