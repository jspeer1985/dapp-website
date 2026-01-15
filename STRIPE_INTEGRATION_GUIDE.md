# Stripe Integration for dApp Generator

## Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxxxxxx
STRIPE_PROFESSIONAL_PRICE_ID=price_xxxxxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxxxxx
```

## Stripe Dashboard Setup

1. **Login to Stripe Dashboard**
2. **Create Products** for each tier:
   - Starter: $99 USD
   - Professional: $299 USD  
   - Enterprise: $1,000 USD

3. **Create Prices** for each product:
   - One-time payment
   - Currency: USD
   - Copy Price IDs to .env

4. **Setup Webhooks**:
   - Endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
   - Secret: Copy webhook secret to .env

## Installation

```bash
npm install stripe @stripe/stripe-js
```

## Usage Examples

### Frontend Integration

```tsx
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '@/components/PaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}
```

### Payment Form Component

```tsx
'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
        payment_method_data: {
          billing_details: {
            email: 'customer@example.com',
          },
        },
      },
    },
  });

    if (error) {
      console.error('Payment error:', error);
    } else {
      // Payment successful
      window.location.href = '/success';
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <Button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Pay $299'}
      </Button>
    </form>
  );
}
```

### Backend Integration

```typescript
// app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { priceId, customerEmail, metadata } = await request.json();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/cancelled`,
      customer_email: customerEmail,
      metadata: metadata || {},
    });
    
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### Webhook Handler

```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Handle successful payment
    console.log('Payment successful:', {
      sessionId: session.id,
      customerEmail: session.customer_details?.email,
      amount: session.amount_total,
      metadata: session.metadata,
    });
    
    // Trigger dApp generation
    await triggerGeneration(session.metadata);
  }
  
  return NextResponse.json({ received: true });
}

async function triggerGeneration(metadata: any) {
  // Your existing generation logic here
  const response = await fetch('/api/generations/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Map from Stripe metadata to your generation schema
      walletAddress: metadata.walletAddress,
      customerName: metadata.customerName,
      // ... other fields
    }),
  });
  
  const result = await response.json();
  return result;
}
```

## Payment Flow Integration

### Updated PaymentFlow Component

```tsx
// Add Stripe option to existing PaymentFlow
const [paymentMethod, setPaymentMethod] = useState<'sol' | 'stripe'>('sol');

return (
  <Card>
    <CardHeader>
      <CardTitle>Choose Payment Method</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={paymentMethod === 'sol' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('sol')}
        >
          Pay with SOL
        </Button>
        <Button
          variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('stripe')}
        >
          Pay with Card
        </Button>
      </div>
      
      {paymentMethod === 'sol' && <SolPaymentComponent />}
      {paymentMethod === 'stripe' && <StripePaymentComponent />}
    </CardContent>
  </Card>
);
```

## Testing

### Test Cards
Use these Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`

### Test Environment
```bash
# Use test keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Security Notes

1. **Never expose secret keys** in frontend code
2. **Always verify webhook signatures**
3. **Use HTTPS** in production
4. **Validate amounts** server-side
5. **Implement proper error handling**

## Production Deployment

1. **Update environment variables** with live keys
2. **Configure webhook endpoint** with HTTPS
3. **Test end-to-end** with small amounts
4. **Monitor Stripe Dashboard** for payment events

## Benefits

- **Global payments** - Credit/debit cards worldwide
- **Higher conversion** - Users without crypto
- **Recovery options** - Stripe's payment disputes
- **Subscription support** - Future recurring payments
- **Advanced fraud** - Stripe's protection systems
