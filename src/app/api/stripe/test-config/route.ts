import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function GET() {
  try {
    // Test Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY is not configured' },
        { status: 500 }
      );
    }

    // Test Stripe API connection
    const account = await stripe.accounts.retrieve();
    
    return NextResponse.json({
      success: true,
      stripeConfigured: true,
      accountId: account.id,
      environment: process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'test' : 'live',
      publishableKeyConfigured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    });

  } catch (error) {
    console.error('Stripe configuration test failed:', error);
    return NextResponse.json(
      { 
        error: 'Stripe configuration test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
