import { Invoice, IInvoice } from '../models/Invoice'
import { Fee } from '../models/Fee'
import { v4 as uuidv4 } from 'uuid'

interface GenerateInvoiceInput {
  schoolId: string
  studentId: string
  feeIds: string[]
  dueDate: Date
  notes?: string
}

interface InvoiceFilters {
  schoolId: string
  studentId?: string
  status?: string
}

interface PaginationInput {
  page?: number
  limit?: number
}

export async function generateInvoice(input: GenerateInvoiceInput): Promise<IInvoice> {
  try {
    const fees = await Fee.find({ _id: { $in: input.feeIds } })
    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0)

    const invoiceNumber = `INV-${input.schoolId}-${Date.now()}-${uuidv4().slice(0, 8)}`

    const invoice = new Invoice({
      schoolId: input.schoolId,
      studentId: input.studentId,
      invoiceNumber,
      fees: fees.map(fee => ({
        feeId: fee._id.toString(),
        name: fee.name,
        amount: fee.amount,
        quantity: 1,
      })),
      totalAmount,
      currency: 'USD',
      status: 'draft',
      issueDate: new Date(),
      dueDate: input.dueDate,
      amountPaid: 0,
      outstandingAmount: totalAmount,
      notes: input.notes,
    })

    await invoice.save()
    return invoice
  } catch (error) {
    throw new Error(`Failed to generate invoice: ${error}`)
  }
}

export async function getInvoiceById(invoiceId: string): Promise<IInvoice | null> {
  try {
    return await Invoice.findById(invoiceId)
  } catch (error) {
    throw new Error(`Failed to fetch invoice: ${error}`)
  }
}

export async function listInvoices(
  filters: InvoiceFilters,
  pagination: PaginationInput
): Promise<IInvoice[]> {
  try {
    const page = pagination.page || 1
    const limit = pagination.limit || 10
    const skip = (page - 1) * limit

    const query: any = { schoolId: filters.schoolId }

    if (filters.studentId) query.studentId = filters.studentId
    if (filters.status) query.status = filters.status

    return await Invoice.find(query).skip(skip).limit(limit).sort({ createdAt: -1 })
  } catch (error) {
    throw new Error(`Failed to list invoices: ${error}`)
  }
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: string
): Promise<IInvoice | null> {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status, updatedAt: new Date() },
      { new: true }
    )
    return invoice
  } catch (error) {
    throw new Error(`Failed to update invoice status: ${error}`)
  }
}

export async function sendInvoice(invoiceId: string, recipientEmail: string): Promise<IInvoice | null> {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status: 'sent', updatedAt: new Date() },
      { new: true }
    )

    // TODO: Integrate with notification service to send email
    // await notificationService.sendInvoiceEmail(recipientEmail, invoice)

    return invoice
  } catch (error) {
    throw new Error(`Failed to send invoice: ${error}`)
  }
}

export async function getOverdueInvoices(
  schoolId: string,
  pagination: PaginationInput
): Promise<IInvoice[]> {
  try {
    const page = pagination.page || 1
    const limit = pagination.limit || 10
    const skip = (page - 1) * limit

    return await Invoice.find({
      schoolId,
      status: { $in: ['sent', 'overdue'] },
      dueDate: { $lt: new Date() },
    })
      .skip(skip)
      .limit(limit)
      .sort({ dueDate: 1 })
  } catch (error) {
    throw new Error(`Failed to fetch overdue invoices: ${error}`)
  }
}
