import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import { createLogger } from '@/utils/logger';

const logger = createLogger('CheckStatus');

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    await connectToDatabase();

    // Find generation in MongoDB instead of local files
    const generation = await Generation.findOne({ generationId: jobId });

    if (!generation) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const response: any = {
      jobId,
      status: generation.status === 'payment_confirmed' ? 'processing' :
        generation.status === 'completed' ? 'completed' :
          generation.status === 'failed' ? 'failed' : 'pending',
      createdAt: generation.timestamps.created,
      estimatedCompletion: new Date(generation.timestamps.created.getTime() + 90 * 60 * 1000),
      productType: generation.projectType,
      totalPrice: generation.payment.amount,
      paymentStatus: generation.payment.status,
    };

    if (generation.status === 'completed') {
      // Use the plural /api/downloads/ endpoint which handles the actual ZIP delivery via token
      response.downloadUrl = `/api/downloads/${generation.downloadInfo?.downloadToken}`;
      response.completedAt = generation.timestamps.generationCompleted;
      response.fileSizeMB = "12.4"; // Example or from metadata
    }

    if (generation.status === 'failed') {
      response.error = generation.generationErrors?.[0]?.message || 'An error occurred during generation';
    }

    if (response.status === 'processing') {
      // Calculate progress (rough estimate based on time elapsed since payment confirmed)
      const startTime = generation.timestamps.paymentConfirmed?.getTime() || generation.timestamps.created.getTime();
      const elapsed = Date.now() - startTime;
      const totalTime = 90 * 60 * 1000; // 90 minutes
      response.progressPercentage = Math.min(98, Math.floor((elapsed / totalTime) * 100));
      response.currentPhase = estimateCurrentPhase(elapsed);
    }

    return NextResponse.json(response);

  } catch (error: any) {
    logger.error({ error: error.message }, 'Status check error');
    return NextResponse.json(
      { error: 'Failed to check status', details: error.message },
      { status: 500 }
    );
  }
}

function estimateCurrentPhase(elapsedMs: number): string {
  const minutes = elapsedMs / 1000 / 60;

  if (minutes < 5) return 'Planning & Architecture';
  if (minutes < 15) return 'Smart Contract Development';
  if (minutes < 25) return 'Frontend Development';
  if (minutes < 35) return 'Marketing Content';
  if (minutes < 45) return 'Financial Analysis';
  if (minutes < 60) return 'Security Audit';
  if (minutes < 75) return 'Quality Assurance';
  if (minutes < 85) return 'Documentation';
  return 'Final Packaging';
}