import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const generation = await Generation.findOne({ generationId: params.id });

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      generation: {
        generationId: generation.generationId,
        projectName: generation.projectName,
        projectType: generation.projectType,
        status: generation.status,
        payment: {
          amount: generation.payment.amount,
          status: generation.payment.status,
          confirmations: generation.payment.confirmations,
        },
        compliance: {
          riskScore: generation.compliance.riskScore,
          whitelistStatus: generation.compliance.whitelistStatus,
        },
        timestamps: generation.timestamps,
        downloadInfo: generation.downloadInfo ? {
          canDownload: generation.canDownload(),
          expiresAt: generation.downloadInfo.expiresAt,
          downloadsRemaining: generation.downloadInfo.maxDownloads - generation.downloadInfo.downloadCount,
        } : null,
        downloadToken: generation.downloadInfo?.downloadToken || null,
      },
    });
  } catch (error) {
    console.error('Get generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
