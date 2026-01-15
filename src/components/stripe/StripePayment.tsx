'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react';

interface StripePaymentProps {
  amount: number;
  customerEmail: string;
  generationId: string;
  productType: string;
  onComplete: () => void;
}

export default function StripePayment({
  amount,
  customerEmail,
  generationId,
  productType,
  onComplete,
}: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system not loaded');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('processing');

    try {
      // Create payment method first
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: {
            email: customerEmail,
            name: customerEmail.split('@')[0], // Extract name from email
          },
        },
      });

      if (pmError) {
        throw new Error(pmError.message || 'Failed to create payment method');
      }

      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          paymentMethodId: paymentMethod.id,
          generationId,
          customerEmail,
          productType,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmPayment({
        clientSecret: data.clientSecret,
        confirmParams: {
          payment_method: paymentMethod.id,
          return_url: `${window.location.origin}/success?session_id=${generationId}`,
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment confirmation failed');
      }

      setStatus('success');

      // Trigger generation after successful payment
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (err) {
      console.error('Stripe payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed, please try again');
      setStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center">
        <p className="mb-2 text-sm text-muted-foreground">Amount Due:</p>
        <p className="text-4xl font-bold text-primary">${amount}</p>
        <p className="text-sm text-muted-foreground">USD</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Card Information</label>
            <div className="border rounded-lg p-4 bg-background">
              <PaymentElement
                options={{
                  layout: 'tabs',
                }}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading || status !== 'idle'}
        >
          {status === 'idle' && (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${amount}
            </>
          )}
          {status === 'processing' && (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Payment Successful
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        <p>Secured by Stripe. Your payment information is encrypted and safe.</p>
        <p className="mt-1">You'll receive a confirmation email after payment.</p>
      </div>
    </div>
  );
}
