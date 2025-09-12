import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  supabaseId: string;
  email: string;
  role: 'student' | 'teacher';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    supabaseId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['student', 'teacher'], required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

// Check if the model already exists to prevent overwriting during hot reloads
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;