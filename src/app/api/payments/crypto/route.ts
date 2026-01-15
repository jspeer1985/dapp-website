// app/api/payment/crypto/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fs from 'fs/promises';
import path from 'path';
import { sendPaymentConfirmationEmail } from '@/lib/email';

const OPTIK_ROOT = process.env.OPTIK_PROJECT_ROOT || 'C:\\optik-dapp-factory';
const OPTIK_TREASURY_WALLET = process.env.OPTIK_TREASURY_WALLET!;
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

const connection = new Connection(SOLANA_RPC, 'confirmed');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, transactionSignature } = body;
    
    if (!transactionSignature) {
      return NextResponse.json(
        { error: 'Transaction signature required' },
        { status: 400 }
      );
    }
    
    // Verify transaction
    console.log(`Verifying transaction: ${transactionSignature}`);
    
    const transaction = await connection.getParsedTransaction(
      transactionSignature,
      { maxSupportedTransactionVersion: 0 }
    );
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Verify transaction was successful
    if (transaction.meta?.err) {
      return NextResponse.json(
        { error: 'Transaction failed', details: transaction.meta.err },
        { status: 400 }
      );
    }
    
    // Get job data to check expected amount
    const jobPath = path.join(OPTIK_ROOT, 'jobs', `${jobId}.json`);
    const jobData = JSON.parse(await fs.readFile(jobPath, 'utf-8'));
    
    // Verify payment amount and recipient
    const instructions = transaction.transaction.message.instructions;
    let paymentVerified = false;
    let paidAmount = 0;
    
    for (const instruction of instructions) {
      if ('parsed' in instruction && instruction.parsed?.type === 'transfer') {
        const info = instruction.parsed.info;
        
        if (
          info.destination === OPTIK_TREASURY_WALLET &&
          info.lamports >= (jobData.totalPrice * LAMPORTS_PER_SOL * 0.95) // Allow 5% tolerance for slippage
        ) {
          paymentVerified = true;
          paidAmount = info.lamports / LAMPORTS_PER_SOL;
          break;
        }
      }
    }
    
    if (!paymentVerified) {
      return NextResponse.json(
        { error: 'Payment verification failed - incorrect amount or recipient' },
        { status: 400 }
      );
    }
    
    // Update job status
    jobData.paymentStatus = 'paid';
    jobData.paymentMethod = 'crypto';
    jobData.transactionSignature = transactionSignature;
    jobData.paidAmount = paidAmount;
    jobData.paidAt = new Date().toISOString();
    
    await fs.writeFile(jobPath, JSON.stringify(jobData, null, 2));
    
    console.log(`Payment verified for job ${jobId}: ${paidAmount} SOL`);
    
    // Send payment confirmation email
    await sendPaymentConfirmationEmail({
      customerEmail: jobData.customerEmail,
      customerName: jobData.customerName,
      jobId,
      amount: paidAmount,
      paymentMethod: 'crypto',
      transactionId: transactionSignature,
    });
    
    return NextResponse.json({
      success: true,
      verified: true,
      amount: paidAmount,
      message: 'Payment verified successfully',
    });
    
  } catch (error: any) {
    console.error('Crypto payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error.message },
      { status: 500 }
    );
  }
}
