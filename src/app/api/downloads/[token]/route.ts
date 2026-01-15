import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import FilePackagingService from '@/utils/FilePackagingService';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectToDatabase();

    const generation = await Generation.findOne({
      'downloadInfo.downloadToken': params.token,
    });

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Invalid download token' },
        { status: 404 }
      );
    }

    if (!generation.canDownload()) {
      return NextResponse.json(
        { success: false, error: 'Download expired or limit reached' },
        { status: 403 }
      );
    }

    const fileBuffer = await FilePackagingService.getDownloadFile(
      generation.downloadInfo!.zipUrl
    );

    await generation.incrementDownloadCount();

    const sanitizedName = generation.projectName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${sanitizedName}.zip"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: 'Download failed' },
      { status: 500 }
    );
  }
}
