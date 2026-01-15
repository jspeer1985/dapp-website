import SolanaService from './SolanaService';
import Generation from '@/models/Generation';
import { connectToDatabase } from '@/lib/mongodb';

export class RefundService {
  async processRefund(params: {
    generationId: string;
    reason: string;
    adminNotes?: string;
  }): Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }> {
    try {
      await connectToDatabase();

      const generation = await Generation.findOne({ generationId: params.generationId });

      if (!generation) {
        return {
          success: false,
          error: 'Generation not found',
        };
      }

      if (generation.payment.status === 'refunded') {
        return {
          success: false,
          error: 'Already refunded',
        };
      }

      if (generation.payment.status !== 'confirmed') {
        return {
          success: false,
          error: 'Payment not confirmed, cannot refund',
        };
      }

      const refundResult = await SolanaService.processRefund({
        recipientAddress: generation.walletAddress,
        amount: generation.payment.amount,
        reason: params.reason,
      });

      if (!refundResult.success) {
        return {
          success: false,
          error: refundResult.error,
        };
      }

      generation.payment.status = 'refunded';
      generation.status = 'refunded';
      generation.errors.push({
        stage: 'refund',
        message: `Refund processed: ${params.reason}`,
        timestamp: new Date(),
      });

      await generation.save();

      return {
        success: true,
        signature: refundResult.signature,
      };
    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async processAutoRefunds(): Promise<void> {
    try {
      await connectToDatabase();

      const failedGenerations = await Generation.find({
        status: 'failed',
        'payment.status': 'confirmed',
        'timestamps.created': {
          $lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      });

      console.log(`Found ${failedGenerations.length} failed generations to refund`);

      for (const generation of failedGenerations) {
        const result = await this.processRefund({
          generationId: generation.generationId,
          reason: 'Automatic refund for failed generation',
        });

        if (result.success) {
          console.log(`Auto-refunded generation ${generation.generationId}`);
        } else {
          console.error(`Failed to auto-refund ${generation.generationId}:`, result.error);
        }
      }
    } catch (error) {
      console.error('Auto-refund error:', error);
    }
  }
}

export default new RefundService();
