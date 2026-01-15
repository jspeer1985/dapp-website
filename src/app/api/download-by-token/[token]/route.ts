import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectToDatabase();

    // Find generation by download token
    const generation = await Generation.findOne({
      'downloadInfo.downloadToken': params.token,
    });

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired download link' },
        { status: 404 }
      );
    }

    // Check if download is allowed
    if (!generation.canDownload()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Download not available. Link may have expired or download limit reached.',
        },
        { status: 403 }
      );
    }

    // Check if file exists
    if (!generation.downloadInfo) {
      return NextResponse.json(
        { success: false, error: 'Download not available' },
        { status: 404 }
      );
    }
    
    const filePath = generation.downloadInfo.zipUrl;
    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Increment download count
    generation.downloadInfo.downloadCount += 1;
    await generation.save();

    // Return file
    const fileName = `${generation.projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${generation.generationId}.zip`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
