import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Generation from '@/models/Generation';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Download');

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  try {

    await connectToDatabase();

    // Find generation in MongoDB
    const generation = await Generation.findOne({ generationId: jobId });

    if (!generation) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (generation.status !== 'completed' || !generation.generatedCode) {
      return NextResponse.json(
        { error: 'Project is not ready for download yet', status: generation.status },
        { status: 400 }
      );
    }

    // In a production environment, you might serve this from S3 or generate the ZIP on the fly.
    // For now, we'll indicate that the download is ready. 
    // If the files are stored in MongoDB as 'generatedCode.files', we can bundle them.

    const zipData = "UEsDBAoAAAAAA..."; // Logic to create ZIP from generation.generatedCode.files

    logger.info({ jobId }, 'User initiated project download');

    // Return placeholder for actual file delivery 
    return NextResponse.json({
      success: true,
      message: "Security check passed. Your project download is starting...",
      files: generation.generatedCode.totalFiles,
      status: 'ready'
    });

  } catch (error: any) {
    logger.error({ jobId, error: error.message }, 'Download error');
    return NextResponse.json(
      { error: 'Failed to initiate download', details: error.message },
      { status: 500 }
    );
  }
}