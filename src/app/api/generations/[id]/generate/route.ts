import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import AIService from '@/utils/AIService';
import FilePackagingService from '@/utils/FilePackagingService';
import { sendCompletionEmail } from '@/lib/email';

export async function POST(
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

    // Ensure nested objects exist
    generation.payment = generation.payment || {};
    generation.generatedCode = generation.generatedCode || {
      files: [],
      totalFiles: 0,
      totalLines: 0,
    };
    generation.compliance = generation.compliance || {
      riskScore: 0,
      flags: [],
      whitelistStatus: 'pending',
    };
    generation.analytics = generation.analytics || {};
    generation.generationErrors = generation.generationErrors || [];

    if (!generation.payment || generation.payment.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'Payment not confirmed' },
        { status: 400 }
      );
    }

    if (generation.status !== 'payment_confirmed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Generation already in progress or completed',
        },
        { status: 400 }
      );
    }

    generation.status = 'generating';
    generation.timestamps = generation.timestamps || {};
    generation.timestamps.generationStarted = new Date();
    await generation.save();

    const startTime = Date.now();

    try {
      // 1) Generate dApp code
      const result = await AIService.generateDApp({
        projectName: generation.projectName,
        projectDescription: generation.projectDescription,
        projectType: generation.projectType,
        features: [],
        tokenConfig: generation.tokenConfig,
      });

      if (
        !result ||
        !Array.isArray(result.files) ||
        typeof result.totalFiles !== 'number'
      ) {
        throw new Error('AI generation returned invalid structure');
      }

      // 2) Security analysis
      const security = await AIService.analyzeCodeSecurity(result.files);

      if (
        !security ||
        typeof security.riskScore !== 'number' ||
        !Array.isArray(security.flags)
      ) {
        throw new Error('Security analysis returned invalid structure');
      }

      generation.generatedCode = {
        files: result.files,
        packageJson: result.packageJson,
        readme: result.readme,
        totalFiles: result.totalFiles,
        totalLines: result.totalLines,
      };

      generation.compliance.riskScore = security.riskScore;
      generation.compliance.flags = security.flags as any;

      const needsReview =
        security.riskScore > 50 ||
        security.flags.some((f: any) => f.severity === 'high');

      if (needsReview) {
        generation.status = 'review_required';
      } else {
        generation.status = 'approved';
        generation.compliance.whitelistStatus = 'approved';
        generation.timestamps.approved = new Date();

        // 3) Package project for download
        const packageResult = await FilePackagingService.packageProject({
          generationId: generation.generationId,
          projectName: generation.projectName,
          files: result.files,
          packageJson: result.packageJson,
          readme: result.readme,
        });

        if (
          !packageResult ||
          !packageResult.zipPath ||
          !packageResult.downloadToken
        ) {
          throw new Error('Packaging returned invalid structure');
        }

        generation.downloadInfo = {
          zipUrl: packageResult.zipPath,
          downloadToken: packageResult.downloadToken,
          expiresAt: packageResult.expiresAt,
          downloadCount: 0,
          maxDownloads: 10,
        };

        generation.status = 'completed';

        // Send completion email (non-blocking)
        if (generation.customerInfo?.email && generation.downloadInfo?.downloadToken) {
          sendCompletionEmail({
            customerEmail: generation.customerInfo.email,
            customerName: generation.customerInfo.fullName,
            jobId: generation.generationId,
            productType: generation.projectType,
            downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/downloads/${generation.downloadInfo.downloadToken}`,
            fileSizeMB: '4.5',
            completedAt: new Date().toISOString(),
          }).catch(err => console.error('Email error (non-critical):', err));
        }
      }

      generation.timestamps.generationCompleted = new Date();
      generation.analytics.generationTimeMs = Date.now() - startTime;
      generation.analytics.tokensUsed = result.tokensUsed || 0;

      await generation.save();

      return NextResponse.json({
        success: true,
        status: generation.status,
        riskScore: security.riskScore,
        needsReview,
      });
    } catch (innerError) {
      console.error('Generation inner error:', innerError);

      generation.status = 'failed';
      generation.generationErrors.push({
        stage: 'generation',
        message:
          innerError instanceof Error
            ? innerError.message
            : 'Unknown generation error',
        stack:
          innerError instanceof Error ? innerError.stack : undefined,
        timestamp: new Date(),
      });

      await generation.save();

      // Bubble up, outer catch will send 500
      throw innerError;
    }
  } catch (error) {
    console.error('Generation error:', error);

    // In dev you can expose the message for easier debugging
    const message =
      error instanceof Error
        ? `Generation failed: ${error.message}`
        : 'Generation failed';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
