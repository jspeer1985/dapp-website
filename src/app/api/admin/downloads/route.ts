import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Find all generations with download info
    const generations = await Generation.find({
      'downloadInfo.downloadToken': { $exists: true }
    })
    .select('generationId projectName projectType downloadInfo timestamps customerInfo')
    .sort({ 'timestamps.created': -1 });

    const downloads = generations.map(gen => ({
      generationId: gen.generationId,
      projectName: gen.projectName,
      projectType: gen.projectType,
      customerEmail: gen.customerInfo?.email,
      downloadToken: gen.downloadInfo?.downloadToken,
      downloadCount: gen.downloadInfo?.downloadCount || 0,
      maxDownloads: gen.downloadInfo?.maxDownloads || 10,
      expiresAt: gen.downloadInfo?.expiresAt,
      canDownload: gen.canDownload(),
      createdAt: gen.timestamps.created,
      status: gen.status,
    }));

    return NextResponse.json({
      success: true,
      downloads,
      total: downloads.length,
    });
  } catch (error) {
    console.error('Get downloads error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch downloads' },
      { status: 500 }
    );
  }
}
