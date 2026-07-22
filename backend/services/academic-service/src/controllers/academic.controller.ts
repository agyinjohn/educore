import { Request, Response } from 'express'
import { academicService } from '../services/academic.service'

// Classes
export const createClass = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const cls = await academicService.createClass(schoolId, req.body)
    res.status(201).json({ success: true, data: cls })
  } catch (error) {
    console.error('createClass error:', error)
    res.status(500).json({ success: false, message: 'Failed to create class' })
  }
}

export const listClasses = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const academicYear = req.query.academicYear as string
    if (!schoolId || !academicYear) {
      return res.status(400).json({ success: false, message: 'school_id and academicYear required' })
    }
    const classes = await academicService.listClasses(schoolId, academicYear)
    res.status(200).json({ success: true, data: classes })
  } catch (error) {
    console.error('listClasses error:', error)
    res.status(500).json({ success: false, message: 'Failed to list classes' })
  }
}

// Attendance
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const attendance = await academicService.markAttendance(schoolId, req.body)
    res.status(201).json({ success: true, data: attendance })
  } catch (error) {
    console.error('markAttendance error:', error)
    res.status(500).json({ success: false, message: 'Failed to mark attendance' })
  }
}

export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const studentId = req.params.studentId
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const attendance = await academicService.getAttendanceByStudent(schoolId, studentId)
    res.status(200).json({ success: true, data: attendance })
  } catch (error) {
    console.error('getStudentAttendance error:', error)
    res.status(500).json({ success: false, message: 'Failed to get attendance' })
  }
}

export const getClassAttendance = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const classId = req.params.classId
    const date = req.query.date ? new Date(req.query.date as string) : new Date()
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const attendance = await academicService.getAttendanceByClass(schoolId, classId, date)
    res.status(200).json({ success: true, data: attendance })
  } catch (error) {
    console.error('getClassAttendance error:', error)
    res.status(500).json({ success: false, message: 'Failed to get class attendance' })
  }
}

// Grades
export const recordGrade = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const grade = await academicService.recordGrade(schoolId, req.body)
    res.status(201).json({ success: true, data: grade })
  } catch (error) {
    console.error('recordGrade error:', error)
    res.status(500).json({ success: false, message: 'Failed to record grade' })
  }
}

export const getStudentGrades = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const studentId = req.params.studentId
    const term = req.query.term as string
    if (!schoolId || !term) {
      return res.status(400).json({ success: false, message: 'school_id and term required' })
    }
    const grades = await academicService.getStudentGrades(schoolId, studentId, term)
    res.status(200).json({ success: true, data: grades })
  } catch (error) {
    console.error('getStudentGrades error:', error)
    res.status(500).json({ success: false, message: 'Failed to get grades' })
  }
}

export const publishGrades = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const { term, academicYear } = req.body
    if (!schoolId || !term || !academicYear) {
      return res.status(400).json({ success: false, message: 'school_id, term, and academicYear required' })
    }
    const result = await academicService.publishGrades(schoolId, term, academicYear)
    res.status(200).json({ success: true, message: 'Grades published', data: result })
  } catch (error) {
    console.error('publishGrades error:', error)
    res.status(500).json({ success: false, message: 'Failed to publish grades' })
  }
}

// Assessments
export const createAssessment = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const assessment = await academicService.createAssessment(schoolId, req.body)
    res.status(201).json({ success: true, data: assessment })
  } catch (error) {
    console.error('createAssessment error:', error)
    res.status(500).json({ success: false, message: 'Failed to create assessment' })
  }
}

export const listAssessments = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const classId = req.query.classId as string
    const term = req.query.term as string
    if (!schoolId || !classId || !term) {
      return res.status(400).json({ success: false, message: 'school_id, classId, and term required' })
    }
    const assessments = await academicService.listAssessments(schoolId, classId, term)
    res.status(200).json({ success: true, data: assessments })
  } catch (error) {
    console.error('listAssessments error:', error)
    res.status(500).json({ success: false, message: 'Failed to list assessments' })
  }
}

// Timetable
export const createTimetableSlot = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const slot = await academicService.createTimetableSlot(schoolId, req.body)
    res.status(201).json({ success: true, data: slot })
  } catch (error: any) {
    console.error('createTimetableSlot error:', error)
    if (error.message.includes('Conflict')) {
      return res.status(409).json({ success: false, message: error.message })
    }
    res.status(500).json({ success: false, message: 'Failed to create timetable slot' })
  }
}

export const getTimetableForClass = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const classId = req.params.classId
    const academicYear = req.query.academicYear as string
    const term = req.query.term as string
    if (!schoolId || !academicYear || !term) {
      return res.status(400).json({ success: false, message: 'school_id, academicYear, and term required' })
    }
    const timetable = await academicService.getTimetableForClass(schoolId, classId, academicYear, term)
    res.status(200).json({ success: true, data: timetable })
  } catch (error) {
    console.error('getTimetableForClass error:', error)
    res.status(500).json({ success: false, message: 'Failed to get timetable' })
  }
}

// Attendance (bulk)
export const markBulkAttendance = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const { records } = req.body
    if (!schoolId || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid records array required' })
    }
    const result = await academicService.markBulkAttendance(schoolId, records)
    res.status(201).json({ success: true, count: result.length, data: result })
  } catch (error) {
    console.error('markBulkAttendance error:', error)
    res.status(500).json({ success: false, message: 'Failed to mark bulk attendance' })
  }
}

export const getAttendanceStats = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const studentId = req.params.studentId
    const term = req.query.term as string
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const stats = await academicService.getAttendanceStats(schoolId, studentId, term)
    res.status(200).json({ success: true, data: stats })
  } catch (error) {
    console.error('getAttendanceStats error:', error)
    res.status(500).json({ success: false, message: 'Failed to get attendance stats' })
  }
}

export const getClassAttendanceStats = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const classId = req.params.classId
    const date = req.query.date ? new Date(req.query.date as string) : new Date()
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const stats = await academicService.getClassAttendanceStats(schoolId, classId, date)
    res.status(200).json({ success: true, data: stats })
  } catch (error) {
    console.error('getClassAttendanceStats error:', error)
    res.status(500).json({ success: false, message: 'Failed to get class attendance stats' })
  }
}

// At-Risk Students
export const getAtRiskStudents = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const classId = req.params.classId
    const attendanceThreshold = parseInt(req.query.attendanceThreshold as string) || 80
    const gradeThreshold = parseInt(req.query.gradeThreshold as string) || 65
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const atRiskStudents = await academicService.getAtRiskStudents(
      schoolId,
      classId,
      attendanceThreshold,
      gradeThreshold
    )
    res.status(200).json({ success: true, count: atRiskStudents.length, data: atRiskStudents })
  } catch (error) {
    console.error('getAtRiskStudents error:', error)
    res.status(500).json({ success: false, message: 'Failed to get at-risk students' })
  }
}

// Grade Analytics
export const getTermAverageGrades = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const classId = req.params.classId
    const term = req.query.term as string
    if (!schoolId || !term) {
      return res.status(400).json({ success: false, message: 'school_id and term required' })
    }
    const averages = await academicService.getTermAverageGrades(schoolId, classId, term)
    res.status(200).json({ success: true, data: averages })
  } catch (error) {
    console.error('getTermAverageGrades error:', error)
    res.status(500).json({ success: false, message: 'Failed to get term average grades' })
  }
}

export const getStudentRankInClass = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const studentId = req.params.studentId
    const term = req.query.term as string
    if (!schoolId || !term) {
      return res.status(400).json({ success: false, message: 'school_id and term required' })
    }
    const rank = await academicService.getStudentRankInClass(schoolId, 'class_id', studentId, term)
    res.status(200).json({ success: true, data: rank })
  } catch (error) {
    console.error('getStudentRankInClass error:', error)
    res.status(500).json({ success: false, message: 'Failed to get student rank' })
  }
}

export const getGradeDistribution = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    const classId = req.params.classId
    const term = req.query.term as string
    if (!schoolId || !term) {
      return res.status(400).json({ success: false, message: 'school_id and term required' })
    }
    const distribution = await academicService.getGradeDistribution(schoolId, classId, term)
    res.status(200).json({ success: true, data: distribution })
  } catch (error) {
    console.error('getGradeDistribution error:', error)
    res.status(500).json({ success: false, message: 'Failed to get grade distribution' })
  }
}
