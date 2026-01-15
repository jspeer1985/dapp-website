import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  email?: string;
  username?: string;
  reputation: number;
  totalGenerations: number;
  successfulGenerations: number;
  totalSpentSOL: number;
  createdAt: Date;
  lastActive: Date;
  preferences: {
    notifications: boolean;
    defaultAIProvider: 'openai' | 'anthropic';
  };
}

const UserSchema: Schema = new Schema({
  walletAddress: { type: String, required: true, unique: true, index: true },
  email: { type: String, sparse: true },
  username: { type: String, sparse: true },
  reputation: { type: Number, default: 50, min: 0, max: 100 },
  totalGenerations: { type: Number, default: 0 },
  successfulGenerations: { type: Number, default: 0 },
  totalSpentSOL: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  preferences: {
    notifications: { type: Boolean, default: true },
    defaultAIProvider: { type: String, enum: ['openai', 'anthropic'], default: 'openai' },
  },
}, {
  timestamps: true,
});

const User: Model<IUser> = mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);

export default User;
