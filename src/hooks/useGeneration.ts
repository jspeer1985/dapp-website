'use client';

import { useState, useEffect, useCallback } from 'react';

export function useGeneration(generationId: string | null) {
  const [generation, setGeneration] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGeneration = useCallback(async () => {
    if (!generationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/generations/${generationId}`);
      const data = await response.json();

      if (data.success) {
        setGeneration(data.generation);
      } else {
        setError(data.error || 'Failed to fetch generation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [generationId]);

  useEffect(() => {
    fetchGeneration();
  }, [fetchGeneration]);

  const refresh = useCallback(() => {
    fetchGeneration();
  }, [fetchGeneration]);

  return {
    generation,
    loading,
    error,
    refresh,
  };
}

export function useGenerationPolling(generationId: string | null, interval: number = 3000) {
  const { generation, loading, error, refresh } = useGeneration(generationId);

  useEffect(() => {
    if (!generationId) return;

    const pollInterval = setInterval(refresh, interval);

    return () => clearInterval(pollInterval);
  }, [generationId, interval, refresh]);

  return {
    generation,
    loading,
    error,
    refresh,
  };
}
