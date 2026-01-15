import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import { createLogger } from '@/utils/logger';

const execAsync = promisify(exec);
const logger = createLogger('LegacyGenerator');

const PIPELINE_ROOT = process.env.OPTIK_PROJECT_ROOT || '/tmp/optik';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const jobId = body.jobId;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const generation = await Generation.findOne({ generationId: jobId });

    if (!generation) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Trigger pipeline asynchronously 
    triggerPipeline(jobId).catch(error => {
      logger.error({ jobId, error: error.message }, 'Pipeline execution failed');
    });

    return NextResponse.json({
      success: true,
      jobId,
      status: 'queued',
      message: 'Background generation started',
    });

  } catch (error: any) {
    logger.error({ error: error.message }, 'Generation trigger error');
    return NextResponse.json(
      { error: 'Failed to trigger generation', details: error.message },
      { status: 500 }
    );
  }
}

async function triggerPipeline(jobId: string) {
  logger.info({ jobId }, 'Starting production pipeline');

  // On Linux, we use a shell script or node command instead of PowerShell
  const scriptPath = process.env.NODE_ENV === 'production'
    ? './scripts/build-dapp.sh'
    : 'echo "Mock build for project"';

  try {
    const { stdout, stderr } = await execAsync(`${scriptPath} ${jobId}`, {
      env: { ...process.env, PROJECT_ID: jobId },
      timeout: 60 * 60 * 1000, // 60 mins
    });

    if (stderr) logger.warn({ jobId, stderr }, 'Pipeline warning');

    logger.info({ jobId, stdout }, 'Pipeline finished successfully');
  } catch (err: any) {
    logger.error({ jobId, error: err.message }, 'Pipeline crash');
  }
}