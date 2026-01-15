import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import SolanaService from '@/utils/SolanaService';
import { PublicKey } from '@solana/web3.js';
import { z } from 'zod';

const mintTokenSchema = z.object({
  generationId: z.string(),
  paymentSignature: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { generationId, paymentSignature } = mintTokenSchema.parse(body);

    await connectToDatabase();

    const generation = await Generation.findOne({ generationId });

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      );
    }

    if (!generation.tokenConfig) {
      return NextResponse.json(
        { success: false, error: 'No token configuration found' },
        { status: 400 }
      );
    }

    if (generation.tokenConfig.tokenAddress) {
      return NextResponse.json(
        { success: false, error: 'Token already minted' },
        { status: 400 }
      );
    }

    const mintingPrice = parseFloat(process.env.NEXT_PUBLIC_TOKEN_MINTING_PRICE_SOL || '0.3');

    const paymentVerification = await SolanaService.verifyPayment(
      paymentSignature,
      mintingPrice,
      generation.walletAddress
    );

    if (!paymentVerification.isValid) {
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    const mintAuthority = new PublicKey(generation.walletAddress);

    const tokenResult = await SolanaService.createToken({
      name: generation.tokenConfig.name,
      symbol: generation.tokenConfig.symbol,
      decimals: generation.tokenConfig.decimals,
      totalSupply: generation.tokenConfig.totalSupply,
      mintAuthority,
      freezeAuthority: generation.tokenConfig.freezeAuthority
        ? new PublicKey(generation.tokenConfig.freezeAuthority)
        : undefined,
      metadataUri: generation.tokenConfig.metadataUri,
    });

    if (tokenResult.error) {
      return NextResponse.json(
        { success: false, error: tokenResult.error },
        { status: 500 }
      );
    }

    generation.tokenConfig.tokenAddress = tokenResult.mintAddress;
    generation.tokenConfig.mintAuthority = generation.walletAddress;

    await generation.save();

    return NextResponse.json({
      success: true,
      mintAddress: tokenResult.mintAddress,
      signature: tokenResult.signature,
      explorerUrl: `https://explorer.solana.com/address/${tokenResult.mintAddress}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}`,
    });
  } catch (error) {
    console.error('Token minting error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
