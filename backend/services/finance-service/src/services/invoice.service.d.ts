import { IInvoice } from '../models/Invoice'

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

export declare function generateInvoice(input: GenerateInvoiceInput): Promise<IInvoice>
export declare function getInvoiceById(invoiceId: string): Promise<IInvoice | null>
export declare function listInvoices(
  filters: InvoiceFilters,
  pagination: PaginationInput
): Promise<IInvoice[]>
export declare function updateInvoiceStatus(
  invoiceId: string,
  status: string
): Promise<IInvoice | null>
export declare function sendInvoice(invoiceId: string, recipientEmail: string): Promise<IInvoice | null>
export declare function getOverdueInvoices(
  schoolId: string,
  pagination: PaginationInput
): Promise<IInvoice[]>
