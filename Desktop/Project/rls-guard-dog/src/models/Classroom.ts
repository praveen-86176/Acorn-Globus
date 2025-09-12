import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IClassroom extends Document {
  name: string;
  description: string;
  teacherId: string;
  students: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ClassroomSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    teacherId: { type: String, required: true, ref: 'User' },
    students: [{ type: String, ref: 'User' }],
  },
  { timestamps: true }
);

// Check if the model already exists to prevent overwriting during hot reloads
const Classroom = mongoose.models.Classroom || mongoose.model<IClassroom>('Classroom', ClassroomSchema);

export default Classroom;