import mongoose, { Schema, Document, Types } from 'mongoose'

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'

export interface IFinancialReport extends Document {
  _id: Types.ObjectId
  schoolId: string
  academicYear: string
  reportType: ReportType
  startDate: Date
  endDate: Date
  totalRevenue: number
  totalCollected: number
  totalOutstanding: number
  totalRefunded: number
  paymentMethods: Map<string, number>
  studentWiseBreakdown?: Array<{
    studentId: string
    amount: number
    status: string
  }>
  createdBy?: string
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

const financialReportSchema = new Schema<IFinancialReport>(
  {
    schoolId: { type: String, required: true, index: true },
    academicYear: { type: String, required: true },
    reportType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annual'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalRevenue: { type: Number, default: 0, min: 0 },
    totalCollected: { type: Number, default: 0, min: 0 },
    totalOutstanding: { type: Number, default: 0, min: 0 },
    totalRefunded: { type: Number, default: 0, min: 0 },
    paymentMethods: { type: Map, of: Number, default: {} },
    studentWiseBreakdown: [
      {
        studentId: String,
        amount: Number,
        status: String,
      },
    ],
    createdBy: String,
    expiresAt: { type: Date, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
)

// TTL index for automatic cleanup after 90 days
financialReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
financialReportSchema.index({ schoolId: 1, createdAt: -1 })

export const FinancialReport = mongoose.model<IFinancialReport>(
  'FinancialReport',
  financialReportSchema
)
