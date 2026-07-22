import request from 'supertest'
import express from 'express'

// Mock setup before importing routes
jest.mock('../../models/Class')
jest.mock('../../models/Timetable')
jest.mock('../../models/Attendance')
jest.mock('../../models/Grade')
jest.mock('../../models/Assessment')
jest.mock('../../services/academic.service')
jest.mock('../../config/db')

describe('Academic Service Routes', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())

    // Dynamically require after mocks are set up
    const academicRoutes = require('../../routes/academic.routes').default
    app.use('/api/v1/academic', academicRoutes)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Classes Endpoints', () => {
    describe('POST /classes/create', () => {
      it('should successfully create a new class', async () => {
        const classData = {
          name: '10A',
          grade: '10',
          capacity: 40,
          schoolId: 'school-123',
          classTeacherId: 'teacher-1',
        }

        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.createClass.mockResolvedValue({
          success: true,
          class: { _id: 'class-123', ...classData },
        })

        const response = await request(app)
          .post('/api/v1/academic/classes/create')
          .set('Authorization', 'Bearer admin-token')
          .send(classData)

        expect([200, 201]).toContain(response.status)
        expect(response.body).toHaveProperty('success', true)
      })
    })

    describe('GET /classes/:id', () => {
      it('should retrieve a class by ID', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.getClassById.mockResolvedValue({
          success: true,
          class: { _id: 'class-123', name: '10A' },
        })

        const response = await request(app)
          .get('/api/v1/academic/classes/class-123')
          .set('Authorization', 'Bearer user-token')

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('class')
      })
    })

    describe('GET /classes/school/:schoolId', () => {
      it('should list all classes for a school', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.getClassesBySchool.mockResolvedValue({
          success: true,
          classes: [
            { _id: 'class-1', name: '10A' },
            { _id: 'class-2', name: '10B' },
          ],
        })

        const response = await request(app)
          .get('/api/v1/academic/classes/school/school-123')
          .set('Authorization', 'Bearer user-token')

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.classes)).toBe(true)
      })
    })

    describe('PUT /classes/update/:id', () => {
      it('should successfully update class information', async () => {
        const updateData = { capacity: 45 }

        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.updateClass.mockResolvedValue({
          success: true,
          class: { _id: 'class-123', ...updateData },
        })

        const response = await request(app)
          .put('/api/v1/academic/classes/update/class-123')
          .set('Authorization', 'Bearer admin-token')
          .send(updateData)

        expect(response.status).toBe(200)
      })
    })

    describe('DELETE /classes/:id', () => {
      it('should successfully delete a class', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.deleteClass.mockResolvedValue({
          success: true,
          message: 'Class deleted',
        })

        const response = await request(app)
          .delete('/api/v1/academic/classes/class-123')
          .set('Authorization', 'Bearer admin-token')

        expect(response.status).toBe(200)
      })
    })
  })

  describe('Timetable Endpoints', () => {
    describe('POST /timetable/create', () => {
      it('should successfully create a timetable', async () => {
        const timetableData = {
          classId: 'class-123',
          schedule: [
            {
              day: 'Monday',
              periods: [
                { period: 1, subject: 'Math', teacher: 'teacher-1', startTime: '09:00', endTime: '10:00' },
              ],
            },
          ],
        }

        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.createTimetable.mockResolvedValue({
          success: true,
          timetable: { _id: 'timetable-123', ...timetableData },
        })

        const response = await request(app)
          .post('/api/v1/academic/timetable/create')
          .set('Authorization', 'Bearer admin-token')
          .send(timetableData)

        expect([200, 201]).toContain(response.status)
      })
    })

    describe('GET /timetable/:classId', () => {
      it('should retrieve timetable for a class', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.getTimetable.mockResolvedValue({
          success: true,
          timetable: { _id: 'timetable-123', classId: 'class-123' },
        })

        const response = await request(app)
          .get('/api/v1/academic/timetable/class-123')
          .set('Authorization', 'Bearer user-token')

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('timetable')
      })
    })
  })

  describe('Attendance Endpoints', () => {
    describe('POST /attendance/mark', () => {
      it('should mark attendance for students', async () => {
        const attendanceData = {
          classId: 'class-123',
          date: new Date().toISOString(),
          attendance: [
            { studentId: 'student-1', present: true },
            { studentId: 'student-2', present: false },
          ],
        }

        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.markAttendance.mockResolvedValue({
          success: true,
          marked: 2,
        })

        const response = await request(app)
          .post('/api/v1/academic/attendance/mark')
          .set('Authorization', 'Bearer teacher-token')
          .send(attendanceData)

        expect(response.status).toBe(200)
      })
    })

    describe('GET /attendance/student/:studentId', () => {
      it('should retrieve attendance records for a student', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.getStudentAttendance.mockResolvedValue({
          success: true,
          attendance: [
            { date: '2024-01-15', present: true },
            { date: '2024-01-16', present: true },
          ],
        })

        const response = await request(app)
          .get('/api/v1/academic/attendance/student/student-123')
          .set('Authorization', 'Bearer user-token')

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.attendance)).toBe(true)
      })
    })

    describe('GET /attendance/class/:classId', () => {
      it('should retrieve attendance for entire class', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.getClassAttendance.mockResolvedValue({
          success: true,
          attendance: [],
        })

        const response = await request(app)
          .get('/api/v1/academic/attendance/class/class-123')
          .set('Authorization', 'Bearer teacher-token')

        expect(response.status).toBe(200)
      })
    })
  })

  describe('Grades Endpoints', () => {
    describe('POST /grades/record', () => {
      it('should record grades for a student', async () => {
        const gradeData = {
          studentId: 'student-123',
          classId: 'class-123',
          subject: 'Math',
          examType: 'midterm',
          score: 85,
          totalMarks: 100,
          term: '1',
        }

        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.recordGrade.mockResolvedValue({
          success: true,
          grade: { _id: 'grade-123', ...gradeData },
        })

        const response = await request(app)
          .post('/api/v1/academic/grades/record')
          .set('Authorization', 'Bearer teacher-token')
          .send(gradeData)

        expect([200, 201]).toContain(response.status)
      })
    })

    describe('GET /grades/student/:studentId', () => {
      it('should retrieve all grades for a student', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.getStudentGrades.mockResolvedValue({
          success: true,
          grades: [
            { subject: 'Math', score: 85 },
            { subject: 'English', score: 90 },
          ],
        })

        const response = await request(app)
          .get('/api/v1/academic/grades/student/student-123')
          .set('Authorization', 'Bearer user-token')

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.grades)).toBe(true)
      })
    })

    describe('GET /grades/class/:classId/:subject', () => {
      it('should retrieve grades for a class and subject', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.getClassGrades.mockResolvedValue({
          success: true,
          grades: [],
        })

        const response = await request(app)
          .get('/api/v1/academic/grades/class/class-123/Math')
          .set('Authorization', 'Bearer teacher-token')

        expect(response.status).toBe(200)
      })
    })
  })

  describe('Assessment Endpoints', () => {
    describe('POST /assessments/create', () => {
      it('should create a new assessment', async () => {
        const assessmentData = {
          title: 'Mid-term Exam',
          classId: 'class-123',
          subject: 'Math',
          date: new Date().toISOString(),
          totalMarks: 100,
          duration: 120,
        }

        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.createAssessment.mockResolvedValue({
          success: true,
          assessment: { _id: 'assessment-123', ...assessmentData },
        })

        const response = await request(app)
          .post('/api/v1/academic/assessments/create')
          .set('Authorization', 'Bearer teacher-token')
          .send(assessmentData)

        expect([200, 201]).toContain(response.status)
      })
    })

    describe('GET /assessments/class/:classId', () => {
      it('should list assessments for a class', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.getClassAssessments.mockResolvedValue({
          success: true,
          assessments: [],
        })

        const response = await request(app)
          .get('/api/v1/academic/assessments/class/class-123')
          .set('Authorization', 'Bearer user-token')

        expect(response.status).toBe(200)
      })
    })

    describe('GET /assessments/:id', () => {
      it('should retrieve a specific assessment', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.getAssessmentById.mockResolvedValue({
          success: true,
          assessment: { _id: 'assessment-123', title: 'Mid-term Exam' },
        })

        const response = await request(app)
          .get('/api/v1/academic/assessments/assessment-123')
          .set('Authorization', 'Bearer user-token')

        expect(response.status).toBe(200)
      })
    })

    describe('PUT /assessments/update/:id', () => {
      it('should update an assessment', async () => {
        const updateData = { totalMarks: 110 }

        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.updateAssessment.mockResolvedValue({
          success: true,
          assessment: { _id: 'assessment-123', ...updateData },
        })

        const response = await request(app)
          .put('/api/v1/academic/assessments/update/assessment-123')
          .set('Authorization', 'Bearer teacher-token')
          .send(updateData)

        expect(response.status).toBe(200)
      })
    })
  })

  describe('Performance Endpoints', () => {
    describe('GET /performance/student/:studentId', () => {
      it('should retrieve student academic performance', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.getStudentPerformance.mockResolvedValue({
          success: true,
          performance: {
            averageGrade: 87.5,
            attendance: 95,
            subjects: [],
          },
        })

        const response = await request(app)
          .get('/api/v1/academic/performance/student/student-123')
          .set('Authorization', 'Bearer user-token')

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('performance')
      })
    })

    describe('GET /performance/class/:classId', () => {
      it('should retrieve class academic performance', async () => {
        const mockAcademicService = require('../../services/academic.service')
        mockAcademicService.getClassPerformance.mockResolvedValue({
          success: true,
          performance: {
            averageGrade: 85,
            attendance: 93,
          },
        })

        const response = await request(app)
          .get('/api/v1/academic/performance/class/class-123')
          .set('Authorization', 'Bearer teacher-token')

        expect(response.status).toBe(200)
      })
    })
  })
})
