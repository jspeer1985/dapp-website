// app/api/payment/create-checkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, totalPrice, customerEmail, productType } = body;
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `OPTIK DApp Factory - ${productType}`,
              description: 'Production-ready Solana token and/or dApp',
              images: ['https://optikecosystem.com/og-image.png'],
            },
            unit_amount: Math.round(totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}&job_id=${jobId}`,
      cancel_url: `${request.headers.get('origin')}/payment/cancelled?job_id=${jobId}`,
      customer_email: customerEmail,
      metadata: {
        jobId,
        productType,
      },
    });
    
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
    
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}