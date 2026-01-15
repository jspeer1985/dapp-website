// app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { sendPaymentConfirmationEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const OPTIK_ROOT = process.env.OPTIK_PROJECT_ROOT || 'C:\\optik-dapp-factory';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature')!;
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const jobId = session.metadata?.jobId;
        
        if (!jobId) {
          console.error('No jobId in session metadata');
          break;
        }
        
        console.log(`Payment completed for job ${jobId}`);
        
        // Update job status to "paid"
        const jobPath = path.join(OPTIK_ROOT, 'jobs', `${jobId}.json`);
        const jobData = JSON.parse(await fs.readFile(jobPath, 'utf-8'));
        
        jobData.paymentStatus = 'paid';
        jobData.paymentMethod = 'stripe';
        jobData.stripeSessionId = session.id;
        jobData.paidAt = new Date().toISOString();
        
        await fs.writeFile(jobPath, JSON.stringify(jobData, null, 2));
        
        // Send payment confirmation email
        await sendPaymentConfirmationEmail({
          customerEmail: jobData.customerEmail,
          customerName: jobData.customerName,
          jobId,
          amount: jobData.totalPrice,
          paymentMethod: 'stripe',
          transactionId: session.id,
        });
        
        break;
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const jobId = session.metadata?.jobId;
        
        if (jobId) {
          console.log(`Payment session expired for job ${jobId}`);
          // Optionally update job status
        }
        
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}
