'use client';

import { getTokenPrice, getDAppPrice, getBundlePrice } from '@/lib/pricing';
import type { Tier } from '@/lib/pricing';

interface PricingDisplayProps {
  productType: 'token-only' | 'dapp-only' | 'token-and-dapp';
  tokenTier?: Tier;
  dappTier?: Tier;
}

export default function PricingDisplay({ productType, tokenTier, dappTier }: PricingDisplayProps) {
  const calculatePrice = () => {
    if (productType === 'token-and-dapp') {
      return getBundlePrice(tokenTier!, dappTier!).usd;
    }
    
    if (productType === 'token-only') {
      return getTokenPrice(tokenTier!).usd;
    }
    
    return getDAppPrice(dappTier!).usd;
  };

  const calculateSOL = () => {
    if (productType === 'token-and-dapp') {
      return getBundlePrice(tokenTier!, dappTier!).sol;
    }
    
    if (productType === 'token-only') {
      return getTokenPrice(tokenTier!).sol;
    }
    
    return getDAppPrice(dappTier!).sol;
  };

  const price = calculatePrice();
  const solPrice = calculateSOL();

  return (
    <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
      <p className="text-sm font-medium mb-2">Generation Cost:</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-primary">
          {solPrice} SOL
        </p>
        <p className="text-lg text-muted-foreground">
          (${price.toLocaleString()})
        </p>
      </div>
      
      {productType === 'token-and-dapp' && (
        <div className="mt-2 text-xs text-green-600 font-semibold">
          Bundle Discount: 20% off!
        </div>
      )}
      
      <div className="mt-2 text-xs text-muted-foreground">
        {productType === 'token-only' && 'Token smart contract with deployment scripts'}
        {productType === 'dapp-only' && 'Full dApp application with backend architecture'}
        {productType === 'token-and-dapp' && 'Complete token + dApp bundle with maximum savings'}
      </div>
    </div>
  );
}
