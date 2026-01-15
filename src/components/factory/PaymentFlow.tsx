'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { getExplorerUrl } from '@/lib/utils';

interface PaymentFlowProps {
  generationId: string;
  amount: number; // Must be in SOL
  onComplete: () => void;
}

type PaymentStatus = 'idle' | 'sending' | 'verifying' | 'complete';

export default function PaymentFlow({
  generationId,
  amount,
  onComplete,
}: PaymentFlowProps) {
  const { sendSOL, isProcessing } = useWallet();
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert SOL to lamports safely
  const toLamports = (sol: number) => {
    if (typeof sol !== 'number' || isNaN(sol) || sol <= 0) {
      throw new Error(`Invalid SOL amount: ${sol}`);
    }
    return BigInt(Math.floor(sol * 1_000_000_000)); // 1 SOL = 1_000_000_000 lamports
  };

  const handlePayment = async () => {
    setError(null);
    setStatus('sending');

    try {
      // Validate treasury wallet
      const treasuryWallet = process.env.NEXT_PUBLIC_SOLANA_TREASURY_WALLET;
      if (!treasuryWallet) {
        throw new Error('Treasury wallet not configured');
      }

      // Send SOL from connected wallet (pass SOL amount, not lamports)
      const sig = await sendSOL(treasuryWallet, amount);
      setSignature(sig);
      setStatus('verifying');

      // Small delay so the tx can propagate
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify payment with backend
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId,
          transactionSignature: sig,
        }),
      });

      let verifyData: any;
      try {
        verifyData = await verifyResponse.json();
      } catch {
        throw new Error('Failed to parse verification response');
      }

      if (!verifyResponse.ok || !verifyData?.success) {
        throw new Error(
          verifyData?.error || `Payment verification failed (${verifyResponse.status})`
        );
      }

      setStatus('complete');

      // Trigger generation after successful payment
      const generateResponse = await fetch(
        `/api/generations/${generationId}/generate`,
        {
          method: 'POST',
        }
      );

      let generateData: any;
      try {
        generateData = await generateResponse.json();
      } catch {
        throw new Error('Failed to parse generation response');
      }

      if (!generateResponse.ok || !generateData?.success) {
        throw new Error(
          generateData?.error || 'Generation failed after payment confirmation'
        );
      }

      // Give a short delay for UX then call onComplete
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      console.error('Payment error:', err);
      setError(
        err instanceof Error ? err.message : 'Payment failed, please try again'
      );
      setStatus('idle');
    }
  };

  const explorerNetwork =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          Send {amount} SOL to generate your dApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center">
          <p className="mb-2 text-sm text-muted-foreground">Amount Due:</p>
          <p className="text-4xl font-bold text-primary">{amount} SOL</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === 'complete' && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              Payment confirmed! Starting generation...
            </AlertDescription>
          </Alert>
        )}

        {signature && (
          <div className="text-sm">
            <p className="mb-2 text-muted-foreground">Transaction:</p>
            <a
              href={getExplorerUrl(signature, explorerNetwork)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              View on Explorer
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        <Button
          size="lg"
          className="w-full"
          onClick={handlePayment}
          disabled={isProcessing || status !== 'idle'}
        >
          {status === 'idle' && 'Send Payment'}
          {status === 'sending' && (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          )}
          {status === 'verifying' && (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          )}
          {status === 'complete' && (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Your payment will be processed on the Solana blockchain. Please do not
          close this page.
        </p>
      </CardContent>
    </Card>
  );
}
