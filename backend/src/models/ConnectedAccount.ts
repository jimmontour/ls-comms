import mongoose, { Schema, Document } from 'mongoose';

export interface IConnectedAccount extends Document {
  userId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  platform: 'facebook' | 'instagram' | 'x' | 'linkedin';
  accountId: string;
  accountName: string;
  accountImage?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  connectedAt: Date;
  lastSyncAt?: Date;
}

const connectedAccountSchema = new Schema<IConnectedAccount>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  platform: { type: String, enum: ['facebook', 'instagram', 'x', 'linkedin'], required: true },
  accountId: { type: String, required: true },
  accountName: { type: String, required: true },
  accountImage: String,
  accessToken: { type: String, required: true },
  refreshToken: String,
  expiresAt: Date,
  connectedAt: { type: Date, default: Date.now },
  lastSyncAt: Date
});

connectedAccountSchema.index({ userId: 1, platform: 1, accountId: 1 }, { unique: true });

export default mongoose.model<IConnectedAccount>('ConnectedAccount', connectedAccountSchema);
