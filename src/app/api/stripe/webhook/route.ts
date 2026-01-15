import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import { createLogger } from '@/utils/logger';

const logger = createLogger('StripeWebhook');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSession(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const jobId = session.metadata?.jobId;
  const productType = session.metadata?.productType;

  logger.info({ jobId, sessionId: session.id }, 'Processing successful Stripe checkout');

  if (!jobId) {
    logger.error('No jobId found in session metadata');
    return;
  }

  try {
    await connectToDatabase();

    const generation = await Generation.findOne({ generationId: jobId });

    if (!generation) {
      logger.error({ jobId }, 'Generation record not found for paying customer');
      return;
    }

    // Update status to paid
    generation.payment.status = 'confirmed';
    generation.payment.currency = 'USD';
    generation.payment.amount = (session.amount_total || 0) / 100;
    generation.status = 'payment_confirmed';
    generation.timestamps.paymentConfirmed = new Date();

    await generation.save();

    logger.info({ jobId }, 'Order marked as PAID via Stripe');

    // Trigger generation asynchronously
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    fetch(`${baseUrl}/api/generations/${jobId}/generate`, {
      method: 'POST',
      headers: { 'X-Internal-Request': 'true' }
    }).catch(err => logger.error({ jobId, err }, 'Failed to trigger background generation'));

  } catch (error) {
    logger.error({ jobId, error }, 'Error fulfilling Stripe order');
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
}
