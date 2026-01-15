'use client';

import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useState, useCallback } from 'react';

export function useWallet() {
  const { publicKey, sendTransaction, ...wallet } = useSolanaWallet();
  const { connection } = useConnection();
  const [isProcessing, setIsProcessing] = useState(false);

  const sendSOL = useCallback(
    async (recipientAddress: string, amount: number) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      setIsProcessing(true);
      try {
        const recipient = new PublicKey(recipientAddress);

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipient,
            lamports: amount * LAMPORTS_PER_SOL,
          })
        );

        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, {
          minContextSlot,
        });

        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature
        });

        return signature;
      } finally {
        setIsProcessing(false);
      }
    },
    [publicKey, connection, sendTransaction]
  );

  const getBalance = useCallback(async () => {
    if (!publicKey) {
      return 0;
    }

    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }, [publicKey, connection]);

  return {
    ...wallet,
    publicKey,
    address: publicKey?.toString(),
    sendSOL,
    getBalance,
    isProcessing,
  };
}
