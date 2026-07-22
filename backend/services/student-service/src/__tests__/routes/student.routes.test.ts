import request from 'supertest'
import express from 'express'

// Mock setup before importing routes
jest.mock('../../models/Student')
jest.mock('../../services/student.service')
jest.mock('../../config/db')

describe('Student Routes', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())

    // Dynamically require after mocks are set up
    const studentRoutes = require('../../routes/student.routes').default
    app.use('/api/v1/students', studentRoutes)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /create', () => {
    it('should successfully create a new student', async () => {
      const studentData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@school.com',
        dateOfBirth: '2010-05-15',
        gender: 'M',
        enrollmentDate: new Date().toISOString(),
        grade: '10A',
        schoolId: 'school-123',
      }

      const mockStudentService = require('../../services/student.service')
      mockStudentService.createStudent.mockResolvedValue({
        success: true,
        student: {
          _id: 'student-123',
          ...studentData,
        },
      })

      const response = await request(app)
        .post('/api/v1/students/create')
        .set('Authorization', 'Bearer admin-token')
        .send(studentData)

      expect([200, 201]).toContain(response.status)
      expect(response.body).toHaveProperty('success', true)
    })

    it('should fail with missing required fields', async () => {
      const incompleteData = {
        firstName: 'John',
        // Missing lastName, email, etc.
      }

      const response = await request(app)
        .post('/api/v1/students/create')
        .set('Authorization', 'Bearer admin-token')
        .send(incompleteData)

      expect(response.status).toBe(400)
    })
  })

  describe('GET /:id', () => {
    it('should retrieve a student by ID', async () => {
      const mockStudentService = require('../../services/student.service')
      mockStudentService.getStudentById.mockResolvedValue({
        success: true,
        student: {
          _id: 'student-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@school.com',
        },
      })

      const response = await request(app)
        .get('/api/v1/students/student-123')
        .set('Authorization', 'Bearer user-token')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('student')
    })

    it('should fail with non-existent student ID', async () => {
      const mockStudentService = require('../../services/student.service')
      mockStudentService.getStudentById.mockRejectedValue({
        message: 'Student not found',
      })

      const response = await request(app)
        .get('/api/v1/students/nonexistent-id')
        .set('Authorization', 'Bearer user-token')

      expect(response.status).toBeGreaterThanOrEqual(404)
    })
  })

  describe('PUT /update/:id', () => {
    it('should successfully update student information', async () => {
      const updateData = {
        firstName: 'Johnny',
        grade: '11A',
      }

      const mockStudentService = require('../../services/student.service')
      mockStudentService.updateStudent.mockResolvedValue({
        success: true,
        student: {
          _id: 'student-123',
          ...updateData,
        },
      })

      const response = await request(app)
        .put('/api/v1/students/update/student-123')
        .set('Authorization', 'Bearer admin-token')
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
    })
  })

  describe('DELETE /:id', () => {
    it('should successfully delete a student', async () => {
      const mockStudentService = require('../../services/student.service')
      mockStudentService.deleteStudent.mockResolvedValue({
        success: true,
        message: 'Student deleted',
      })

      const response = await request(app)
        .delete('/api/v1/students/student-123')
        .set('Authorization', 'Bearer admin-token')

      expect(response.status).toBe(200)
    })
  })

  describe('POST /bulk-import', () => {
    it('should successfully import students in bulk', async () => {
      const bulkData = {
        schoolId: 'school-123',
        students: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@school.com',
            dateOfBirth: '2010-05-15',
            gender: 'M',
            grade: '10A',
          },
          {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@school.com',
            dateOfBirth: '2010-06-20',
            gender: 'F',
            grade: '10A',
          },
        ],
      }

      const mockStudentService = require('../../services/student.service')
      mockStudentService.bulkImportStudents.mockResolvedValue({
        success: true,
        imported: 2,
        failed: 0,
      })

      const response = await request(app)
        .post('/api/v1/students/bulk-import')
        .set('Authorization', 'Bearer admin-token')
        .send(bulkData)

      expect([200, 201]).toContain(response.status)
      expect(response.body).toHaveProperty('imported')
    })
  })

  describe('GET /school/:schoolId', () => {
    it('should retrieve all students for a school', async () => {
      const mockStudentService = require('../../services/student.service')
      mockStudentService.getStudentsBySchool.mockResolvedValue({
        success: true,
        students: [
          { _id: 'student-1', firstName: 'John' },
          { _id: 'student-2', firstName: 'Jane' },
        ],
        total: 2,
      })

      const response = await request(app)
        .get('/api/v1/students/school/school-123')
        .set('Authorization', 'Bearer user-token')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body.students)).toBe(true)
    })
  })

  describe('GET /search', () => {
    it('should search students by name or email', async () => {
      const mockStudentService = require('../../services/student.service')
      mockStudentService.searchStudents.mockResolvedValue({
        success: true,
        students: [
          { _id: 'student-1', firstName: 'John', email: 'john@school.com' },
        ],
      })

      const response = await request(app)
        .get('/api/v1/students/search?q=john&schoolId=school-123')
        .set('Authorization', 'Bearer user-token')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body.students)).toBe(true)
    })
  })
})
