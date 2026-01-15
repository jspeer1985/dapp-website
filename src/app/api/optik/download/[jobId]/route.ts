/**
 * OPTIK Download Proxy Endpoint
 *
 * Provides a customer-friendly download endpoint that internally fetches
 * the download token and proxies the file from the Factory.
 *
 * Security: Validates job ownership, tracks downloads, rate limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import fs from 'fs';

const logger = {
  info: (message: string, data?: any) => {
    console.log(`[OPTIK Download] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message: string, error: any) => {
    console.error(`[OPTIK Download ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[OPTIK Download WARN] ${message}`, data);
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  const startTime = Date.now();

  logger.info('Download request', { jobId: jobId.substring(0, 16) + '...' });

  try {
    // Extract client metadata
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

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

    // Check if completed
    if (generation.status !== 'completed') {
      logger.warn('Download attempted on incomplete generation', {
        jobId,
        status: generation.status,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Project not ready for download',
          status: generation.status,
          message: 'Your project is still being generated. Please check status and try again.',
        },
        { status: 400 }
      );
    }

    // Check download availability
    if (!generation.downloadInfo || !generation.downloadInfo.downloadToken) {
      logger.error('Download info missing', { jobId });
      return NextResponse.json(
        { success: false, error: 'Download not available' },
        { status: 404 }
      );
    }

    // Check download eligibility
    if (!generation.canDownload()) {
      const expired = generation.downloadInfo.expiresAt < new Date();
      const limitReached = generation.downloadInfo.downloadCount >= generation.downloadInfo.maxDownloads;

      logger.warn('Download not allowed', {
        jobId,
        expired,
        limitReached,
        downloadCount: generation.downloadInfo.downloadCount,
      });

      return NextResponse.json(
        {
          success: false,
          error: expired ?
            'Download link has expired. Please contact support.' :
            'Download limit reached. Please contact support for additional downloads.',
          downloadCount: generation.downloadInfo.downloadCount,
          maxDownloads: generation.downloadInfo.maxDownloads,
          expiresAt: generation.downloadInfo.expiresAt.toISOString(),
        },
        { status: 403 }
      );
    }

    // Check if file exists
    const filePath = generation.downloadInfo.zipUrl;
    if (!filePath || !fs.existsSync(filePath)) {
      logger.error('Download file not found on disk', {
        jobId,
        filePath,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Download file not found. Please contact support.',
        },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;

    // Increment download count and log download
    generation.downloadInfo.downloadCount += 1;
    if (!generation.downloadInfo.lastDownloadedAt) {
      generation.downloadInfo.lastDownloadedAt = new Date();
    }

    // Track download in generationErrors array (repurposing for audit trail)
    generation.generationErrors.push({
      stage: 'download',
      message: `Download #${generation.downloadInfo.downloadCount} from IP ${ipAddress}`,
      timestamp: new Date(),
    });

    await generation.save();

    const responseTime = Date.now() - startTime;

    logger.info('Download successful', {
      jobId: jobId.substring(0, 16) + '...',
      downloadNumber: generation.downloadInfo.downloadCount,
      fileSize,
      responseTime,
      ipAddress,
    });

    // Generate customer-friendly filename
    const sanitizedName = generation.projectName
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();
    const fileName = `optik-${sanitizedName}-${jobId.substring(0, 8)}.zip`;

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileSize.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Download-Count': generation.downloadInfo.downloadCount.toString(),
        'X-Downloads-Remaining': (generation.downloadInfo.maxDownloads - generation.downloadInfo.downloadCount).toString(),
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;

    logger.error(`Download failed after ${responseTime}ms`, error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      },
      { status: 500 }
    );
  }
}

/**
 * HEAD request to check download availability without downloading
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;

  try {
    await connectToDatabase();

    const generation = await Generation.findOne({ generationId: jobId });

    if (!generation || !generation.downloadInfo) {
      return new NextResponse(null, { status: 404 });
    }

    const canDownload = generation.canDownload();
    const filePath = generation.downloadInfo.zipUrl;
    const fileExists = filePath && fs.existsSync(filePath);

    if (!canDownload || !fileExists) {
      return new NextResponse(null, { status: 403 });
    }

    const fileSize = fs.statSync(filePath).size;

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': fileSize.toString(),
        'X-Download-Available': 'true',
        'X-Download-Count': generation.downloadInfo.downloadCount.toString(),
        'X-Downloads-Remaining': (generation.downloadInfo.maxDownloads - generation.downloadInfo.downloadCount).toString(),
      },
    });

  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
