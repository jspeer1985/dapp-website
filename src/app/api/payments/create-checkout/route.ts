import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit } from '@/middleware/rateLimit';
import { createLogger } from '@/utils/logger';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const logger = createLogger('StripeCheckout');

export async function POST(request: NextRequest) {
  // 0. Rate limiting
  const rateLimitResult = rateLimit(request, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
  });

  if (!rateLimitResult.allowed) {
    logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for checkout creation');
    return NextResponse.json(
      { error: 'Too many checkout attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { jobId, customerEmail } = body;

    await connectToDatabase();
    const generation = await Generation.findOne({ generationId: jobId });

    if (!generation) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { tier, projectType } = generation;

    // Map product and tier to the correct .env variable
    // Keys: TOKEN_ONLY, DAPP_ONLY, BUNDLE (matches DAppCreationForm logic)
    const productKey = projectType === 'both' ? 'BUNDLE' :
      projectType === 'token' ? 'TOKEN' : 'DAPP';
    const tierKey = tier.toUpperCase(); // STARTER, PROFESSIONAL, ENTERPRISE

    const envVarName = `NEXT_PUBLIC_STRIPE_${productKey}_${tierKey}_PRICE_ID`;
    const priceId = process.env[envVarName];

    if (!priceId) {
      logger.error({ envVarName, jobId }, 'Missing Stripe Price ID in environment variables');
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    // Add Liquidity Pool fee if enabled
    if (generation.liquidityPoolConfig?.enabled) {
      const lpPriceId = process.env.NEXT_PUBLIC_STRIPE_LP_FEE_PRICE_ID;
      if (lpPriceId) {
        line_items.push({
          price: lpPriceId,
          quantity: 1,
        });
      } else {
        logger.warn({ jobId }, 'Liquidity Pool enabled but NEXT_PUBLIC_STRIPE_LP_FEE_PRICE_ID missing');
      }
    }

    logger.info({ jobId, customerEmail, priceId, hasLP: !!generation.liquidityPoolConfig?.enabled }, 'Creating Stripe checkout session');

    // Create Stripe checkout session using a pre-defined Price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/success?id=${jobId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/cancelled?job_id=${jobId}`,
      customer_email: customerEmail,
      metadata: {
        jobId,
        productType: projectType,
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