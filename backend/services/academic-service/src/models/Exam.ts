import { Schema, model, Document } from 'mongoose'

export interface IExamResult {
  student_id: string
  score: number
  grade?: string
}

export interface IExam extends Document {
  school_id: string
  name: string
  subject_id: string
  class_id: string
  date: Date
  duration: number
  maxScore: number
  weight?: number
  term: string
  academicYear: string
  results?: IExamResult[]
  description?: string
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ExamResultSchema = new Schema<IExamResult>({
  student_id: { type: String, required: true },
  score: { type: Number, required: true },
  grade: { type: String },
})

const ExamSchema = new Schema<IExam>(
  {
    school_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    subject_id: { type: String, required: true },
    class_id: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    maxScore: { type: Number, default: 100 },
    weight: { type: Number, default: 1 },
    term: { type: String, required: true },
    academicYear: { type: String, required: true },
    results: [ExamResultSchema],
    description: { type: String },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

ExamSchema.index({ school_id: 1, class_id: 1, term: 1 })
ExamSchema.index({ subject_id: 1, academicYear: 1 })

export const Exam = model<IExam>('Exam', ExamSchema)
