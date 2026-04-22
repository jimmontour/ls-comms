import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  profileImage?: string;
  teams: mongoose.Types.ObjectId[];
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true },
  password: { type: String },
  name: { type: String, required: true },
  profileImage: String,
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
  next();
});

userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
