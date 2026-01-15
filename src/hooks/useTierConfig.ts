'use client';

import { useState, useEffect } from 'react';
import type { Tier } from '@/lib/pricing';
import { getTierFeatures, isFeatureEnabled, type Feature } from '@/lib/features';

interface TierConfigState {
  tier: Tier;
  features: ReturnType<typeof getTierFeatures>;
}

export function useTierConfig(initialTier: Tier = 'starter') {
  const [config, setConfig] = useState<TierConfigState>(() => ({
    tier: initialTier,
    features: getTierFeatures(initialTier),
  }));

  const updateTier = (newTier: Tier) => {
    setConfig({
      tier: newTier,
      features: getTierFeatures(newTier),
    });
  };

  const isFeatureAvailable = (feature: Feature): boolean => {
    return isFeatureEnabled(feature, config.tier);
  };

  const getFeatureConfig = (feature: Feature) => {
    return config.features[feature];
  };

  const getUpgradeFeatures = () => {
    return Object.entries(config.features)
      .filter(([_, featureConfig]) => !featureConfig.enabled)
      .map(([feature, _]) => feature as Feature);
  };

  return {
    tier: config.tier,
    features: config.features,
    updateTier,
    isFeatureAvailable,
    getFeatureConfig,
    getUpgradeFeatures,
  };
}
