/**
 * OPTIK Payment Verification Endpoint
 *
 * Receives payment transaction signatures from OPTIK and verifies them
 * through the Factory's payment verification system. Triggers generation
 * after successful verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import SolanaService from '@/utils/SolanaService';
import { nanoid } from 'nanoid';
import { rateLimit } from '@/middleware/rateLimit';
import { createLogger } from '@/utils/logger';

const verifyPaymentSchema = z.object({
  jobId: z.string(), // Factory generationId
  transactionSignature: z.string().min(64).max(128),
  customerEmail: z.string().email().optional(),
});

const logger = createLogger('PaymentVerification');

export async function POST(request: NextRequest) {
  const requestId = nanoid(16);
  const startTime = Date.now();

  // 0. Rate limiting
  const rateLimitResult = rateLimit(request, {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // Verification can be retried a few times
  });

  if (!rateLimitResult.allowed) {
    logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for payment verification');
    return NextResponse.json(
      { success: false, error: 'Too many verification attempts. Please wait.' },
      { status: 429 }
    );
  }

  logger.info({ requestId }, `Payment verification request`);

  try {
    // 1. Validate input
    const json = await request.json();
    const { jobId, transactionSignature, customerEmail } = verifyPaymentSchema.parse(json);

    logger.info(`Verifying payment [${requestId}]`, {
      jobId,
      signature: transactionSignature.substring(0, 16) + '...',
      email: customerEmail,
    });

    // 2. Connect to database
    await connectToDatabase();

    // 3. Find generation
    const generation = await Generation.findOne({ generationId: jobId });

    if (!generation) {
      logger.error(`Generation not found [${requestId}]`, { jobId });
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // 4. Check if already verified
    if (generation.payment.status === 'confirmed') {
      logger.info(`Payment already confirmed [${requestId}]`, { jobId });
      return NextResponse.json({
        success: true,
        verified: true,
        status: generation.status,
        message: 'Payment already confirmed',
      });
    }

    // 5. Verify payment on blockchain
    const verification = await SolanaService.verifyPayment(
      transactionSignature,
      generation.payment.amount,
      generation.walletAddress
    );

    if (!verification.isValid) {
      logger.warn(`Payment verification failed [${requestId}]`, {
        jobId,
        error: verification.error,
        confirmations: verification.confirmations,
      });

      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: verification.error || 'Payment verification failed',
          confirmations: verification.confirmations || 0,
        },
        { status: 400 }
      );
    }

    // 6. Update generation with confirmed payment
    generation.payment.transactionSignature = transactionSignature;
    generation.payment.status = 'confirmed';
    generation.payment.confirmations = verification.confirmations || 0;
    generation.status = 'payment_confirmed';
    generation.timestamps.paymentConfirmed = new Date();

    await generation.save();

    logger.info(`Payment confirmed [${requestId}]`, {
      jobId,
      confirmations: verification.confirmations,
      amount: generation.payment.amount,
    });

    // 7. Trigger generation asynchronously
    // Note: We don't await this - generation happens in background
    triggerGeneration(jobId, requestId).catch(err => {
      logger.error(`Failed to trigger generation [${requestId}]`, err);
    });

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      verified: true,
      status: 'payment_confirmed',
      confirmations: verification.confirmations,
      message: 'Payment verified. Generation starting...',
      estimatedCompletionMinutes: generation.tier === 'enterprise' ? 90 :
        generation.tier === 'professional' ? 60 : 30,
      processingTime: responseTime,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.error(`Validation error [${requestId}]`, error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment verification data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    logger.error(`Payment verification error [${requestId}] after ${responseTime}ms`, error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * Triggers generation process by calling the generate endpoint
 */
async function triggerGeneration(generationId: string, requestId: string): Promise<void> {
  logger.info(`Triggering generation [${requestId}]`, { generationId });

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
    const response = await fetch(`${baseUrl}/api/generations/${generationId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Request': 'true', // Mark as internal
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Generation trigger failed: ${error.error || response.statusText}`);
    }

    const result = await response.json();
    logger.info(`Generation triggered successfully [${requestId}]`, {
      generationId,
      status: result.status,
    });

  } catch (error) {
    logger.error(`Generation trigger error [${requestId}]`, error);
    // Don't throw - this is async, we've already responded to the client
    // The error will be logged and generation can be manually triggered if needed
  }
}
