import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGeneration extends Document {
  generationId: string;
  userId?: string;
  walletAddress: string;
  projectName: string;
  projectDescription: string;
  projectType: 'dapp' | 'token' | 'both';
  tier: 'starter' | 'professional' | 'enterprise';

  customerInfo?: {
    email: string;
    fullName: string;
    telegramHandle?: string;
  };

  aiConfig: {
    provider: 'openai' | 'anthropic';
    model: string;
    prompt: string;
    temperature: number;
  };

  tokenConfig?: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
    mintAuthority: string;
    freezeAuthority?: string;
    tokenAddress?: string;
    metadataUri?: string;
  };

  liquidityPoolConfig?: {
    enabled: boolean;
    tokenAmount: number;
    solAmount: number;
    poolId?: string;
    lpTokenMint?: string;
    createdAt?: Date;
    transactionSignature?: string;
    status: 'pending' | 'creating' | 'created' | 'failed';
    error?: string;
  };

  payment: {
    amount: number;
    currency: 'SOL' | 'USD';
    transactionSignature?: string;
    status: 'pending' | 'confirmed' | 'failed' | 'refunded';
    timestamp: Date;
    confirmations: number;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
  };

  status: 'pending_payment' | 'payment_confirmed' | 'generating' | 'review_required' |
  'whitelist_pending' | 'approved' | 'deploying' | 'completed' | 'failed' | 'refunded';

  generatedCode?: {
    files: Array<{
      path: string;
      content: string;
      language: string;
    }>;
    packageJson?: any;
    readme?: string;
    totalFiles: number;
    totalLines: number;
  };

  compliance: {
    riskScore: number;
    flags: Array<{
      type: 'security' | 'legal' | 'content';
      severity: 'low' | 'medium' | 'high';
      message: string;
      timestamp: Date;
    }>;
    whitelistStatus: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewNotes?: string;
  };

  downloadInfo?: {
    zipUrl: string;
    downloadToken: string;
    expiresAt: Date;
    downloadCount: number;
    maxDownloads: number;
    lastDownloadedAt?: Date;
  };

  deployment?: {
    network: 'devnet' | 'mainnet-beta';
    deployedAt?: Date;
    contractAddress?: string;
    verificationUrl?: string;
  };

  ipAddress: string;
  userAgent: string;

  timestamps: {
    created: Date;
    paymentConfirmed?: Date;
    generationStarted?: Date;
    generationCompleted?: Date;
    approved?: Date;
    deployed?: Date;
  };

  generationErrors: Array<{
    stage: string;
    message: string;
    stack?: string;
    timestamp: Date;
  }>;

  analytics: {
    generationTimeMs?: number;
    tokensUsed?: number;
    costUSD?: number;
  };

  canDownload(): boolean;
  incrementDownloadCount(): Promise<IGeneration>;
}

const GenerationSchema: Schema = new Schema({
  generationId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, index: true },
  walletAddress: { type: String, required: true, index: true },

  projectName: { type: String, required: true },
  projectDescription: { type: String, required: true },
  projectType: { type: String, enum: ['dapp', 'token', 'both'], required: true },
  tier: { type: String, enum: ['starter', 'professional', 'enterprise'], required: true },

  customerInfo: {
    email: { type: String, lowercase: true, trim: true },
    fullName: { type: String },
    telegramHandle: { type: String },
  },

  aiConfig: {
    provider: { type: String, enum: ['openai', 'anthropic'], required: true },
    model: { type: String, required: true },
    prompt: { type: String, required: true },
    temperature: { type: Number, default: 0.7 },
  },

  tokenConfig: {
    name: String,
    symbol: String,
    decimals: { type: Number, default: 9 },
    totalSupply: Number,
    mintAuthority: String,
    freezeAuthority: String,
    tokenAddress: String,
    metadataUri: String,
  },

  liquidityPoolConfig: {
    enabled: { type: Boolean, default: false },
    tokenAmount: Number,
    solAmount: Number,
    poolId: String,
    lpTokenMint: String,
    createdAt: Date,
    transactionSignature: String,
    status: {
      type: String,
      enum: ['pending', 'creating', 'created', 'failed'],
      default: 'pending'
    },
    error: String,
  },

  payment: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'SOL' },
    transactionSignature: { type: String, required: false, unique: true, sparse: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed', 'refunded'],
      default: 'pending',
    },
    timestamp: { type: Date, default: Date.now },
    confirmations: { type: Number, default: 0 },
    stripeSessionId: { type: String, required: false },
    stripePaymentIntentId: { type: String, required: false },
  },

  status: {
    type: String,
    enum: [
      'pending_payment', 'payment_confirmed', 'generating', 'review_required',
      'whitelist_pending', 'approved', 'deploying', 'completed', 'failed', 'refunded'
    ],
    default: 'pending_payment',
    index: true,
  },

  generatedCode: {
    files: [{
      path: String,
      content: String,
      language: String,
    }],
    packageJson: Schema.Types.Mixed,
    readme: String,
    totalFiles: Number,
    totalLines: Number,
  },

  compliance: {
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    flags: [{
      type: { type: String, enum: ['security', 'legal', 'content'] },
      severity: { type: String, enum: ['low', 'medium', 'high'] },
      message: String,
      timestamp: { type: Date, default: Date.now },
    }],
    whitelistStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: String,
    reviewedAt: Date,
    reviewNotes: String,
  },

  downloadInfo: {
    zipUrl: String,
    downloadToken: { type: String, unique: true, sparse: true },
    expiresAt: Date,
    downloadCount: { type: Number, default: 0 },
    maxDownloads: { type: Number, default: 10 },
    lastDownloadedAt: Date,
  },

  deployment: {
    network: { type: String, enum: ['devnet', 'mainnet-beta'] },
    deployedAt: Date,
    contractAddress: String,
    verificationUrl: String,
  },

  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },

  timestamps: {
    created: { type: Date, default: Date.now, index: true },
    paymentConfirmed: Date,
    generationStarted: Date,
    generationCompleted: Date,
    approved: Date,
    deployed: Date,
  },

  generationErrors: [{
    stage: String,
    message: String,
    stack: String,
    timestamp: { type: Date, default: Date.now },
  }],

  analytics: {
    generationTimeMs: Number,
    tokensUsed: Number,
    costUSD: Number,
  },
}, {
  timestamps: true,
  collection: 'generations',
});

GenerationSchema.index({ walletAddress: 1, 'timestamps.created': -1 });
GenerationSchema.index({ status: 1, 'timestamps.created': -1 });

GenerationSchema.methods.canDownload = function (): boolean {
  if (!this.downloadInfo) return false;
  return (
    this.downloadInfo.downloadCount < this.downloadInfo.maxDownloads &&
    this.downloadInfo.expiresAt > new Date()
  );
};

GenerationSchema.methods.incrementDownloadCount = function (): Promise<IGeneration> {
  this.downloadInfo.downloadCount += 1;
  return this.save();
};

GenerationSchema.statics.findByWallet = function (walletAddress: string) {
  return this.find({ walletAddress }).sort({ 'timestamps.created': -1 });
};

GenerationSchema.statics.findPendingReviews = function () {
  return this.find({
    status: 'review_required',
    'compliance.whitelistStatus': 'pending'
  }).sort({ 'timestamps.created': 1 });
};

const Generation: Model<IGeneration> = mongoose.models.Generation ||
  mongoose.model<IGeneration>('Generation', GenerationSchema);

export default Generation;
