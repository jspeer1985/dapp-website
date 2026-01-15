/**
 * OPTIK Status Tracking Endpoint
 *
 * Returns the current status of a generation job in OPTIK-friendly format.
 * Maps Factory's internal statuses to customer-facing status messages.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';

const logger = {
  info: (message: string, data?: any) => {
    console.log(`[OPTIK Status] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message: string, error: any) => {
    console.error(`[OPTIK Status ERROR] ${message}`, error);
  },
};

/**
 * Maps Factory status to OPTIK-friendly status
 */
function mapFactoryStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' {
  const mapping: Record<string, 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'> = {
    'pending_payment': 'pending',
    'payment_confirmed': 'processing',
    'generating': 'processing',
    'review_required': 'processing',
    'whitelist_pending': 'processing',
    'approved': 'processing',
    'deploying': 'processing',
    'completed': 'completed',
    'failed': 'failed',
    'refunded': 'refunded',
  };
  return mapping[status] || 'processing';
}

/**
 * Calculate progress percentage based on status
 */
function calculateProgress(status: string): number {
  const progress: Record<string, number> = {
    'pending_payment': 0,
    'payment_confirmed': 20,
    'generating': 50,
    'review_required': 70,
    'approved': 85,
    'deploying': 95,
    'completed': 100,
    'failed': 0,
    'refunded': 0,
  };
  return progress[status] || 0;
}

/**
 * Map status to customer-facing phase description
 */
function mapStatusToPhase(status: string, tier: string): string {
  const phases: Record<string, string> = {
    'pending_payment': 'Awaiting Payment',
    'payment_confirmed': 'Payment Confirmed - Initializing',
    'generating': tier === 'enterprise' ? 'Advanced AI Development in Progress' :
                  tier === 'professional' ? 'Professional Development in Progress' :
                  'Smart Contract Development',
    'review_required': 'Security Review',
    'whitelist_pending': 'Compliance Verification',
    'approved': 'Final Quality Check',
    'deploying': 'Deployment Preparation',
    'completed': 'Ready for Download',
    'failed': 'Processing Failed',
    'refunded': 'Refund Processed',
  };
  return phases[status] || 'Processing';
}

/**
 * Get customer-facing message based on status
 */
function getStatusMessage(status: string, tier: string): string {
  const messages: Record<string, string> = {
    'pending_payment': 'Please complete payment to begin generation.',
    'payment_confirmed': 'Payment confirmed! Your project is being initialized.',
    'generating': tier === 'enterprise' ?
      'Our advanced AI systems are crafting your enterprise-grade solution with comprehensive features.' :
      tier === 'professional' ?
      'Your professional-tier dApp is being developed with enhanced features and optimizations.' :
      'Your starter dApp is being generated with essential features and best practices.',
    'review_required': 'Your code is undergoing security review to ensure best practices.',
    'whitelist_pending': 'Final compliance checks are being performed.',
    'approved': 'Quality assurance passed! Preparing your download package.',
    'deploying': 'Your project is being packaged for delivery.',
    'completed': 'Your project is ready! Download link is active.',
    'failed': 'An error occurred during processing. Our team has been notified.',
    'refunded': 'Your payment has been refunded. Contact support for details.',
  };
  return messages[status] || 'Your project is being processed.';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;

  logger.info('Status check', { jobId: jobId.substring(0, 16) + '...' });

  try {
    // Connect to database
    await connectToDatabase();

    // Find generation
    const generation = await Generation.findOne({ generationId: jobId });

    if (!generation) {
      logger.error('Generation not found', { jobId });
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Build OPTIK-friendly response
    const status = mapFactoryStatus(generation.status);
    const progress = calculateProgress(generation.status);
    const phase = mapStatusToPhase(generation.status, generation.tier);
    const message = getStatusMessage(generation.status, generation.tier);

    // Calculate estimated completion
    const now = new Date().getTime();
    const created = generation.timestamps.created.getTime();
    const elapsedMinutes = (now - created) / (1000 * 60);
    const estimatedTotalMinutes = generation.tier === 'enterprise' ? 90 :
                                   generation.tier === 'professional' ? 60 : 30;
    const remainingMinutes = Math.max(0, estimatedTotalMinutes - elapsedMinutes);

    // Build download URL if available
    let downloadUrl: string | undefined;
    if (generation.downloadInfo?.downloadToken) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
      downloadUrl = `${baseUrl}/api/download/${generation.downloadInfo.downloadToken}`;
    }

    const response = {
      success: true,
      jobId,
      status,
      rawStatus: generation.status, // Include raw status for debugging
      progress,
      phase,
      message,

      // Timestamps
      createdAt: generation.timestamps.created.toISOString(),
      paymentConfirmedAt: generation.timestamps.paymentConfirmed?.toISOString(),
      generationStartedAt: generation.timestamps.generationStarted?.toISOString(),
      completedAt: generation.timestamps.generationCompleted?.toISOString(),

      // Estimates
      estimatedRemainingMinutes: Math.round(remainingMinutes),
      estimatedCompletionTime: new Date(now + remainingMinutes * 60 * 1000).toISOString(),

      // Project details
      projectName: generation.projectName,
      projectType: generation.projectType,
      tier: generation.tier,

      // Payment info
      payment: {
        amount: generation.payment.amount,
        currency: generation.payment.currency,
        status: generation.payment.status,
        confirmations: generation.payment.confirmations,
      },

      // Download info
      downloadUrl,
      downloadAvailable: !!downloadUrl && generation.canDownload(),
      downloadCount: generation.downloadInfo?.downloadCount || 0,
      downloadLimit: generation.downloadInfo?.maxDownloads || 10,
      downloadExpiresAt: generation.downloadInfo?.expiresAt?.toISOString(),

      // Compliance info (for transparency)
      riskScore: generation.compliance.riskScore,
      reviewStatus: generation.compliance.whitelistStatus,

      // Analytics
      generationTimeMs: generation.analytics.generationTimeMs,
      tokensUsed: generation.analytics.tokensUsed,
    };

    logger.info('Status retrieved', {
      jobId: jobId.substring(0, 16) + '...',
      status,
      progress,
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Status check failed', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve status',
      },
      { status: 500 }
    );
  }
}
