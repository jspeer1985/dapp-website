'use client';

import { motion } from 'framer-motion';
import { Code2, FileCode, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export default function SynthesisPreview() {
  const codeExample = `// Generated Solana dApp Component
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';

export function TokenMinter() {
  const { publicKey, sendTransaction } = useWallet();
  const connection = new Connection('https://api.mainnet-beta.solana.com');

  const mintToken = async () => {
    // AI-generated minting logic
    const transaction = await createMintTransaction();
    const signature = await sendTransaction(transaction, connection);
    return signature;
  };

  return (
    <div className="mint-container">
      <button onClick={mintToken}>
        Mint Token
      </button>
    </div>
  );
}`;

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
            <Code2 className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Production-Ready Code
            </h2>
            <p className="text-lg text-muted-foreground">
              Generate clean, documented, and optimized code following industry best practices
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <Tabs defaultValue="component" className="w-full">
              <div className="border-b bg-muted/50 px-4">
                <TabsList className="h-12 bg-transparent">
                  <TabsTrigger value="component" className="gap-2">
                    <FileCode className="h-4 w-4" />
                    Component
                  </TabsTrigger>
                  <TabsTrigger value="types" className="gap-2">
                    <Layers className="h-4 w-4" />
                    Types
                  </TabsTrigger>
                  <TabsTrigger value="config" className="gap-2">
                    <Code2 className="h-4 w-4" />
                    Config
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="component" className="p-0 m-0">
                <div className="bg-slate-950 p-6 text-sm">
                  <pre className="text-green-400 overflow-x-auto">
                    <code>{codeExample}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="types" className="p-0 m-0">
                <div className="bg-slate-950 p-6 text-sm">
                  <pre className="text-green-400 overflow-x-auto">
                    <code>{`// TypeScript Definitions
interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
}

interface MintResponse {
  signature: string;
  mint: PublicKey;
  success: boolean;
}`}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="config" className="p-0 m-0">
                <div className="bg-slate-950 p-6 text-sm">
                  <pre className="text-green-400 overflow-x-auto">
                    <code>{`// Next.js Configuration
module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
    };
    return config;
  },
};`}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {[
            { title: 'TypeScript', desc: 'Full type safety' },
            { title: 'Documented', desc: 'Inline comments' },
            { title: 'Tested', desc: 'Unit tests included' },
          ].map((feature, i) => (
            <div key={i} className="text-center">
              <h4 className="mb-2 font-semibold">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
