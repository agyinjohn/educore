import { Schema, model, Document } from 'mongoose'

export enum AssessmentType {
  QUIZ = 'quiz',
  TEST = 'test',
  EXAM = 'exam',
  PROJECT = 'project',
  ASSIGNMENT = 'assignment',
  CLASSWORK = 'classwork',
}

export interface IAssessment extends Document {
  school_id: string
  subject_id: string
  class_id: string
  name: string
  type: AssessmentType
  maxScore: number
  weight?: number
  description?: string
  date: Date
  term: string
  academicYear: string
  dueDate?: Date
  rubric?: Record<string, any>
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    school_id: { type: String, required: true, index: true },
    subject_id: { type: String, required: true },
    class_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(AssessmentType),
      required: true,
    },
    maxScore: { type: Number, required: true, default: 100 },
    weight: { type: Number, default: 1 },
    description: { type: String },
    date: { type: Date, required: true },
    term: { type: String, required: true },
    academicYear: { type: String, required: true },
    dueDate: { type: Date },
    rubric: { type: Schema.Types.Mixed },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

AssessmentSchema.index({ school_id: 1, class_id: 1, term: 1 })
AssessmentSchema.index({ subject_id: 1, academicYear: 1 })

export const Assessment = model<IAssessment>('Assessment', AssessmentSchema)
