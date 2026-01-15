'use client';

import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function AgentTerminal() {
  const [lines, setLines] = useState<string[]>([]);

  const terminalLines = [
    '> Initializing AI Agent...',
    '> Analyzing project requirements...',
    '> Generating component structure...',
    '> Creating Next.js pages...',
    '> Implementing wallet integration...',
    '> Setting up Solana connections...',
    '> Adding type definitions...',
    '> Running security analysis...',
    '> Optimizing bundle size...',
    '> ✓ Generation complete!',
  ];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < terminalLines.length) {
        setLines(prev => [...prev, terminalLines[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Terminal className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Watch AI at Work
            </h2>
            <p className="text-lg text-muted-foreground">
              Real-time visibility into the generation process
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-slate-950 border-slate-800 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-slate-400">AI Generation Console</span>
              </div>

              <div className="p-6 font-mono text-sm h-64 overflow-y-auto">
                {lines.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-1 ${
                          line?.includes('✓')
                        ? 'text-green-400'
                        : line?.includes('>')
                        ? 'text-blue-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {line}
                    {index === lines.length - 1 && !line?.includes('✓') && (
                      <span className="inline-block w-2 h-4 ml-1 bg-green-400 animate-pulse" />
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
