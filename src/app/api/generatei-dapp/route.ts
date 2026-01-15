// app/api/generate-dapp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { sendOrderConfirmationEmail, sendCompletionEmail } from '@/lib/email';

const execAsync = promisify(exec);

const OPTIK_ROOT = process.env.OPTIK_PROJECT_ROOT || 'C:\\optik-dapp-factory';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate unique job ID
    const jobId = `optik-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    // Validate required fields
    const validation = validateCIF(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.errors },
        { status: 400 }
      );
    }
    
    // Save CIF to file system
    const cifPath = path.join(OPTIK_ROOT, 'customer-cifs', `${jobId}.json`);
    await fs.mkdir(path.dirname(cifPath), { recursive: true });
    await fs.writeFile(
      cifPath,
      JSON.stringify({
        ...body,
        jobId,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }, null, 2)
    );
    
    // Create job tracking record in database (or JSON file for now)
    const jobRecord = {
      jobId,
      customerEmail: body.customerInfo.email,
      customerName: body.customerInfo.fullName,
      productType: body.productType,
      totalPrice: body.meta.totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 90 mins
    };
    
    const jobsPath = path.join(OPTIK_ROOT, 'jobs', `${jobId}.json`);
    await fs.mkdir(path.dirname(jobsPath), { recursive: true });
    await fs.writeFile(jobsPath, JSON.stringify(jobRecord, null, 2));
    
    // Trigger pipeline asynchronously (don't wait for completion)
    triggerPipeline(cifPath, jobId).catch(error => {
      console.error(`Pipeline failed for job ${jobId}:`, error);
      updateJobStatus(jobId, 'failed', error.message);
    });
    
    // Send confirmation email
    await sendOrderConfirmationEmail({
      customerEmail: body.customerInfo.email,
      customerName: body.customerInfo.fullName,
      jobId,
      productType: body.productType,
      totalPrice: body.meta.totalPrice,
      estimatedCompletion: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      jobId,
      status: 'processing',
      estimatedCompletionMinutes: 90,
      trackingUrl: `/track/${jobId}`,
      message: 'Your DApp is being generated. Check your email for updates.',
    });
    
  } catch (error: any) {
    console.error('Order submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process order', details: error.message },
      { status: 500 }
    );
  }
}

// Validation function
function validateCIF(cif: any) {
  const errors: string[] = [];
  
  // Customer info validation
  if (!cif.customerInfo?.fullName) errors.push('Full name required');
  if (!cif.customerInfo?.email || !isValidEmail(cif.customerInfo.email)) {
    errors.push('Valid email required');
  }
  if (!cif.customerInfo?.deliveryWallet || !isValidSolanaAddress(cif.customerInfo.deliveryWallet)) {
    errors.push('Valid Solana wallet address required');
  }
  
  // Product type validation
  if (!['token-only', 'dapp-only', 'token-and-dapp'].includes(cif.productType)) {
    errors.push('Invalid product type');
  }
  
  // Token validation
  if (cif.productType !== 'dapp-only') {
    if (!cif.tokenInfo?.name || cif.tokenInfo.name.length < 3) {
      errors.push('Token name must be at least 3 characters');
    }
    if (!cif.tokenInfo?.symbol || !/^[A-Z]{3,10}$/.test(cif.tokenInfo.symbol)) {
      errors.push('Token symbol must be 3-10 uppercase letters');
    }
    if (!cif.tokenInfo?.totalSupply || BigInt(cif.tokenInfo.totalSupply) <= 0) {
      errors.push('Valid total supply required');
    }
  }
  
  // DApp validation
  if (cif.productType !== 'token-only') {
    if (!cif.dappInfo?.projectName || cif.dappInfo.projectName.length < 3) {
      errors.push('Project name must be at least 3 characters');
    }
    if (!cif.dappInfo?.supportedWallets?.length) {
      errors.push('At least one wallet must be selected');
    }
  }
  
  // LP validation
  if (cif.liquidityPool?.enabled) {
    if (!cif.liquidityPool.desiredLPSize || cif.liquidityPool.desiredLPSize < 10000) {
      errors.push('Minimum LP size is $10,000');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// Trigger PowerShell pipeline
async function triggerPipeline(cifPath: string, jobId: string) {
  await updateJobStatus(jobId, 'processing');
  
  const scriptPath = path.join(OPTIK_ROOT, 'scripts', 'optik-master-pipeline.ps1');
  
  const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -AnthropicApiKey "${ANTHROPIC_API_KEY}" -ProjectRoot "${path.join(OPTIK_ROOT, 'output')}" -Mode production`;
  
  console.log(`[${jobId}] Starting pipeline...`);
  
  // Execute pipeline
  const { stdout, stderr } = await execAsync(command, {
    env: {
      ...process.env,
      OPTIK_CIF_PATH: cifPath,
      OPTIK_JOB_ID: jobId,
    },
    timeout: 120 * 60 * 1000, // 120 minute timeout
  });
  
  if (stderr && !stderr.includes('WARNING')) {
    throw new Error(`Pipeline error: ${stderr}`);
  }
  
  console.log(`[${jobId}] Pipeline completed`);
  await updateJobStatus(jobId, 'completed');
  
  // Send completion email
  const jobData = await getJobData(jobId);
  await sendCompletionEmail({
    customerEmail: jobData.customerEmail,
    customerName: jobData.customerName,
    jobId: jobData.jobId,
    productType: jobData.productType,
    downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/download/${jobId}`,
    fileSizeMB: '45', // Estimated file size
    completedAt: jobData.completedAt || new Date().toISOString(),
  });
  
  return stdout;
}

async function updateJobStatus(jobId: string, status: string, error?: string) {
  const jobPath = path.join(OPTIK_ROOT, 'jobs', `${jobId}.json`);
  
  try {
    const jobData = JSON.parse(await fs.readFile(jobPath, 'utf-8'));
    jobData.status = status;
    jobData.updatedAt = new Date().toISOString();
    
    if (status === 'completed') {
      jobData.completedAt = new Date().toISOString();
    }
    
    if (error) {
      jobData.error = error;
    }
    
    await fs.writeFile(jobPath, JSON.stringify(jobData, null, 2));
  } catch (err) {
    console.error(`Failed to update job status for ${jobId}:`, err);
  }
}

async function getJobData(jobId: string) {
  const jobPath = path.join(OPTIK_ROOT, 'jobs', `${jobId}.json`);
  return JSON.parse(await fs.readFile(jobPath, 'utf-8'));
}