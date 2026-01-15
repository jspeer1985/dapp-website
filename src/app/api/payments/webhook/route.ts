import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import { createLogger } from '@/utils/logger';

const logger = createLogger('StripeWebhook');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const jobId = session.metadata?.jobId;

      if (!jobId) {
        logger.error({ sessionId: session.id }, 'No jobId in Stripe metadata');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      await connectToDatabase();
      const generation = await Generation.findOne({ generationId: jobId });

      if (!generation) {
        logger.error({ jobId }, 'Order record not found during webhook');
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Update generation status
      generation.payment.status = 'confirmed';
      generation.payment.currency = 'USD';
      generation.payment.amount = (session.amount_total || 0) / 100;
      generation.status = 'payment_confirmed';
      generation.timestamps.paymentConfirmed = new Date();
      await generation.save();

      logger.info({ jobId }, 'Revenue Secured: Stripe payment confirmed');

      // Trigger the background AI generation factory
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/generations/${jobId}/generate`, {
        method: 'POST',
        headers: { 'X-Internal-Request': 'true' }
      }).catch(err => logger.error({ jobId, err }, 'Failed to auto-trigger AI generation'));
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Webhook fulfillment failed');
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }
}
