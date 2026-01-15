// app/api/download/[jobId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const OPTIK_ROOT = process.env.OPTIK_PROJECT_ROOT || 'C:\\optik-dapp-factory';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    // Verify job exists and is completed
    const jobPath = path.join(OPTIK_ROOT, 'jobs', `${jobId}.json`);
    let jobData;
    
    try {
      jobData = JSON.parse(await fs.readFile(jobPath, 'utf-8'));
    } catch (error) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    if (jobData.status !== 'completed') {
      return NextResponse.json(
        { error: 'Job not completed yet', status: jobData.status },
        { status: 400 }
      );
    }
    
    // Find ZIP file
    const outputPath = path.join(OPTIK_ROOT, 'output');
    const files = await fs.readdir(outputPath);
    const zipFile = files.find(f => f.includes(jobId) && f.endsWith('.zip'));
    
    if (!zipFile) {
      return NextResponse.json(
        { error: 'Download file not found' },
        { status: 404 }
      );
    }
    
    const zipPath = path.join(outputPath, zipFile);
    const fileBuffer = await fs.readFile(zipPath);
    
    // Log download
    await logDownload(jobId, request.headers.get('x-forwarded-for') || 'unknown');
    
    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${jobData.productType}-${jobId}.zip"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
    
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download file', details: error.message },
      { status: 500 }
    );
  }
}

async function logDownload(jobId: string, ipAddress: string) {
  const logPath = path.join(OPTIK_ROOT, 'logs', 'downloads.log');
  const logEntry = `${new Date().toISOString()} - Job: ${jobId} - IP: ${ipAddress}\n`;
  
  try {
    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.appendFile(logPath, logEntry);
  } catch (error) {
    console.error('Failed to log download:', error);
  }
}