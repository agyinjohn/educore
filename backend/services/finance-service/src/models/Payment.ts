import mongoose, { Schema, Document, Types } from 'mongoose'

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'credit_card' | 'debit_card' | 'upi' | 'bank_transfer' | 'cash'

export interface IPayment extends Document {
  _id: Types.ObjectId
  schoolId: string
  studentId: string
  feeIds: string[]
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  status: PaymentStatus
  transactionId?: string // From payment gateway
  referenceNumber: string // Internal unique reference
  payerName: string
  payerEmail: string
  payerPhone?: string
  paidAt?: Date
  failureReason?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const paymentSchema = new Schema<IPayment>(
  {
    schoolId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    feeIds: [{ type: String }],
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'upi', 'bank_transfer', 'cash'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    transactionId: { type: String, sparse: true, unique: true },
    referenceNumber: { type: String, required: true, unique: true, index: true },
    payerName: { type: String, required: true },
    payerEmail: { type: String, required: true },
    payerPhone: { type: String },
    paidAt: { type: Date },
    failureReason: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
)

// Compound indexes for efficient queries
paymentSchema.index({ schoolId: 1, studentId: 1, status: 1 })
paymentSchema.index({ createdAt: -1 })

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema)
