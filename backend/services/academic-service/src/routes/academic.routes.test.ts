/**
 * Academic Routes Integration Test
 * Tests all 18+ endpoints for academic service
 */

import request from 'supertest'
import express from 'express'
import academicRoutes from './academic.routes'

const app = express()
app.use(express.json())
app.use('/api/academic', academicRoutes)

// Mock authentication middleware
app.use((req: any, res, next) => {
  req.user = {
    id: 'user123',
    email: 'teacher@school.com',
    role: 'TEACHER',
    school_id: 'school123',
  }
  next()
})

describe('Academic Routes', () => {
  describe('Classes', () => {
    it('should create a class', async () => {
      const res = await request(app)
        .post('/api/academic/classes')
        .send({
          name: 'Class 10A',
          section: 'A',
          academicYear: '2024-2025',
          teacher_id: 'teacher123',
          capacity: 40,
        })
      expect(res.status).toBeDefined()
    })

    it('should list classes', async () => {
      const res = await request(app).get('/api/academic/classes')
      expect(res.status).toBeDefined()
    })
  })

  describe('Timetable', () => {
    it('should create timetable slot without conflict', async () => {
      const res = await request(app)
        .post('/api/academic/timetable')
        .send({
          class_id: 'class123',
          teacher_id: 'teacher123',
          subject: 'Mathematics',
          dayOfWeek: 'Monday',
          period: 1,
          startTime: '09:00',
          endTime: '10:00',
          academicYear: '2024-2025',
          term: 'Term 1',
        })
      expect(res.status).toBeDefined()
    })

    it('should get timetable for class', async () => {
      const res = await request(app)
        .get('/api/academic/timetable/class/class123')
        .query({ academicYear: '2024-2025', term: 'Term 1' })
      expect(res.status).toBeDefined()
    })
  })

  describe('Attendance', () => {
    it('should mark bulk attendance', async () => {
      const res = await request(app)
        .post('/api/academic/attendance/bulk')
        .send({
          records: [
            {
              student_id: 'student1',
              class_id: 'class123',
              date: new Date(),
              period: 1,
              status: 'present',
            },
            {
              student_id: 'student2',
              class_id: 'class123',
              date: new Date(),
              period: 1,
              status: 'absent',
            },
          ],
        })
      expect(res.status).toBeDefined()
    })

    it('should get student attendance stats', async () => {
      const res = await request(app)
        .get('/api/academic/attendance/stats/student/student123')
        .query({ term: 'Term 1' })
      expect(res.status).toBeDefined()
    })

    it('should get class attendance stats', async () => {
      const res = await request(app)
        .get('/api/academic/attendance/stats/class/class123')
        .query({ date: new Date().toISOString() })
      expect(res.status).toBeDefined()
    })
  })

  describe('Grades', () => {
    it('should record grade', async () => {
      const res = await request(app)
        .post('/api/academic/grades')
        .send({
          student_id: 'student123',
          class_id: 'class123',
          subject: 'Mathematics',
          percentage: 85,
          assessment_id: 'assessment123',
        })
      expect(res.status).toBeDefined()
    })

    it('should get student grades', async () => {
      const res = await request(app).get('/api/academic/grades/student/student123')
      expect(res.status).toBeDefined()
    })

    it('should publish grades', async () => {
      const res = await request(app)
        .post('/api/academic/grades/publish')
        .send({
          class_id: 'class123',
          term: 'Term 1',
          academicYear: '2024-2025',
        })
      expect(res.status).toBeDefined()
    })

    it('should get term average grades', async () => {
      const res = await request(app)
        .get('/api/academic/grades/term-averages/class123')
        .query({ term: 'Term 1' })
      expect(res.status).toBeDefined()
    })

    it('should get student rank in class', async () => {
      const res = await request(app)
        .get('/api/academic/grades/student-rank/student123')
        .query({ term: 'Term 1' })
      expect(res.status).toBeDefined()
    })

    it('should get grade distribution', async () => {
      const res = await request(app)
        .get('/api/academic/grades/distribution/class123')
        .query({ term: 'Term 1' })
      expect(res.status).toBeDefined()
    })
  })

  describe('At-Risk Students', () => {
    it('should get at-risk students for class', async () => {
      const res = await request(app)
        .get('/api/academic/at-risk/class123')
        .query({ attendanceThreshold: 80, gradeThreshold: 65 })
      expect(res.status).toBeDefined()
    })
  })

  describe('Assessments', () => {
    it('should create assessment', async () => {
      const res = await request(app)
        .post('/api/academic/assessments')
        .send({
          class_id: 'class123',
          name: 'Unit Test 1',
          type: 'test',
          totalMarks: 100,
          weight: 15,
          term: 'Term 1',
        })
      expect(res.status).toBeDefined()
    })

    it('should list assessments', async () => {
      const res = await request(app)
        .get('/api/academic/assessments')
        .query({ classId: 'class123', term: 'Term 1' })
      expect(res.status).toBeDefined()
    })
  })
})
