import { v4 as uuidv4 } from 'uuid'
import { Payment, IPayment, PaymentStatus } from '../models/Payment'
import { ProcessPaymentInput } from '../types/schemas'

export async function recordPayment(schoolId: string, data: ProcessPaymentInput): Promise<IPayment> {
  const referenceNumber = `PAY-${Date.now()}-${uuidv4().slice(0, 8)}`

  const payment = await Payment.create({
    schoolId,
    studentId: data.studentId,
    feeIds: data.feeIds,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    status: 'pending',
    referenceNumber,
    payerName: data.payerName,
    payerEmail: data.payerEmail,
    payerPhone: data.payerPhone,
  })

  return payment
}

export async function getPaymentById(paymentId: string, schoolId: string): Promise<IPayment | null> {
  return Payment.findOne({ _id: paymentId, schoolId })
}

export async function getStudentPayments(
  studentId: string,
  schoolId: string,
  filters: {
    status?: PaymentStatus
    page?: number
    limit?: number
  } = {}
): Promise<{ data: IPayment[]; total: number }> {
  const page = filters.page || 1
  const limit = filters.limit || 20
  const skip = (page - 1) * limit

  const query: any = { schoolId, studentId }

  if (filters.status) query.status = filters.status

  const [data, total] = await Promise.all([
    Payment.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Payment.countDocuments(query),
  ])

  return { data, total }
}

export async function updatePaymentStatus(
  paymentId: string,
  schoolId: string,
  status: PaymentStatus,
  metadata?: any
): Promise<IPayment | null> {
  const updateData: any = { status }

  if (status === 'completed') {
    updateData.paidAt = new Date()
  }

  if (metadata?.transactionId) {
    updateData.transactionId = metadata.transactionId
  }

  if (metadata?.failureReason) {
    updateData.failureReason = metadata.failureReason
  }

  return Payment.findOneAndUpdate({ _id: paymentId, schoolId }, updateData, { new: true })
}

export async function getPaymentsByStatus(
  schoolId: string,
  status: PaymentStatus,
  limit?: number
): Promise<IPayment[]> {
  return Payment.find({ schoolId, status })
    .limit(limit || 100)
    .sort({ createdAt: -1 })
}

export async function getOutstandingPayments(schoolId: string, studentId?: string): Promise<IPayment[]> {
  const query: any = { schoolId, status: { $in: ['pending', 'failed'] } }

  if (studentId) query.studentId = studentId

  return Payment.find(query).sort({ createdAt: -1 })
}

export async function refundPayment(paymentId: string, schoolId: string): Promise<IPayment | null> {
  const payment = await Payment.findOne({ _id: paymentId, schoolId })

  if (!payment) return null

  if (payment.status !== 'completed') {
    throw new Error('Can only refund completed payments')
  }

  return Payment.findOneAndUpdate(
    { _id: paymentId, schoolId },
    { status: 'refunded', updatedAt: new Date() },
    { new: true }
  )
}
