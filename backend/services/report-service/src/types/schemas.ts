import { z } from 'zod'

// Financial Report Schemas
export const generateFinancialReportSchema = z.object({
  schoolId: z.string().min(1),
  academicYear: z.string(),
  reportType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annual']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type GenerateFinancialReportInput = z.infer<typeof generateFinancialReportSchema>

// Academic Report Schemas
export const generateAcademicReportSchema = z.object({
  schoolId: z.string().min(1),
  classId: z.string().optional(),
  studentId: z.string().optional(),
  subjectId: z.string().optional(),
  academicYear: z.string(),
  reportType: z.enum(['class', 'student', 'subject']),
})

export type GenerateAcademicReportInput = z.infer<typeof generateAcademicReportSchema>

// Pagination
export const paginationSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// Date Range Filter
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type DateRangeInput = z.infer<typeof dateRangeSchema>
