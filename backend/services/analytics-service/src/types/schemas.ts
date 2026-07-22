import { z } from 'zod'

// Dashboard Query
export const dashboardQuerySchema = z.object({
  schoolId: z.string().min(1),
  dateRange: z.enum(['today', 'week', 'month', 'quarter', 'year']).optional(),
})

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>

// Financial Analytics Query
export const financialAnalyticsSchema = z.object({
  schoolId: z.string().min(1),
  metric: z.enum(['revenue', 'outstanding', 'collected', 'trends']).optional(),
  academicYear: z.string().optional(),
})

export type FinancialAnalyticsInput = z.infer<typeof financialAnalyticsSchema>

// Academic Analytics Query
export const academicAnalyticsSchema = z.object({
  schoolId: z.string().min(1),
  classId: z.string().optional(),
  metric: z.enum(['performance', 'attendance', 'grades', 'trends']).optional(),
})

export type AcademicAnalyticsInput = z.infer<typeof academicAnalyticsSchema>

// Pagination
export const paginationSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})

export type PaginationInput = z.infer<typeof paginationSchema>
