import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IFee extends Document {
  _id: Types.ObjectId
  schoolId: string
  name: string
  description?: string
  amount: number
  currency: string // USD, INR, etc.
  feeType: 'tuition' | 'transport' | 'meal' | 'sports' | 'other'
  applicableGrades?: string[]
  frequency: 'once' | 'monthly' | 'quarterly' | 'annually'
  academicYear: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const feeSchema = new Schema<IFee>(
  {
    schoolId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    feeType: {
      type: String,
      enum: ['tuition', 'transport', 'meal', 'sports', 'other'],
      required: true,
    },
    applicableGrades: [String],
    frequency: {
      type: String,
      enum: ['once', 'monthly', 'quarterly', 'annually'],
      required: true,
    },
    academicYear: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Compound index for efficient queries
feeSchema.index({ schoolId: 1, academicYear: 1, isActive: 1 })

export const Fee = mongoose.model<IFee>('Fee', feeSchema)
