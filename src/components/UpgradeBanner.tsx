'use client';

import { motion } from 'framer-motion';
import type { Tier } from '@/lib/pricing';

interface UpgradeBannerProps {
  feature: string;
  currentTier: Tier;
  requiredTier: Tier;
  description?: string;
  className?: string;
}

const tierOrder: Record<Tier, number> = {
  starter: 1,
  professional: 2,
  enterprise: 3,
};

export function UpgradeBanner({ 
  feature, 
  currentTier, 
  requiredTier, 
  description,
  className = ""
}: UpgradeBannerProps) {
  const currentLevel = tierOrder[currentTier];
  const requiredLevel = tierOrder[requiredTier];
  
  if (currentLevel >= requiredLevel) {
    return null; // Feature is available
  }

  const getUpgradeMessage = () => {
    if (requiredLevel === 2) {
      return "Upgrade to Professional";
    }
    if (requiredLevel === 3) {
      return "Upgrade to Enterprise";
    }
    return "Upgrade required";
  };

  const getUpgradeUrl = () => {
    return `/upgrade?feature=${feature.toLowerCase()}&tier=${requiredTier}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">
              {feature} is available in {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} tier
            </h3>
          </div>
          
          {description && (
            <p className="text-gray-300 mb-3">{description}</p>
          )}
          
          <div className="flex items-center gap-4">
            <a
              href={getUpgradeUrl()}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {getUpgradeMessage()}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            
            <span className="text-sm text-gray-400">
              Unlock this feature and more with {requiredTier} tier
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
