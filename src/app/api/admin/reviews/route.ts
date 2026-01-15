import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const pendingReviews = await Generation.find({
      status: 'review_required',
      'compliance.whitelistStatus': 'pending',
    }).sort({ 'timestamps.created': 1 });

    const reviews = pendingReviews.map(gen => ({
      generationId: gen.generationId,
      projectName: gen.projectName,
      projectDescription: gen.projectDescription,
      walletAddress: gen.walletAddress,
      riskScore: gen.compliance.riskScore,
      flags: gen.compliance.flags,
      createdAt: gen.timestamps.created,
      totalFiles: gen.generatedCode?.totalFiles || 0,
      totalLines: gen.generatedCode?.totalLines || 0,
    }));

    return NextResponse.json({
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
