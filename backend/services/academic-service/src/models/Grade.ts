import { Schema, model, Document } from 'mongoose'

export enum GradeStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PUBLISHED = 'published',
}

export interface IGrade extends Document {
  school_id: string
  student_id: string
  subject_id: string
  assessment_id?: string
  score: number
  maxScore?: number
  percentage?: number
  grade?: string
  term: string
  academicYear: string
  status: GradeStatus
  feedback?: string
  recordedBy?: string
  publishedAt?: Date
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const GradeSchema = new Schema<IGrade>(
  {
    school_id: { type: String, required: true, index: true },
    student_id: { type: String, required: true, index: true },
    subject_id: { type: String, required: true },
    assessment_id: { type: String },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, default: 100 },
    percentage: { type: Number, min: 0, max: 100 },
    grade: { type: String },
    term: { type: String, required: true },
    academicYear: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(GradeStatus),
      default: GradeStatus.DRAFT,
    },
    feedback: { type: String },
    recordedBy: { type: String },
    publishedAt: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

GradeSchema.index({ school_id: 1, student_id: 1, term: 1 })
GradeSchema.index({ subject_id: 1, academicYear: 1 })
GradeSchema.index({ status: 1 })

export const Grade = model<IGrade>('Grade', GradeSchema)
