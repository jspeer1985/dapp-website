import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Fetch all generations sorted by newest first
    const jobs = await Generation.find({})
      .sort({ 'timestamps.created': -1 })
      .select(
        'generationId projectName projectType tier status payment.amount payment.status compliance.riskScore compliance.whitelistStatus timestamps.created timestamps.generationCompleted walletAddress customerInfo.email customerInfo.fullName downloadInfo.downloadToken downloadInfo.downloadCount downloadInfo.maxDownloads downloadInfo.expiresAt'
      )
      .lean();

    // Calculate aggregate stats
    const stats = {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending_payment').length,
      processing: jobs.filter(j =>
        ['payment_confirmed', 'generating', 'review_required', 'approved', 'deploying'].includes(j.status)
      ).length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      refunded: jobs.filter(j => j.status === 'refunded').length,
      totalRevenue: jobs
        .filter(j => j.payment?.status === 'confirmed')
        .reduce((sum, j) => sum + (j.payment?.amount || 0), 0),
    };

    return NextResponse.json({
      success: true,
      jobs: jobs.map(job => ({
        generationId: job.generationId,
        projectName: job.projectName,
        projectType: job.projectType,
        tier: job.tier,
        status: job.status,
        paymentAmount: job.payment?.amount,
        paymentStatus: job.payment?.status,
        riskScore: job.compliance?.riskScore,
        whitelistStatus: job.compliance?.whitelistStatus,
        createdAt: job.timestamps?.created,
        completedAt: job.timestamps?.generationCompleted,
        walletAddress: job.walletAddress,
        customerEmail: job.customerInfo?.email,
        customerName: job.customerInfo?.fullName,
        downloadToken: job.downloadInfo?.downloadToken,
        downloadCount: job.downloadInfo?.downloadCount,
        maxDownloads: job.downloadInfo?.maxDownloads,
        canDownload: job.downloadInfo ? (
          job.downloadInfo.downloadCount < job.downloadInfo.maxDownloads && 
          new Date(job.downloadInfo.expiresAt) > new Date()
        ) : false,
        expiresAt: job.downloadInfo?.expiresAt,
      })),
      stats,
    });
  } catch (error) {
    console.error('Admin jobs API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
