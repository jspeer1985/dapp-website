import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, tierName, price, billing } = body;

    // Validate required fields
    if (!tier || !tierName || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: tier, tierName, price' },
        { status: 400 }
      );
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Invalid price amount' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session with price_data (no pre-configured price ID needed)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tierName} Plan`,
              description: `DappFactory ${tierName} subscription - ${billing || 'monthly'} billing`,
            },
            unit_amount: price * 100, // Convert to cents
            recurring: billing === 'monthly' ? {
              interval: 'month',
            } : billing === 'annual' ? {
              interval: 'year',
            } : undefined,
          },
          quantity: 1,
        },
      ],
      mode: billing ? 'subscription' : 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        tier: tier,
        tierName: tierName,
        price: price.toString(),
        billing: billing || 'one-time',
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
    });

    console.log('Checkout session created:', {
      sessionId: session.id,
      tier,
      tierName,
      price,
      billing
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
