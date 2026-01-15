import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';

import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import LiquidityPoolService from '@/utils/LiquidityPoolService';

const createLPSchema = z.object({
  generationId: z.string(),
  tokenMint: z.string(),
  tokenAmount: z.number().positive(),
  solAmount: z.number().positive().min(0.1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createLPSchema.parse(body);

    await connectToDatabase();

    // Fetch generation
    const generation = await Generation.findOne({ generationId: validated.generationId });

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      );
    }

    // Verify payment is confirmed
    if (generation.payment.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'Payment not confirmed' },
        { status: 400 }
      );
    }

    // Verify token exists
    if (!generation.tokenConfig?.tokenAddress) {
      return NextResponse.json(
        { success: false, error: 'Token not created yet' },
        { status: 400 }
      );
    }

    // Validate LP config
    const validation = LiquidityPoolService.validateLPConfig({
      tokenMint: new PublicKey(validated.tokenMint),
      tokenAmount: validated.tokenAmount,
      solAmount: validated.solAmount,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Update generation with LP config
    if (!generation.liquidityPoolConfig) {
      generation.liquidityPoolConfig = {
        enabled: true,
        tokenAmount: validated.tokenAmount,
        solAmount: validated.solAmount,
        status: 'pending',
      };
    }
    generation.liquidityPoolConfig.status = 'creating';
    await generation.save();

    // Create liquidity pool
    const result = await LiquidityPoolService.createLiquidityPool(
      new PublicKey(generation.walletAddress),
      {
        tokenMint: new PublicKey(validated.tokenMint),
        tokenAmount: validated.tokenAmount,
        solAmount: validated.solAmount,
      }
    );

    if (result.success) {
      // Update generation with LP info
      generation.liquidityPoolConfig.status = 'created';
      generation.liquidityPoolConfig.poolId = result.poolId;
      generation.liquidityPoolConfig.lpTokenMint = result.lpTokenMint;
      generation.liquidityPoolConfig.transactionSignature = result.signature;
      generation.liquidityPoolConfig.createdAt = new Date();
      await generation.save();

      return NextResponse.json({
        success: true,
        poolId: result.poolId,
        lpTokenMint: result.lpTokenMint,
        signature: result.signature,
      });
    } else {
      // Mark as failed
      generation.liquidityPoolConfig.status = 'failed';
      generation.liquidityPoolConfig.error = result.error;
      await generation.save();

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to create liquidity pool',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('LP creation API error:', error);

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const generationId = searchParams.get('generationId');

    if (!generationId) {
      return NextResponse.json(
        { success: false, error: 'Generation ID required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const generation = await Generation.findOne({ generationId });

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      );
    }

    // Return estimated costs
    const costs = await LiquidityPoolService.estimatePoolCreationCost();

    return NextResponse.json({
      success: true,
      lpConfig: generation.liquidityPoolConfig,
      estimatedCosts: costs,
    });
  } catch (error) {
    console.error('LP info API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
