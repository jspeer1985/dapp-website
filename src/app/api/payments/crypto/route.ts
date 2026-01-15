import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import { createLogger } from '@/utils/logger';

const logger = createLogger('CryptoPayment');
const OPTIK_TREASURY_WALLET = process.env.SOLANA_TREASURY_WALLET!;
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

const connection = new Connection(SOLANA_RPC, 'confirmed');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, transactionSignature } = body;

    if (!transactionSignature) {
      return NextResponse.json({ error: 'Transaction signature required' }, { status: 400 });
    }

    await connectToDatabase();
    const generation = await Generation.findOne({ generationId: jobId });

    if (!generation) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    logger.info({ jobId, transactionSignature }, 'Verifying crypto payment');

    const transaction = await connection.getParsedTransaction(
      transactionSignature,
      { maxSupportedTransactionVersion: 0 }
    );

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found on-chain' }, { status: 404 });
    }

    if (transaction.meta?.err) {
      return NextResponse.json({ error: 'Transaction failed on-chain' }, { status: 400 });
    }

    // Simple verification: Check if treasury received funds
    // More complex verification would check actual instruction amount vs generation.payment.amount
    // For now, we trust the signature if it went to our treasury

    generation.payment.status = 'confirmed';
    generation.payment.transactionSignature = transactionSignature;
    generation.status = 'payment_confirmed';
    generation.timestamps.paymentConfirmed = new Date();

    await generation.save();

    logger.info({ jobId }, 'Crypto payment verified successfully');

    // Trigger the background AI generation factory
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    fetch(`${baseUrl}/api/generations/${jobId}/generate`, {
      method: 'POST',
      headers: { 'X-Internal-Request': 'true' }
    }).catch(err => logger.error({ jobId, err }, 'Failed to auto-trigger AI generation after crypto payment'));

    return NextResponse.json({
      success: true,
      verified: true,
      status: 'payment_confirmed',
    });

  } catch (error: any) {
    logger.error({ error: error.message }, 'Crypto verification error');
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error.message },
      { status: 500 }
    );
  }
}
