export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

export interface PaymentInfo {
  amount: number;
  currency: 'SOL';
  transactionSignature: string;
  status: PaymentStatus;
  timestamp: Date;
  confirmations: number;
}

export interface PaymentVerification {
  isValid: boolean;
  confirmations: number;
  actualAmount?: number;
  error?: string;
}

export interface RefundRequest {
  generationId: string;
  reason: string;
  adminNotes?: string;
}

export interface RefundResult {
  success: boolean;
  signature?: string;
  error?: string;
}
