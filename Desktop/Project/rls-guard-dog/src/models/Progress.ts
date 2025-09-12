import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IClassroom } from './Classroom';

export interface IProgress extends Document {
  studentId: string;
  classroomId: string;
  score: number;
  completedAssignments: number;
  totalAssignments: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema: Schema = new Schema(
  {
    studentId: { type: String, required: true, ref: 'User' },
    classroomId: { type: String, required: true, ref: 'Classroom' },
    score: { type: Number, default: 0 },
    completedAssignments: { type: Number, default: 0 },
    totalAssignments: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create a compound index to ensure a student can only have one progress record per classroom
ProgressSchema.index({ studentId: 1, classroomId: 1 }, { unique: true });

// Check if the model already exists to prevent overwriting during hot reloads
const Progress = mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);

export default Progress;