import { FinancialReport, IFinancialReport, ReportType } from '../models/FinancialReport'
import { GenerateFinancialReportInput } from '../types/schemas'

export async function generateFinancialReport(
  input: GenerateFinancialReportInput
): Promise<IFinancialReport> {
  try {
    // Calculate date range
    const now = new Date()
    let startDate = input.startDate ? new Date(input.startDate) : new Date(now)
    let endDate = input.endDate ? new Date(input.endDate) : new Date(now)

    // Adjust based on report type
    switch (input.reportType) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'weekly':
        startDate.setDate(startDate.getDate() - startDate.getDay())
        endDate.setDate(startDate.getDate() + 6)
        break
      case 'monthly':
        startDate.setDate(1)
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
        break
      case 'quarterly':
        const quarter = Math.floor(startDate.getMonth() / 3)
        startDate = new Date(startDate.getFullYear(), quarter * 3, 1)
        endDate = new Date(startDate.getFullYear(), quarter * 3 + 3, 0)
        break
      case 'annual':
        startDate = new Date(startDate.getFullYear(), 0, 1)
        endDate = new Date(startDate.getFullYear(), 11, 31)
        break
    }

    // TODO: Fetch payment data from Finance Service and aggregate
    // For now, create placeholder report
    const report = new FinancialReport({
      schoolId: input.schoolId,
      academicYear: input.academicYear,
      reportType: input.reportType,
      startDate,
      endDate,
      totalRevenue: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      totalRefunded: 0,
      paymentMethods: new Map(),
    })

    await report.save()
    return report
  } catch (error) {
    throw new Error(`Failed to generate financial report: ${error}`)
  }
}

export async function getFinancialReport(reportId: string): Promise<IFinancialReport | null> {
  try {
    return await FinancialReport.findById(reportId)
  } catch (error) {
    throw new Error(`Failed to fetch financial report: ${error}`)
  }
}

export async function listFinancialReports(
  schoolId: string,
  pagination: { page?: number; limit?: number } = {}
): Promise<{ data: IFinancialReport[]; total: number }> {
  try {
    const page = pagination.page || 1
    const limit = pagination.limit || 10
    const skip = (page - 1) * limit

    const [reports, total] = await Promise.all([
      FinancialReport.find({ schoolId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      FinancialReport.countDocuments({ schoolId }),
    ])

    return { data: reports, total }
  } catch (error) {
    throw new Error(`Failed to list financial reports: ${error}`)
  }
}

export async function deleteFinancialReport(reportId: string): Promise<boolean> {
  try {
    const result = await FinancialReport.findByIdAndDelete(reportId)
    return !!result
  } catch (error) {
    throw new Error(`Failed to delete financial report: ${error}`)
  }
}
