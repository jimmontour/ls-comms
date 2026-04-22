import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  accounts: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const teamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  accounts: [{ type: Schema.Types.ObjectId, ref: 'ConnectedAccount' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITeam>('Team', teamSchema);
