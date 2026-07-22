import mongoose, { Schema, Document, Types } from 'mongoose'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface IInvoice extends Document {
  _id: Types.ObjectId
  schoolId: string
  studentId: string
  invoiceNumber: string
  fees: Array<{
    feeId: string
    name: string
    amount: number
    quantity?: number
  }>
  totalAmount: number
  currency: string
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  amountPaid: number
  outstandingAmount: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const invoiceSchema = new Schema<IInvoice>(
  {
    schoolId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    fees: [
      {
        feeId: { type: String },
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
      index: true,
    },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    amountPaid: { type: Number, default: 0, min: 0 },
    outstandingAmount: { type: Number, required: true, min: 0 },
    notes: { type: String },
  },
  { timestamps: true }
)

// Compound indexes for efficient queries
invoiceSchema.index({ schoolId: 1, studentId: 1, status: 1 })
invoiceSchema.index({ dueDate: 1, status: 1 })

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema)
