import { Router } from 'express'
import * as controller from '../controllers/academic.controller'
import { authenticate, authorize, tenantIsolation } from '../middleware/authenticate'
import { validate } from '../middleware/validate'
import {
  createClassSchema,
  updateClassSchema,
  markAttendanceSchema,
  recordGradeSchema,
  submitGradesSchema,
  publishGradesSchema,
} from '../types/schemas'

const router = Router()

// All routes require authentication and tenant isolation
router.use(authenticate)
router.use(tenantIsolation)

// Classes
router.post(
  '/classes',
  authorize(['SCHOOL_ADMIN', 'ACADEMIC_HEAD']),
  validate(createClassSchema),
  controller.createClass
)

router.get('/classes', controller.listClasses)

router.put(
  '/classes/:id',
  authorize(['SCHOOL_ADMIN', 'ACADEMIC_HEAD']),
  validate(updateClassSchema),
  controller.updateClass
)

router.delete(
  '/classes/:id',
  authorize(['SCHOOL_ADMIN']),
  controller.deleteClass
)

// Attendance
router.post(
  '/attendance',
  authorize(['TEACHER', 'SCHOOL_ADMIN']),
  validate(markAttendanceSchema),
  controller.markAttendance
)

router.get('/attendance/student/:studentId', controller.getStudentAttendance)

router.get('/attendance/class/:classId', controller.getClassAttendance)

// Grades
router.post(
  '/grades',
  authorize(['TEACHER', 'SCHOOL_ADMIN']),
  validate(recordGradeSchema),
  controller.recordGrade
)

router.get('/grades/student/:studentId', controller.getStudentGrades)

router.post(
  '/grades/submit',
  authorize(['TEACHER', 'ACADEMIC_HEAD', 'SCHOOL_ADMIN']),
  validate(submitGradesSchema),
  controller.submitGrades
)

router.post(
  '/grades/publish',
  authorize(['ACADEMIC_HEAD', 'SCHOOL_ADMIN']),
  validate(publishGradesSchema),
  controller.publishGrades
)

// Assessments
router.post(
  '/assessments',
  authorize(['TEACHER', 'SCHOOL_ADMIN']),
  controller.createAssessment
)

router.get('/assessments', controller.listAssessments)

// Timetable
router.post(
  '/timetable',
  authorize(['ACADEMIC_HEAD', 'SCHOOL_ADMIN']),
  controller.createTimetableSlot
)

router.get('/timetable/class/:classId', controller.getTimetableForClass)

// Attendance (Bulk & Stats)
router.post(
  '/attendance/bulk',
  authorize(['TEACHER', 'ACADEMIC_HEAD', 'SCHOOL_ADMIN']),
  controller.markBulkAttendance
)

router.get('/attendance/stats/student/:studentId', controller.getAttendanceStats)

router.get('/attendance/stats/class/:classId', controller.getClassAttendanceStats)

// At-Risk Students
router.get(
  '/at-risk/:classId',
  authorize(['TEACHER', 'ACADEMIC_HEAD', 'SCHOOL_ADMIN']),
  controller.getAtRiskStudents
)

// Grade Analytics
router.get('/grades/term-averages/:classId', controller.getTermAverageGrades)

router.get('/grades/student-rank/:studentId', controller.getStudentRankInClass)

router.get('/grades/distribution/:classId', controller.getGradeDistribution)

export default router
