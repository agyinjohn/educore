import mongoose, { Schema, Document, Types } from 'mongoose'

export type AcademicReportType = 'class' | 'student' | 'subject'

export interface IAcademicReport extends Document {
  _id: Types.ObjectId
  schoolId: string
  classId?: string
  studentId?: string
  subjectId?: string
  academicYear: string
  reportType: AcademicReportType
  averageGrade?: number
  topPerformers?: Array<{
    studentId: string
    name: string
    grades: Map<string, number>
  }>
  lowPerformers?: Array<{
    studentId: string
    name: string
    grades: Map<string, number>
  }>
  attendanceRate?: number
  assessmentScores?: Array<{
    assessmentId: string
    name: string
    averageScore: number
    distribution: Map<number, number>
  }>
  createdBy?: string
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

const academicReportSchema = new Schema<IAcademicReport>(
  {
    schoolId: { type: String, required: true, index: true },
    classId: { type: String, sparse: true },
    studentId: { type: String, sparse: true },
    subjectId: { type: String, sparse: true },
    academicYear: { type: String, required: true },
    reportType: {
      type: String,
      enum: ['class', 'student', 'subject'],
      required: true,
    },
    averageGrade: { type: Number, min: 0, max: 100 },
    topPerformers: [
      {
        studentId: String,
        name: String,
        grades: { type: Map, of: Number },
      },
    ],
    lowPerformers: [
      {
        studentId: String,
        name: String,
        grades: { type: Map, of: Number },
      },
    ],
    attendanceRate: { type: Number, min: 0, max: 100 },
    assessmentScores: [
      {
        assessmentId: String,
        name: String,
        averageScore: Number,
        distribution: { type: Map, of: Number },
      },
    ],
    createdBy: String,
    expiresAt: { type: Date, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
)

// TTL index for automatic cleanup after 90 days
academicReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
academicReportSchema.index({ schoolId: 1, classId: 1, createdAt: -1 })
academicReportSchema.index({ schoolId: 1, studentId: 1, createdAt: -1 })

export const AcademicReport = mongoose.model<IAcademicReport>(
  'AcademicReport',
  academicReportSchema
)
