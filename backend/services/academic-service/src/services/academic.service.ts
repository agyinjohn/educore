import { Class, IClass } from '../models/Class'
import { Attendance, IAttendance, AttendanceStatus } from '../models/Attendance'
import { Grade, IGrade, GradeStatus } from '../models/Grade'
import { Assessment, IAssessment } from '../models/Assessment'
import { TimetableSlot, ITimetableSlot } from '../models/TimetableSlot'
import { Types } from 'mongoose'

export interface AtRiskStudent {
  student_id: string
  name: string
  attendanceRate: number
  averageGrade: number
  riskLevel: 'low' | 'medium' | 'high'
  reason: string[]
}

export class AcademicService {
  async createClass(schoolId: string, data: Partial<IClass>) {
    const cls = new Class({
      school_id: schoolId,
      ...data,
    })
    return await cls.save()
  }

  async listClasses(schoolId: string, academicYear: string) {
    return await Class.find({
      school_id: schoolId,
      academicYear,
      deletedAt: null,
    })
  }

  // Timetable
  async createTimetableSlot(schoolId: string, data: Partial<ITimetableSlot>) {
    // Check for teacher/room conflicts
    const conflict = await this.checkTimetableConflict(schoolId, data)
    if (conflict) {
      throw new Error(`Conflict detected: ${conflict}`)
    }

    const slot = new TimetableSlot({
      school_id: schoolId,
      ...data,
    })
    return await slot.save()
  }

  private async checkTimetableConflict(schoolId: string, slot: Partial<ITimetableSlot>): Promise<string | null> {
    // Check teacher conflict
    if (slot.teacher_id) {
      const teacherConflict = await TimetableSlot.findOne({
        school_id: schoolId,
        teacher_id: slot.teacher_id,
        dayOfWeek: slot.dayOfWeek,
        period: slot.period,
        academicYear: slot.academicYear,
        term: slot.term,
        deletedAt: null,
      })
      if (teacherConflict) {
        return `Teacher ${slot.teacher_id} already assigned in period ${slot.period} on ${slot.dayOfWeek}`
      }
    }

    // Check room conflict
    if (slot.room_id) {
      const roomConflict = await TimetableSlot.findOne({
        school_id: schoolId,
        room_id: slot.room_id,
        dayOfWeek: slot.dayOfWeek,
        period: slot.period,
        academicYear: slot.academicYear,
        term: slot.term,
        deletedAt: null,
      })
      if (roomConflict) {
        return `Room ${slot.room_id} already booked in period ${slot.period} on ${slot.dayOfWeek}`
      }
    }

    return null
  }

  async getTimetableForClass(schoolId: string, classId: string, academicYear: string, term: string) {
    return await TimetableSlot.find({
      school_id: schoolId,
      class_id: classId,
      academicYear,
      term,
      deletedAt: null,
    }).sort({ dayOfWeek: 1, period: 1 })
  }

  // Attendance
  async markAttendance(schoolId: string, data: Partial<IAttendance>) {
    const attendance = new Attendance({
      school_id: schoolId,
      recordedAt: new Date(),
      ...data,
    })
    return await attendance.save()
  }

  async markBulkAttendance(schoolId: string, records: Partial<IAttendance>[]) {
    const validatedRecords = records.map((r) => ({
      school_id: schoolId,
      recordedAt: new Date(),
      ...r,
    }))
    return await Attendance.insertMany(validatedRecords)
  }

  async getAttendanceByStudent(schoolId: string, studentId: string, startDate?: Date, endDate?: Date) {
    const query: any = { school_id: schoolId, student_id: studentId }
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = startDate
      if (endDate) query.date.$lte = endDate
    }
    return await Attendance.find(query).sort({ date: -1 })
  }

  async getAttendanceByClass(schoolId: string, classId: string, date: Date) {
    return await Attendance.find({
      school_id: schoolId,
      class_id: classId,
      date: { $gte: new Date(date.setHours(0, 0, 0, 0)), $lt: new Date(date.setHours(23, 59, 59, 999)) },
    })
  }

  async getAttendanceStats(schoolId: string, studentId: string, term?: string) {
    const matchStage: any = {
      school_id: schoolId,
      student_id: studentId,
    }
    if (term) matchStage.term = term

    const stats = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    const total = stats.reduce((sum, s) => sum + s.count, 0)
    const presentCount = stats.find((s) => s._id === AttendanceStatus.PRESENT)?.count || 0
    const attendanceRate = total > 0 ? (presentCount / total) * 100 : 0

    return {
      total,
      present: presentCount,
      absent: stats.find((s) => s._id === AttendanceStatus.ABSENT)?.count || 0,
      late: stats.find((s) => s._id === AttendanceStatus.LATE)?.count || 0,
      excused: stats.find((s) => s._id === AttendanceStatus.EXCUSED)?.count || 0,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
    }
  }

  async getClassAttendanceStats(schoolId: string, classId: string, date: Date) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)

    const stats = await Attendance.aggregate([
      {
        $match: {
          school_id: schoolId,
          class_id: classId,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    return {
      date: date.toISOString().split('T')[0],
      present: stats.find((s) => s._id === AttendanceStatus.PRESENT)?.count || 0,
      absent: stats.find((s) => s._id === AttendanceStatus.ABSENT)?.count || 0,
      late: stats.find((s) => s._id === AttendanceStatus.LATE)?.count || 0,
      excused: stats.find((s) => s._id === AttendanceStatus.EXCUSED)?.count || 0,
    }
  }

  // Grades
  async recordGrade(schoolId: string, data: Partial<IGrade>) {
    const grade = new Grade({
      school_id: schoolId,
      status: GradeStatus.DRAFT,
      ...data,
    })
    if (grade.maxScore) {
      grade.percentage = (grade.score / grade.maxScore) * 100
    }
    return await grade.save()
  }

  async getStudentGrades(schoolId: string, studentId: string, term: string) {
    return await Grade.find({
      school_id: schoolId,
      student_id: studentId,
      term,
      deletedAt: null,
    })
  }

  async submitGrades(schoolId: string, term: string, academicYear: string) {
    return await Grade.updateMany(
      {
        school_id: schoolId,
        term,
        academicYear,
        status: GradeStatus.DRAFT,
      },
      {
        $set: {
          status: GradeStatus.SUBMITTED,
        },
      }
    )
  }

  async publishGrades(schoolId: string, term: string, academicYear: string) {
    return await Grade.updateMany(
      {
        school_id: schoolId,
        term,
        academicYear,
        status: GradeStatus.SUBMITTED,
      },
      {
        $set: {
          status: GradeStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      }
    )
  }

  // Assessments
  async createAssessment(schoolId: string, data: Partial<IAssessment>) {
    const assessment = new Assessment({
      school_id: schoolId,
      ...data,
    })
    return await assessment.save()
  }

  async listAssessments(schoolId: string, classId: string, term: string) {
    return await Assessment.find({
      school_id: schoolId,
      class_id: classId,
      term,
      deletedAt: null,
    })
  }

  // At-Risk Student Detection
  async getAtRiskStudents(
    schoolId: string,
    classId: string,
    attendanceThreshold: number = 80,
    gradeThreshold: number = 65
  ): Promise<AtRiskStudent[]> {
    const schoolOid = new Types.ObjectId(schoolId)
    const classOid = new Types.ObjectId(classId)

    // Get attendance stats by student
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          school_id: schoolOid,
          class_id: classOid,
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$student_id',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        },
      },
      {
        $addFields: {
          attendanceRate: { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] },
        },
      },
    ])

    // Get grade stats by student
    const gradeStats = await Grade.aggregate([
      {
        $match: {
          school_id: schoolOid,
          class_id: classOid,
          status: 'published',
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$student_id',
          avgGrade: { $avg: '$percentage' },
        },
      },
      {
        $addFields: {
          avgGrade: { $round: ['$avgGrade', 2] },
        },
      },
    ])

    const gradeMap = new Map(gradeStats.map(g => [g._id.toString(), g.avgGrade]))

    const atRiskList: AtRiskStudent[] = []

    for (const record of attendanceStats) {
      const studentId = record._id.toString()
      const avgGrade = gradeMap.get(studentId) || 0
      const reasons: string[] = []

      if (record.attendanceRate < attendanceThreshold) {
        reasons.push(`Low attendance: ${record.attendanceRate}%`)
      }
      if (avgGrade < gradeThreshold) {
        reasons.push(`Low average grade: ${avgGrade.toFixed(1)}%`)
      }

      if (reasons.length > 0) {
        const riskLevel = reasons.length === 2 ? 'high' : 'medium'
        atRiskList.push({
          student_id: studentId,
          name: `Student ${studentId.slice(0, 6)}`,
          attendanceRate: record.attendanceRate,
          averageGrade: avgGrade,
          riskLevel,
          reason: reasons,
        })
      }
    }

    return atRiskList.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 }
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
    })
  }

  // Grade Analytics
  async getTermAverageGrades(schoolId: string, classId: string, term: string) {
    const grades = await Grade.aggregate([
      {
        $match: {
          school_id: schoolId,
          deletedAt: null,
          term,
        },
      },
      {
        $group: {
          _id: '$subject_id',
          average: { $avg: '$percentage' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' },
          count: { $sum: 1 },
        },
      },
    ])
    return grades
  }

  async getStudentRankInClass(schoolId: string, classId: string, studentId: string, term: string) {
    const studentGrades = await Grade.find({
      school_id: schoolId,
      student_id: studentId,
      term,
      deletedAt: null,
    })

    const studentAverage =
      studentGrades.length > 0 ? studentGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / studentGrades.length : 0

    const allClassStudentAverages = await Grade.aggregate([
      {
        $match: {
          school_id: schoolId,
          term,
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$student_id',
          average: { $avg: '$percentage' },
        },
      },
      {
        $sort: { average: -1 },
      },
    ])

    const rank = allClassStudentAverages.findIndex((s) => s._id.toString() === studentId) + 1
    const totalStudents = allClassStudentAverages.length

    return {
      studentId,
      average: parseFloat(studentAverage.toFixed(2)),
      rank,
      totalStudents,
      percentile: totalStudents > 0 ? parseFloat((((totalStudents - rank + 1) / totalStudents) * 100).toFixed(2)) : 0,
    }
  }

  async getGradeDistribution(schoolId: string, classId: string, term: string) {
    const distribution = await Grade.aggregate([
      {
        $match: {
          school_id: schoolId,
          deletedAt: null,
          term,
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gte: ['$percentage', 90] },
              'A',
              {
                $cond: [
                  { $gte: ['$percentage', 80] },
                  'B',
                  {
                    $cond: [
                      { $gte: ['$percentage', 70] },
                      'C',
                      {
                        $cond: [{ $gte: ['$percentage', 60] }, 'D', 'F'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return {
      A: distribution.find((d) => d._id === 'A')?.count || 0,
      B: distribution.find((d) => d._id === 'B')?.count || 0,
      C: distribution.find((d) => d._id === 'C')?.count || 0,
      D: distribution.find((d) => d._id === 'D')?.count || 0,
      F: distribution.find((d) => d._id === 'F')?.count || 0,
    }
  }
}

export const academicService = new AcademicService()
