// app/api/check-status/[jobId]/route.ts

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
    
    // Read job data
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
    
    // Check if output ZIP exists
    const outputPath = path.join(OPTIK_ROOT, 'output');
    const files = await fs.readdir(outputPath);
    const zipFile = files.find(f => f.includes(jobId) && f.endsWith('.zip'));
    
    const response: any = {
      jobId,
      status: jobData.status,
      createdAt: jobData.createdAt,
      estimatedCompletion: jobData.estimatedCompletion,
      productType: jobData.productType,
      totalPrice: jobData.totalPrice,
    };
    
    if (jobData.status === 'completed' && zipFile) {
      response.downloadUrl = `/api/download/${jobId}`;
      response.completedAt = jobData.completedAt;
      
      // Get file size
      const zipPath = path.join(outputPath, zipFile);
      const stats = await fs.stat(zipPath);
      response.fileSize = stats.size;
      response.fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    }
    
    if (jobData.status === 'failed') {
      response.error = jobData.error || 'Unknown error occurred';
    }
    
    if (jobData.status === 'processing') {
      // Calculate progress (rough estimate based on time elapsed)
      const elapsed = Date.now() - new Date(jobData.createdAt).getTime();
      const totalTime = 90 * 60 * 1000; // 90 minutes
      response.progressPercentage = Math.min(95, Math.floor((elapsed / totalTime) * 100));
      response.currentPhase = estimateCurrentPhase(elapsed);
    }
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status', details: error.message },
      { status: 500 }
    );
  }
}

function estimateCurrentPhase(elapsedMs: number): string {
  const minutes = elapsedMs / 1000 / 60;
  
  if (minutes < 5) return 'Planning & Architecture';
  if (minutes < 15) return 'Smart Contract Development';
  if (minutes < 25) return 'Frontend Development';
  if (minutes < 35) return 'Marketing Content Generation';
  if (minutes < 45) return 'Financial Analysis';
  if (minutes < 60) return 'Security Audit';
  if (minutes < 75) return 'Quality Assurance Testing';
  if (minutes < 85) return 'Documentation Generation';
  return 'Final Packaging';
}