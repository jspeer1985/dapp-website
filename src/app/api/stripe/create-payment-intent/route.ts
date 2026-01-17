import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeEnvironment, createPaymentIntent } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    // Validate Stripe environment
    validateStripeEnvironment();

    const { amount, paymentMethodId, generationId, customerEmail, productType } = await req.json();

    console.log('Creating payment intent:', { amount, generationId, customerEmail, productType });

    if (!amount || !paymentMethodId || !generationId || !customerEmail) {
      console.error('Missing required fields:', { amount, paymentMethodId, generationId, customerEmail });
      return NextResponse.json(
        { error: 'Missing required fields: amount, paymentMethodId, generationId, and customerEmail are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      console.error('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // Create Payment Intent
    const paymentIntent = await createPaymentIntent({
      amount,
      paymentMethodId,
      generationId,
      customerEmail,
      productType,
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Payment system configuration error. Please contact support.' },
          { status: 500 }
        );
      }
      if (error.message.includes('card')) {
        return NextResponse.json(
          { error: 'Payment method declined. Please try a different card.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create payment. Please try again.' },
      { status: 500 }
    );
  }
}
