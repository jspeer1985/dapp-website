'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Code2, FileCode, Layers, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export default function SynthesisPreview() {
  const [activeTheme, setActiveTheme] = React.useState<'defi' | 'nft' | 'staking'>('defi');

  const themes = {
    defi: {
      name: 'DeFi Swap',
      color: 'from-blue-500 to-cyan-400',
      component: (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl max-w-sm mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white">Swap Tokens</h3>
            <div className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400">Settings</div>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">You pay</span>
                <span className="text-slate-400">Balance: 24.5 SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-white">1.0</span>
                <span className="flex items-center gap-2 bg-slate-700 px-2 py-1 rounded">
                  <div className="w-5 h-5 rounded-full bg-purple-500"></div>
                  SOL
                </span>
              </div>
            </div>
            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-slate-700 p-2 rounded-full border-4 border-slate-900">
                <Layers className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">You receive</span>
                <span className="text-slate-400">Balance: 0.00 OPK</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-white">142.5</span>
                <span className="flex items-center gap-2 bg-slate-700 px-2 py-1 rounded">
                  <div className="w-5 h-5 rounded-full bg-cyan-400"></div>
                  OPK
                </span>
              </div>
            </div>
            <button className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform">
              Connect Wallet
            </button>
          </div>
        </div>
      )
    },
    nft: {
      name: 'NFT Mint',
      color: 'from-purple-500 to-pink-500',
      component: (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl max-w-sm mx-auto text-center">
          <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-900 to-pink-900 mb-6 flex items-center justify-center relative overflow-hidden group">
            <Sparkles className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <div className="text-left">
                <h4 className="font-bold text-white">Cyber Genesis #402</h4>
                <p className="text-xs text-purple-300">0.5 SOL</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="text-left">
              <p className="text-xs text-slate-400">Total Minted</p>
              <p className="font-bold text-white">4,021 / 5,555</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Price</p>
              <p className="font-bold text-white">0.5 SOL</p>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-[72%] h-full rounded-full"></div>
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform">
            Mint Now
          </button>
        </div>
      )
    },
    staking: {
      name: 'Staking Vault',
      color: 'from-emerald-500 to-teal-400',
      component: (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl max-w-sm mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Layers className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">OPK Staking</h3>
              <p className="text-xs text-emerald-400">142% APY</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800 p-3 rounded-lg text-center">
              <p className="text-xs text-slate-400 mb-1">Total Staked</p>
              <p className="font-bold text-white">1.2M OPK</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg text-center">
              <p className="text-xs text-slate-400 mb-1">Your Rewards</p>
              <p className="font-bold text-emerald-400">244.2 OPK</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 border border-slate-700 rounded-lg flex items-center justify-between hover:bg-slate-800/50 cursor-pointer transition-colors">
              <span className="text-sm text-slate-300">Lock 30 Days</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">12% APY</span>
            </div>
            <div className="p-3 border border-emerald-500/30 bg-emerald-500/5 rounded-lg flex items-center justify-between cursor-pointer">
              <span className="text-sm text-white">Lock 90 Days</span>
              <span className="text-xs bg-emerald-500 text-slate-900 font-bold px-2 py-1 rounded">45% APY</span>
            </div>
          </div>

          <button className="w-full py-3 mt-6 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
            Stake Tokens
          </button>
        </div>
      )
    }
  };

  const codeExample = `// Generated ${themes[activeTheme].name} Component
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';

// TODO: Configure your network endpoint in .env
const NETWORK = process.env.NEXT_PUBLIC_SOLANA_RPC || 'devnet';

export function ${activeTheme === 'defi' ? 'SwapInterface' : activeTheme === 'nft' ? 'MintCard' : 'StakingVault'}() {
  const { publicKey } = useWallet();
  
  // Fully scaffolded UI logic
  // ...
}`;

  return (
    <section id="preview" className="py-20">
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
              Visual & Code Scaffolding
            </h2>
            <p className="text-lg text-muted-foreground">
              We don't just generate code. We generate <strong>beautiful, responsive UI components</strong> ready for your branding.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-slate-800 bg-slate-950">
            <Tabs defaultValue="ui" className="w-full">
              <div className="border-b border-slate-800 bg-slate-900/50 px-4 flex justify-between items-center">
                <TabsList className="h-16 bg-transparent gap-4">
                  <TabsTrigger
                    value="ui"
                    className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <Sparkles className="h-4 w-4" />
                    UI Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <FileCode className="h-4 w-4" />
                    Generated Code
                  </TabsTrigger>
                </TabsList>

                {/* Theme Switcher */}
                <div className="flex gap-2">
                  {(Object.keys(themes) as Array<keyof typeof themes>).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveTheme(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTheme === key
                          ? 'bg-slate-700 text-white ring-1 ring-white/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                      {themes[key].name}
                    </button>
                  ))}
                </div>
              </div>

              <TabsContent value="ui" className="p-0 m-0 min-h-[500px] flex items-center justify-center bg-[url('/grid.svg')] bg-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-950/0 to-slate-950/80 pointer-events-none" />
                <motion.div
                  key={activeTheme}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 w-full p-8"
                >
                  {themes[activeTheme].component}
                </motion.div>
              </TabsContent>

              <TabsContent value="code" className="p-0 m-0 min-h-[500px]">
                <div className="bg-slate-950 p-6 text-sm h-full overflow-auto">
                  <pre className="text-green-400 overflow-x-auto font-mono">
                    <code>{codeExample}</code>
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
            { title: 'Responsive', desc: 'Mobile-first designs' },
            { title: 'Themable', desc: 'Easily customize colors' },
            { title: 'Interactive', desc: 'React components ready' },
          ].map((feature, i) => (
            <div key={i} className="text-center">
              <h4 className="mb-2 font-semibold text-white">{feature.title}</h4>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
