import mongoose from 'mongoose';

const TemplatePurchaseSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  templateId: {
    type: String,
    required: true,
  },
  templateName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  customerEmail: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  downloadUrl: {
    type: String,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  lastDownloaded: {
    type: Date,
  },
  supportExpiry: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  },
  refundRequested: {
    type: Boolean,
    default: false,
  },
  refundReason: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes for performance
TemplatePurchaseSchema.index({ customerEmail: 1 });
TemplatePurchaseSchema.index({ templateId: 1 });
TemplatePurchaseSchema.index({ status: 1 });
TemplatePurchaseSchema.index({ purchaseDate: -1 });

export default mongoose.models.TemplatePurchase || mongoose.model('TemplatePurchase', TemplatePurchaseSchema);
