import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import FilePackagingService from '@/utils/FilePackagingService';
import RefundService from '@/utils/RefundService';
import { z } from 'zod';
import { sendCompletionEmail } from '@/lib/email';

const approveSchema = z.object({
  generationId: z.string(),
  action: z.enum(['approve', 'reject']),
  reviewNotes: z.string().optional(),
  reviewedBy: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { generationId, action, reviewNotes, reviewedBy } = approveSchema.parse(body);

    await connectToDatabase();

    const generation = await Generation.findOne({ generationId });

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      );
    }

    if (generation.status !== 'review_required') {
      return NextResponse.json(
        { success: false, error: 'Generation not pending review' },
        { status: 400 }
      );
    }

    generation.compliance.reviewedBy = reviewedBy;
    generation.compliance.reviewedAt = new Date();
    generation.compliance.reviewNotes = reviewNotes;

    if (action === 'approve') {
      generation.compliance.whitelistStatus = 'approved';
      generation.status = 'approved';
      generation.timestamps.approved = new Date();

      if (generation.generatedCode) {
        const packageResult = await FilePackagingService.packageProject({
          generationId: generation.generationId,
          projectName: generation.projectName,
          files: generation.generatedCode.files,
          packageJson: generation.generatedCode.packageJson,
          readme: generation.generatedCode.readme || '',
        });

        generation.downloadInfo = {
          zipUrl: packageResult.zipPath,
          downloadToken: packageResult.downloadToken,
          expiresAt: packageResult.expiresAt,
          downloadCount: 0,
          maxDownloads: 10,
        };

        generation.status = 'completed';

        // Send approval + download email (non-blocking)
        if (generation.customerInfo?.email && generation.downloadInfo?.downloadToken) {
          sendCompletionEmail({
            customerEmail: generation.customerInfo.email,
            customerName: generation.customerInfo.fullName,
            jobId: generation.generationId,
            productType: generation.projectType,
            downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/download/${generation.downloadInfo.downloadToken}`,
            fileSizeMB: '4.5',
            completedAt: new Date().toISOString(),
          }).catch(err => console.error('Email error (non-critical):', err));
        }
      }

      await generation.save();

      return NextResponse.json({
        success: true,
        message: 'Generation approved',
        status: generation.status,
      });
    } else {
      generation.compliance.whitelistStatus = 'rejected';
      generation.status = 'failed';

      await generation.save();

      const refundResult = await RefundService.processRefund({
        generationId: generation.generationId,
        reason: 'Failed compliance review',
        adminNotes: reviewNotes,
      });

      return NextResponse.json({
        success: true,
        message: 'Generation rejected and refunded',
        refunded: refundResult.success,
        refundSignature: refundResult.signature,
      });
    }
  } catch (error) {
    console.error('Approve/reject error:', error);

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
