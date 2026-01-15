'use client';

import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';

export function usePayment() {
  const { sendSOL } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(
    async (recipientAddress: string, amount: number) => {
      setError(null);
      setIsProcessing(true);

      try {
        const signature = await sendSOL(recipientAddress, amount);
        return { success: true, signature };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsProcessing(false);
      }
    },
    [sendSOL]
  );

  const verifyPayment = useCallback(
    async (generationId: string, signature: string) => {
      try {
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ generationId, transactionSignature: signature }),
        });

        const data = await response.json();
        return data;
      } catch (err) {
        return { success: false, error: 'Verification failed' };
      }
    },
    []
  );

  return {
    processPayment,
    verifyPayment,
    isProcessing,
    error,
  };
}
