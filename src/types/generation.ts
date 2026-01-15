export type GenerationStatus =
  | 'pending_payment'
  | 'payment_confirmed'
  | 'generating'
  | 'review_required'
  | 'whitelist_pending'
  | 'approved'
  | 'deploying'
  | 'completed'
  | 'failed'
  | 'refunded';

export type ProjectType = 'dapp' | 'token' | 'both';

export type WhitelistStatus = 'pending' | 'approved' | 'rejected';

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface ComplianceFlag {
  type: 'security' | 'legal' | 'content';
  severity: 'low' | 'medium' | 'high';
  message: string;
  file?: string;
  line?: number;
  timestamp: Date;
}

export interface Generation {
  generationId: string;
  walletAddress: string;
  projectName: string;
  projectDescription: string;
  projectType: ProjectType;
  status: GenerationStatus;
  payment: {
    amount: number;
    status: string;
    confirmations: number;
  };
  compliance: {
    riskScore: number;
    whitelistStatus: WhitelistStatus;
    flags: ComplianceFlag[];
  };
  downloadInfo?: {
    canDownload: boolean;
    expiresAt: Date;
    downloadsRemaining: number;
  };
  timestamps: {
    created: Date;
    paymentConfirmed?: Date;
    generationStarted?: Date;
    generationCompleted?: Date;
  };
}
