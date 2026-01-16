// app/components/DAppCreationForm.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import { getTierPrice, getTokenPrice, getDAppPrice, getBundlePrice, getTierInfo } from '@/lib/pricing';
import type { Tier } from '@/lib/pricing';

type ProductType = 'token-only' | 'dapp-only' | 'token-and-dapp';

interface FormData {
  productType: ProductType;
  tokenTier?: Tier;
  dappTier?: Tier;
  tokenInfo: {
    name: string;
    symbol: string;
    description: string;
    totalSupply: string;
    decimals: number;
    initialMintRecipient: string;
    buyTax: number;
    sellTax: number;
    maxWalletPercentage: number;
  };
  dappInfo: {
    projectName: string;
    description: string;
    brandingTheme: 'cyberpunk' | 'minimal' | 'professional' | 'gaming';
    primaryColor: string;
    supportedWallets: string[];
    stakingEnabled: boolean;
    stakingAPY: number;
  };
  liquidityPool: {
    enabled: boolean;
    desiredLPSize?: number;
    pairToken: 'SOL' | 'USDC' | 'USDT';
    dexPlatform: 'raydium' | 'orca' | 'jupiter';
  };
  customerInfo: {
    fullName: string;
    email: string;
    telegramHandle: string;
    deliveryWallet: string;
    paymentMethod?: 'stripe';
  };
}

export default function DAppCreationForm() {
  const { publicKey } = useWallet();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    productType: 'token-and-dapp',
    tokenTier: 'professional',
    dappTier: 'professional',
    tokenInfo: {
      name: '',
      symbol: '',
      description: '',
      totalSupply: '1000000000',
      decimals: 9,
      initialMintRecipient: '',
      buyTax: 0,
      sellTax: 0,
      maxWalletPercentage: 2,
    },
    dappInfo: {
      projectName: '',
      description: '',
      brandingTheme: 'cyberpunk',
      primaryColor: '#00D9FF',
      supportedWallets: ['phantom', 'solflare'],
      stakingEnabled: false,
      stakingAPY: 12,
    },
    liquidityPool: {
      enabled: false,
      pairToken: 'SOL',
      dexPlatform: 'raydium',
    },
    customerInfo: {
      fullName: '',
      email: '',
      deliveryWallet: '',
      telegramHandle: '',
    },
  });

  // Auto-fill wallet address if connected
  useEffect(() => {
    if (publicKey) {
      const address = publicKey.toString();
      setFormData(prev => ({
        ...prev,
        tokenInfo: {
          ...prev.tokenInfo,
          initialMintRecipient: prev.tokenInfo.initialMintRecipient || address
        },
        customerInfo: {
          ...prev.customerInfo,
          deliveryWallet: prev.customerInfo.deliveryWallet || address // Only auto-fill if empty
        }
      }));
    }
  }, [publicKey]);

  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const calculatePrice = () => {
    if (formData.productType === 'token-and-dapp') {
      // Bundle pricing with 20% discount
      return getBundlePrice(formData.tokenTier!, formData.dappTier!).usd;
    }

    if (formData.productType === 'token-only') {
      return getTokenPrice(formData.tokenTier!).usd;
    }

    // dapp-only
    return getDAppPrice(formData.dappTier!).usd;
  };

  const calculateLPFee = () => {
    if (!formData.liquidityPool.enabled) {
      return 0;
    }
    // LP integration fee is 15% of the base product price
    const basePrice = calculatePrice();
    return basePrice * 0.15;
  };

  const totalPrice = calculatePrice() + calculateLPFee();

  const handleSubmit = async () => {
    if (!formData.customerInfo.deliveryWallet) {
      alert("Please enter a delivery wallet address to continue.");
      return;
    }
    setSubmitting(true);

    try {
      // 1. Create the generation record in the database first
      const generationData = {
        walletAddress: formData.customerInfo.deliveryWallet,
        customerName: formData.customerInfo.fullName,
        customerEmail: formData.customerInfo.email,
        telegramHandle: formData.customerInfo.telegramHandle,
        projectName: formData.dappInfo.projectName || formData.tokenInfo.name,
        projectDescription: formData.dappInfo.description || formData.tokenInfo.description,
        projectType: formData.productType === 'token-and-dapp' ? 'both' :
          formData.productType === 'token-only' ? 'token' : 'dapp',
        tier: formData.dappTier || formData.tokenTier || 'professional',
        tokenConfig: formData.productType !== 'dapp-only' ? {
          name: formData.tokenInfo.name,
          symbol: formData.tokenInfo.symbol,
          decimals: formData.tokenInfo.decimals,
          totalSupply: parseInt(formData.tokenInfo.totalSupply),
          isNFT: false,
          royaltyPercentage: 0
        } : undefined,
        metadata: {
          primaryColor: formData.dappInfo.primaryColor,
        },
        liquidityPoolConfig: formData.liquidityPool.enabled ? {
          enabled: true,
          desiredLPSize: formData.liquidityPool.desiredLPSize,
          pairToken: formData.liquidityPool.pairToken,
          dexPlatform: formData.liquidityPool.dexPlatform,
        } : { enabled: false }
      };

      const createResponse = await fetch('/api/generations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generationData),
      });

      const createResult = await createResponse.json();

      if (!createResult.success) {
        throw new Error(createResult.error || 'Failed to create order');
      }

      const newId = createResult.generationId;
      // Do NOT set jobId state here, or it will switch UI to "Success/Tracking" view
      // setJobId(newId);

      // Handle Stripe payment (Sole payment method)
      const stripeResponse = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: newId,
          totalPrice: totalPrice,
          customerEmail: formData.customerInfo.email,
          productType: formData.productType,
        }),
      });

      const stripeResult = await stripeResponse.json();

      if (stripeResult.url) {
        // Redirect to Stripe Checkout
        window.location.href = stripeResult.url;
        return;
      } else {
        console.error('Stripe error:', stripeResult);
        throw new Error(stripeResult.details || stripeResult.error || 'Failed to start Stripe checkout');
      }

    } catch (error: any) {
      console.error('Submission failed:', error);
      alert('Failed to process order: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-2xl w-full border border-white/20"
        >
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">Order Received! 🚀</h1>
            <p className="text-xl text-gray-300 mb-8">
              Your production-ready DApp is being generated by our AI team.
            </p>

            <div className="bg-black/30 rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Job ID:</span>
                <span className="text-white font-mono">{jobId}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Estimated Completion:</span>
                <span className="text-white font-bold">90 minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-bold">⚡ Processing</span>
              </div>
            </div>

            <p className="text-gray-400 mb-8">
              We'll email you at <strong className="text-white">{formData.customerInfo.email}</strong> when your project is ready.
            </p>


            <a
              href={`/track/${jobId}`}
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
            >
              Track Your Order →
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Generate Your Project
          </h1>
          <p className="text-xl text-gray-300">
            Optik generates structured, deployable codebases including smart contracts, wallet-enabled applications, and backend architecture.
          </p>
          <p className="text-lg text-purple-400 mt-2 font-semibold">
            Start from $249
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-12">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full mx-1 transition-all ${s <= step ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/20'
                }`}
            />
          ))}
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20"
          >
            {/* STEP 1: Product Selection */}
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">What do you need?</h2>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { value: 'token-only', label: 'Token Only', icon: '🪙' },
                    { value: 'dapp-only', label: 'DApp Only', icon: '🖥️' },
                    { value: 'token-and-dapp', label: 'Token + DApp', icon: '🚀', recommended: true, savings: 'SAVE 10%' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, productType: option.value as ProductType })}
                      className={`relative p-6 rounded-xl border-2 transition-all ${formData.productType === option.value
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                    >
                      {option.recommended && (
                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                          POPULAR
                        </div>
                      )}
                      <div className="text-4xl mb-2">{option.icon}</div>
                      <div className="text-white font-bold">{option.label}</div>
                      {option.savings && (
                        <div className="text-green-400 text-xs font-bold mt-1">{option.savings}</div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tier Selection */}
                {formData.productType !== 'dapp-only' && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">Token Tier</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {(['starter', 'professional', 'enterprise'] as Tier[]).map((tier) => {
                        const tierInfo = getTierInfo(tier);
                        const tierPrice = getTokenPrice(tier); // Use token pricing for token tier
                        return (
                          <button
                            key={tier}
                            onClick={() => setFormData({ ...formData, tokenTier: tier })}
                            className={`p-6 rounded-xl border-2 text-left transition-all ${formData.tokenTier === tier
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                              }`}
                          >
                            <div className="text-lg font-bold text-white mb-2">{tierInfo.name}</div>
                            <div className="text-2xl font-bold text-purple-400 mb-2">${tierPrice.usd}</div>
                            <div className="text-xs text-purple-300 mb-3">{tierInfo.target}</div>
                            <div className="text-xs text-gray-400 mb-3">{tierInfo.generatedElements}</div>
                            <ul className="space-y-1">
                              {tierInfo.features.slice(0, 2).map((feature, index) => (
                                <li key={index} className="text-xs text-gray-400">• {feature}</li>
                              ))}
                            </ul>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.productType !== 'token-only' && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">DApp Tier</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {(['starter', 'professional', 'enterprise'] as Tier[]).map((tier) => {
                        const tierInfo = getTierInfo(tier);
                        const tierPrice = getDAppPrice(tier); // Use dApp pricing for dApp tier
                        return (
                          <button
                            key={tier}
                            onClick={() => setFormData({ ...formData, dappTier: tier })}
                            className={`p-6 rounded-xl border-2 text-left transition-all ${formData.dappTier === tier
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                              }`}
                          >
                            <div className="text-lg font-bold text-white mb-2">{tierInfo.name}</div>
                            <div className="text-2xl font-bold text-blue-400 mb-2">${tierPrice.usd}</div>
                            <div className="text-xs text-blue-300 mb-3">{tierInfo.target}</div>
                            <div className="text-xs text-gray-400 mb-3">{tierInfo.generatedElements}</div>
                            <ul className="space-y-1">
                              {tierInfo.features.slice(0, 2).map((feature, index) => (
                                <li key={index} className="text-xs text-gray-400">• {feature}</li>
                              ))}
                            </ul>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Token Configuration */}
            {step === 2 && formData.productType !== 'dapp-only' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Token Details</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-bold mb-2">Token Name</label>
                    <input
                      type="text"
                      value={formData.tokenInfo.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenInfo: { ...formData.tokenInfo, name: e.target.value }
                      })}
                      placeholder="Quantum Finance Token"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">Symbol</label>
                      <input
                        type="text"
                        value={formData.tokenInfo.symbol}
                        onChange={(e) => setFormData({
                          ...formData,
                          tokenInfo: { ...formData.tokenInfo, symbol: e.target.value.toUpperCase() }
                        })}
                        placeholder="QFT"
                        maxLength={10}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-2">Total Supply</label>
                      <input
                        type="text"
                        value={formData.tokenInfo.totalSupply}
                        onChange={(e) => setFormData({
                          ...formData,
                          tokenInfo: { ...formData.tokenInfo, totalSupply: e.target.value }
                        })}
                        placeholder="1000000000"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">Description</label>
                    <textarea
                      value={formData.tokenInfo.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenInfo: { ...formData.tokenInfo, description: e.target.value }
                      })}
                      placeholder="Revolutionary DeFi token with quantum-resistant security..."
                      rows={4}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">Initial Recipient Wallet</label>
                    <input
                      type="text"
                      value={formData.tokenInfo.initialMintRecipient}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenInfo: { ...formData.tokenInfo, initialMintRecipient: e.target.value }
                      })}
                      placeholder="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none font-mono text-sm"
                    />
                  </div>

                  {/* Advanced options for Professional+ */}
                  {formData.tokenTier !== 'starter' && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                      <h3 className="text-white font-bold mb-4">Advanced Features</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="buyTax" className="block text-white font-bold mb-2">Buy Tax (%)</label>
                          <input
                            id="buyTax"
                            type="number"
                            value={formData.tokenInfo.buyTax || 0}
                            onChange={(e) => setFormData({
                              ...formData,
                              tokenInfo: { ...formData.tokenInfo, buyTax: parseFloat(e.target.value) }
                            })}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="sellTax" className="block text-white font-bold mb-2">Sell Tax (%)</label>
                          <input
                            id="sellTax"
                            type="number"
                            value={formData.tokenInfo.sellTax || 0}
                            onChange={(e) => setFormData({
                              ...formData,
                              tokenInfo: { ...formData.tokenInfo, sellTax: parseFloat(e.target.value) }
                            })}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label htmlFor="maxWallet" className="block text-white font-bold mb-2">Max Wallet (% of supply)</label>
                        <input
                          id="maxWallet"
                          type="number"
                          value={formData.tokenInfo.maxWalletPercentage || 2}
                          onChange={(e) => setFormData({
                            ...formData,
                            tokenInfo: { ...formData.tokenInfo, maxWalletPercentage: parseFloat(e.target.value) }
                          })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: DApp Configuration */}
            {step === 3 && formData.productType !== 'token-only' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">DApp Customization</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-bold mb-2">Project Name</label>
                    <input
                      type="text"
                      value={formData.dappInfo.projectName}
                      onChange={(e) => setFormData({
                        ...formData,
                        dappInfo: { ...formData.dappInfo, projectName: e.target.value }
                      })}
                      placeholder="Quantum Finance Platform"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">Project Description</label>
                    <textarea
                      value={formData.dappInfo.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        dappInfo: { ...formData.dappInfo, description: e.target.value }
                      })}
                      placeholder="A decentralized platform for quantum-safe financial operations..."
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4">Branding Theme</label>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { value: 'cyberpunk', label: 'Cyberpunk', preview: '🌃' },
                        { value: 'minimal', label: 'Minimal', preview: '⚪' },
                        { value: 'professional', label: 'Professional', preview: '💼' },
                        { value: 'gaming', label: 'Gaming', preview: '🎮' },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setFormData({
                            ...formData,
                            dappInfo: { ...formData.dappInfo, brandingTheme: theme.value as any }
                          })}
                          className={`p-4 rounded-xl border-2 transition-all ${formData.dappInfo.brandingTheme === theme.value
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                            }`}
                        >
                          <div className="text-3xl mb-2">{theme.preview}</div>
                          <div className="text-white font-bold text-sm">{theme.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">Primary Color</label>
                    <div className="flex gap-4">
                      <input
                        type="color"
                        aria-label="Primary Theme Color"
                        value={formData.dappInfo.primaryColor}
                        onChange={(e) => setFormData({
                          ...formData,
                          dappInfo: { ...formData.dappInfo, primaryColor: e.target.value }
                        })}
                        className="h-16 w-16 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.dappInfo.primaryColor}
                        onChange={(e) => setFormData({
                          ...formData,
                          dappInfo: { ...formData.dappInfo, primaryColor: e.target.value }
                        })}
                        placeholder="#00D9FF"
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4">Supported Wallets</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['phantom', 'solflare', 'backpack', 'ledger'].map((wallet) => (
                        <label
                          key={wallet}
                          className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-6 py-4 cursor-pointer hover:border-white/40 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={formData.dappInfo.supportedWallets.includes(wallet)}
                            onChange={(e) => {
                              const wallets = e.target.checked
                                ? [...formData.dappInfo.supportedWallets, wallet]
                                : formData.dappInfo.supportedWallets.filter(w => w !== wallet);
                              setFormData({
                                ...formData,
                                dappInfo: { ...formData.dappInfo, supportedWallets: wallets }
                              });
                            }}
                            className="w-5 h-5"
                          />
                          <span className="text-white font-bold capitalize">{wallet}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Staking options for Professional+ */}
                  {formData.dappTier !== 'starter' && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                      <label className="flex items-center gap-3 mb-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.dappInfo.stakingEnabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            dappInfo: { ...formData.dappInfo, stakingEnabled: e.target.checked }
                          })}
                          className="w-5 h-5"
                        />
                        <span className="text-white font-bold">Enable Staking</span>
                      </label>

                      {formData.dappInfo.stakingEnabled && (
                        <div>
                          <label htmlFor="stakingAPY" className="block text-white font-bold mb-2">Staking APY (%)</label>
                          <input
                            id="stakingAPY"
                            type="number"
                            value={formData.dappInfo.stakingAPY || 12}
                            onChange={(e) => setFormData({
                              ...formData,
                              dappInfo: { ...formData.dappInfo, stakingAPY: parseFloat(e.target.value) }
                            })}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Liquidity Pool (Optional) */}
            {step === 4 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Liquidity Pool (Optional)</h2>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">💡</div>
                    <div>
                      <h3 className="text-white font-bold mb-2">Why add liquidity?</h3>
                      <p className="text-gray-300">
                        Without a liquidity pool, your token can't be traded on DEXs.
                        We recommend at least $50k for serious projects.
                      </p>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 mb-8 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.liquidityPool.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      liquidityPool: { ...formData.liquidityPool, enabled: e.target.checked }
                    })}
                    className="w-6 h-6"
                  />
                  <span className="text-white font-bold text-xl">Yes, add liquidity pool</span>
                </label>

                {formData.liquidityPool.enabled && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white font-bold mb-2">Liquidity Pool Size (USD)</label>
                      <input
                        type="number"
                        min="10000"
                        step="1000"
                        value={formData.liquidityPool.desiredLPSize || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          liquidityPool: { ...formData.liquidityPool, desiredLPSize: parseFloat(e.target.value) }
                        })}
                        placeholder="100000"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                      <p className="text-gray-400 text-sm mt-2">
                        Minimum: $10,000 • Recommended: $50,000+
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="pairToken" className="block text-white font-bold mb-2">Pair Token</label>
                        <select
                          id="pairToken"
                          value={formData.liquidityPool.pairToken || 'SOL'}
                          onChange={(e) => setFormData({
                            ...formData,
                            liquidityPool: { ...formData.liquidityPool, pairToken: e.target.value as any }
                          })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="SOL">SOL</option>
                          <option value="USDC">USDC</option>
                          <option value="USDT">USDT</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="dexPlatform" className="block text-white font-bold mb-2">DEX Platform</label>
                        <select
                          id="dexPlatform"
                          value={formData.liquidityPool.dexPlatform || 'raydium'}
                          onChange={(e) => setFormData({
                            ...formData,
                            liquidityPool: { ...formData.liquidityPool, dexPlatform: e.target.value as any }
                          })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="raydium">Raydium</option>
                          <option value="orca">Orca</option>
                          <option value="jupiter">Jupiter</option>
                        </select>
                      </div>
                    </div>

                    {formData.liquidityPool.desiredLPSize && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">LP Size:</span>
                          <span className="text-white font-bold">
                            ${formData.liquidityPool.desiredLPSize.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Integration Fee (15%):</span>
                          <span className="text-white font-bold">
                            ${calculateLPFee().toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t border-white/20 pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold">Total LP Cost:</span>
                            <span className="text-green-400 font-bold text-xl">
                              ${(formData.liquidityPool.desiredLPSize + calculateLPFee()).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Customer Info & Payment */}
            {step === 5 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Your Information</h2>

                <div className="space-y-6 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">Full Name</label>
                      <input
                        required
                        type="text"
                        value={formData.customerInfo.fullName}
                        onChange={(e) => setFormData({
                          ...formData,
                          customerInfo: { ...formData.customerInfo, fullName: e.target.value }
                        })}
                        placeholder="John Doe"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-bold mb-2">Email</label>
                      <input
                        required
                        type="email"
                        value={formData.customerInfo.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          customerInfo: { ...formData.customerInfo, email: e.target.value }
                        })}
                        placeholder="john@example.com"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">Telegram (Optional)</label>
                    <input
                      type="text"
                      value={formData.customerInfo.telegramHandle || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, telegramHandle: e.target.value }
                      })}
                      placeholder="@johndoe"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">Delivery Wallet Address</label>
                    <input
                      type="text"
                      value={formData.customerInfo.deliveryWallet}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, deliveryWallet: e.target.value }
                      })}
                      placeholder="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 font-mono text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-gray-400 text-sm mt-2">
                      This wallet will receive admin rights and initial tokens
                    </p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/30 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">Order Summary</h3>

                  <div className="space-y-4 mb-6">
                    {formData.productType !== 'dapp-only' && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">
                          Token ({formData.tokenTier})
                        </span>
                        <span className="text-white font-bold">
                          ${getTokenPrice(formData.tokenTier!).usd.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {formData.productType !== 'token-only' && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">
                          DApp ({formData.dappTier})
                        </span>
                        <span className="text-white font-bold">
                          ${getDAppPrice(formData.dappTier!).usd.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {formData.productType === 'token-and-dapp' && (
                      <div className="flex justify-between items-center bg-green-500/10 p-2 rounded-lg border border-green-500/30">
                        <span className="text-green-400 text-sm font-bold">
                          Bundle Discount (10%+)
                        </span>
                        <span className="text-green-400 font-bold">
                          -${(getTokenPrice(formData.tokenTier!).usd + getDAppPrice(formData.dappTier!).usd - getBundlePrice(formData.tokenTier!, formData.dappTier!).usd).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {formData.liquidityPool.enabled && formData.liquidityPool.desiredLPSize && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Liquidity Pool</span>
                          <span className="text-white font-bold">
                            ${formData.liquidityPool.desiredLPSize.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">LP Integration Fee (15%)</span>
                          <span className="text-white font-bold">
                            ${calculateLPFee().toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-xl">Total</span>
                      <span className="text-green-400 font-bold text-3xl">
                        ${totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="w-full p-4 rounded-xl border-2 border-blue-500 bg-blue-500/20 text-white font-bold text-center flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Paying with Credit/Debit Card (Stripe)
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="mt-6 bg-white/5 rounded-xl p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 mt-1" required />
                    <span className="text-sm text-gray-300">
                      I understand that all code is provided as-is, ownership transfers only after full payment,
                      and scope is locked at payment. No refunds after deployment begins. Read our {' '}
                      <a href="/terms" target="_blank" className="text-blue-400 underline hover:text-blue-300">
                        Terms of Service
                      </a>.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-bold hover:bg-white/20 transition-all"
                >
                  ← Back
                </button>
              )}

              {step < 5 && (
                <button
                  onClick={() => setStep(step + 1)}
                  className="ml-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-transform"
                >
                  Next →
                </button>
              )}

              {step === 5 && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="ml-auto px-12 py-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl text-white font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : `Submit Order ($${totalPrice.toLocaleString()})`}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}