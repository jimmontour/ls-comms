import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduledPost extends Document {
  teamId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  content: string;
  mediaUrls?: string[];
  scheduledFor: Date;
  accounts: {
    accountId: mongoose.Types.ObjectId;
    platform: string;
  }[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishedAt?: Date;
  publishedPostIds?: {
    platform: string;
    postId: string;
  }[];
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scheduledPostSchema = new Schema<IScheduledPost>({
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mediaUrls: [String],
  scheduledFor: { type: Date, required: true },
  accounts: [{
    accountId: { type: Schema.Types.ObjectId, ref: 'ConnectedAccount' },
    platform: String
  }],
  status: { type: String, enum: ['draft', 'scheduled', 'published', 'failed'], default: 'draft' },
  publishedAt: Date,
  publishedPostIds: [{
    platform: String,
    postId: String
  }],
  errorMessage: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

scheduledPostSchema.index({ teamId: 1, scheduledFor: 1, status: 1 });

export default mongoose.model<IScheduledPost>('ScheduledPost', scheduledPostSchema);
