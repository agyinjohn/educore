import { AcademicReport, IAcademicReport } from '../models/AcademicReport'
import { GenerateAcademicReportInput } from '../types/schemas'

export async function generateAcademicReport(
  input: GenerateAcademicReportInput
): Promise<IAcademicReport> {
  try {
    // TODO: Fetch grade and attendance data from Academic Service and aggregate
    // For now, create placeholder report
    const report = new AcademicReport({
      schoolId: input.schoolId,
      classId: input.classId,
      studentId: input.studentId,
      subjectId: input.subjectId,
      academicYear: input.academicYear,
      reportType: input.reportType,
      averageGrade: 0,
      attendanceRate: 0,
      topPerformers: [],
      lowPerformers: [],
      assessmentScores: [],
    })

    await report.save()
    return report
  } catch (error) {
    throw new Error(`Failed to generate academic report: ${error}`)
  }
}

export async function getAcademicReport(reportId: string): Promise<IAcademicReport | null> {
  try {
    return await AcademicReport.findById(reportId)
  } catch (error) {
    throw new Error(`Failed to fetch academic report: ${error}`)
  }
}

export async function listAcademicReports(
  schoolId: string,
  filters: { classId?: string; studentId?: string; reportType?: string } = {},
  pagination: { page?: number; limit?: number } = {}
): Promise<{ data: IAcademicReport[]; total: number }> {
  try {
    const page = pagination.page || 1
    const limit = pagination.limit || 10
    const skip = (page - 1) * limit

    const query: any = { schoolId }
    if (filters.classId) query.classId = filters.classId
    if (filters.studentId) query.studentId = filters.studentId
    if (filters.reportType) query.reportType = filters.reportType

    const [reports, total] = await Promise.all([
      AcademicReport.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      AcademicReport.countDocuments(query),
    ])

    return { data: reports, total }
  } catch (error) {
    throw new Error(`Failed to list academic reports: ${error}`)
  }
}

export async function deleteAcademicReport(reportId: string): Promise<boolean> {
  try {
    const result = await AcademicReport.findByIdAndDelete(reportId)
    return !!result
  } catch (error) {
    throw new Error(`Failed to delete academic report: ${error}`)
  }
}
