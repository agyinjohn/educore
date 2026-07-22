import { z } from 'zod'

// Fee Schemas
export const createFeeSchema = z.object({
  schoolId: z.string(),
  name: z.string().min(2),
  description: z.string().optional(),
  amount: z.number().positive(),
  feeType: z.enum(['tuition', 'transport', 'meal', 'sports', 'other']),
  frequency: z.enum(['once', 'monthly', 'quarterly', 'annually']),
  academicYear: z.string(),
  applicableGrades: z.array(z.string()).optional(),
})

export type CreateFeeInput = z.infer<typeof createFeeSchema>

export const updateFeeSchema = createFeeSchema.partial()

export type UpdateFeeInput = z.infer<typeof updateFeeSchema>

// Payment Schemas
export const processPaymentSchema = z.object({
  schoolId: z.string(),
  studentId: z.string(),
  feeIds: z.array(z.string()).min(1),
  amount: z.number().positive(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'upi', 'bank_transfer', 'cash']),
  payerName: z.string().min(2),
  payerEmail: z.string().email(),
  payerPhone: z.string().optional(),
})

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>

// Invoice Schemas
export const generateInvoiceSchema = z.object({
  schoolId: z.string(),
  studentId: z.string(),
  feeIds: z.array(z.string()).min(1),
  dueDate: z.string().datetime(),
  notes: z.string().optional(),
})

export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>

// Query Schemas
export const paginationSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})

export type PaginationInput = z.infer<typeof paginationSchema>
