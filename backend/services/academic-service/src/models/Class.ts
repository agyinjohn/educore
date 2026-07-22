import { Schema, model, Document } from 'mongoose'

export interface IClass extends Document {
  school_id: string
  name: string
  section?: string
  academicYear: string
  teacher_id?: string
  capacity?: number
  gradeLevel?: string
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ClassSchema = new Schema<IClass>(
  {
    school_id: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    section: { type: String, trim: true },
    academicYear: { type: String, required: true },
    teacher_id: { type: String },
    capacity: { type: Number },
    gradeLevel: { type: String },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

ClassSchema.index({ school_id: 1, academicYear: 1 })
ClassSchema.index({ teacher_id: 1 })

export const Class = model<IClass>('Class', ClassSchema)
