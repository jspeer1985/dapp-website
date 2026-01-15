import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import SolanaService from '@/utils/SolanaService';
import { sendPaymentConfirmationEmail } from '@/lib/email';

const verifyPaymentSchema = z.object({
  generationId: z.string(),
  transactionSignature: z.string(),
});

// Adjust this to match what SolanaService.verifyPayment actually returns
type PaymentVerificationResult = {
  isValid: boolean;
  confirmations?: number;
  error?: string;
};

export async function POST(request: NextRequest) {
  try {
    // Parse and validate body
    const json = await request.json();
    const { generationId, transactionSignature } = verifyPaymentSchema.parse(json);

    // Ensure DB connection
    await connectToDatabase();

    // Look up generation by ID
    const generation = await Generation.findOne({ generationId });

    if (!generation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Generation not found',
        },
        { status: 404 }
      );
    }

    // Make sure payment object exists and has required fields
    if (!generation.payment || typeof generation.payment.amount !== 'number' || !generation.walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Generation payment configuration invalid',
        },
        { status: 400 }
      );
    }

    // If payment already confirmed, short‑circuit
    if (generation.payment.status === 'confirmed') {
      return NextResponse.json({
        success: true,
        message: 'Payment already confirmed',
        status: generation.status,
      });
    }

    // Verify payment on Solana
    const verification = (await SolanaService.verifyPayment(
      transactionSignature,
      generation.payment.amount,
      generation.walletAddress
    )) as PaymentVerificationResult;

    if (!verification.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: verification.error || 'Payment verification failed',
          confirmations: verification.confirmations,
        },
        { status: 400 }
      );
    }

    // Persist payment confirmation
    generation.payment.transactionSignature = transactionSignature;
    generation.payment.status = 'confirmed';
    generation.payment.confirmations = verification.confirmations ?? generation.payment.confirmations;
    generation.status = 'payment_confirmed';
    generation.timestamps.paymentConfirmed = new Date();

    await generation.save();

    // Send payment confirmation email (non-blocking)
    if (generation.customerInfo?.email) {
      sendPaymentConfirmationEmail({
        customerEmail: generation.customerInfo.email,
        customerName: generation.customerInfo.fullName,
        jobId: generation.generationId,
        amount: generation.payment.amount,
        paymentMethod: 'crypto',
        transactionId: transactionSignature,
      }).catch(err => console.error('Email error (non-critical):', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed',
      confirmations: verification.confirmations,
      status: generation.status,
    });
  } catch (error) {
    console.error('Payment verification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
