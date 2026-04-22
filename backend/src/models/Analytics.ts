import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  postId: mongoose.Types.ObjectId;
  platform: string;
  platformPostId: string;
  likes: number;
  comments: number;
  shares: number;
  impressions?: number;
  reach?: number;
  engagementRate?: number;
  syncedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>({
  postId: { type: Schema.Types.ObjectId, ref: 'ScheduledPost', required: true },
  platform: { type: String, required: true },
  platformPostId: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  impressions: Number,
  reach: Number,
  engagementRate: Number,
  syncedAt: { type: Date, default: Date.now }
});

analyticsSchema.index({ postId: 1, platform: 1 });

export default mongoose.model<IAnalytics>('Analytics', analyticsSchema);
