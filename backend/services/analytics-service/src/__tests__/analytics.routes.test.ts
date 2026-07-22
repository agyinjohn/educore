import request from 'supertest'
import express from 'express'
import analyticsRoutes from '../routes/analytics.routes'
import * as analyticsService from '../services/analytics.service'

jest.mock('../services/analytics.service')

const app = express()
app.use(express.json())
app.use('/api/v1/analytics', analyticsRoutes)

describe('Analytics Routes', () => {
  describe('GET /api/v1/analytics/dashboard', () => {
    it('should return dashboard metrics for valid schoolId', async () => {
      const mockMetrics = {
        schoolId: 'school123',
        totalRevenue: 50000,
        totalStudents: 150,
        averageGrade: 85,
        attendanceRate: 92,
        totalStaff: 25,
      }

        ; (analyticsService.getDashboardMetrics as jest.Mock).mockResolvedValue(mockMetrics)

      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .query({ schoolId: 'school123' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockMetrics)
    })

    it('should return 400 for missing schoolId', async () => {
      const response = await request(app).get('/api/v1/analytics/dashboard')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should handle service errors gracefully', async () => {
      ; (analyticsService.getDashboardMetrics as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .query({ schoolId: 'school123' })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/analytics/finance/summary', () => {
    it('should return financial summary', async () => {
      const mockMetrics = {
        schoolId: 'school123',
        totalRevenue: 50000,
        totalCollected: 48000,
        outstanding: 2000,
        refunded: 500,
      }

        ; (analyticsService.getFinancialAnalytics as jest.Mock).mockResolvedValue(mockMetrics)

      const response = await request(app)
        .get('/api/v1/analytics/finance/summary')
        .query({ schoolId: 'school123' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockMetrics)
    })

    it('should return 400 for missing schoolId', async () => {
      const response = await request(app).get('/api/v1/analytics/finance/summary')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/analytics/finance/trends', () => {
    it('should return financial trends with date range', async () => {
      const mockTrends = {
        schoolId: 'school123',
        period: 'monthly',
        trends: [
          { month: 'January', revenue: 5000 },
          { month: 'February', revenue: 5500 },
        ],
      }

        ; (analyticsService.getFinancialAnalytics as jest.Mock).mockResolvedValue(mockTrends)

      const response = await request(app)
        .get('/api/v1/analytics/finance/trends')
        .query({
          schoolId: 'school123',
          startDate: '2024-01-01',
          endDate: '2024-02-29',
          period: 'monthly',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('GET /api/v1/analytics/academic/summary', () => {
    it('should return academic summary', async () => {
      const mockMetrics = {
        schoolId: 'school123',
        totalStudents: 150,
        averageGrade: 85,
        highestGrade: 98,
        lowestGrade: 65,
        gradeDistribution: {
          'A+': 30,
          'A': 40,
          'B': 50,
          'C': 20,
          'D': 10,
        },
      }

        ; (analyticsService.getAcademicAnalytics as jest.Mock).mockResolvedValue(mockMetrics)

      const response = await request(app)
        .get('/api/v1/analytics/academic/summary')
        .query({ schoolId: 'school123' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockMetrics)
    })

    it('should return 400 for missing schoolId', async () => {
      const response = await request(app).get('/api/v1/analytics/academic/summary')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/analytics/academic/performance', () => {
    it('should return academic performance metrics', async () => {
      const mockPerformance = {
        schoolId: 'school123',
        classId: 'class123',
        studentCount: 40,
        averageGrade: 87,
        performanceBySubject: {
          Mathematics: 88,
          English: 85,
          Science: 90,
        },
      }

        ; (analyticsService.getAcademicAnalytics as jest.Mock).mockResolvedValue(mockPerformance)

      const response = await request(app)
        .get('/api/v1/analytics/academic/performance')
        .query({
          schoolId: 'school123',
          classId: 'class123',
          metric: 'performance',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('GET /api/v1/analytics/operational/metrics', () => {
    it('should return operational metrics', async () => {
      const mockMetrics = {
        schoolId: 'school123',
        totalEnrolled: 150,
        activeStudents: 145,
        newEnrollments: 10,
        withdrawals: 2,
        attendanceRate: 92,
        averageAttendance: 138,
      }

        ; (analyticsService.getOperationalMetrics as jest.Mock).mockResolvedValue(mockMetrics)

      const response = await request(app)
        .get('/api/v1/analytics/operational/metrics')
        .query({ schoolId: 'school123' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockMetrics)
    })

    it('should return 400 for missing schoolId', async () => {
      const response = await request(app).get('/api/v1/analytics/operational/metrics')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/analytics/export', () => {
    it('should export analytics data as CSV', async () => {
      const mockCSV = 'schoolId,revenue,students\nschool123,50000,150'

        ; (analyticsService.exportAnalyticsData as jest.Mock).mockResolvedValue(mockCSV)

      const response = await request(app).post('/api/v1/analytics/export').send({
        schoolId: 'school123',
        dataType: 'all',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockCSV)
    })

    it('should export financial data only', async () => {
      const mockCSV = 'schoolId,revenue,collected\nschool123,50000,48000'

        ; (analyticsService.exportAnalyticsData as jest.Mock).mockResolvedValue(mockCSV)

      const response = await request(app).post('/api/v1/analytics/export').send({
        schoolId: 'school123',
        dataType: 'financial',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should export academic data only', async () => {
      const mockCSV = 'schoolId,students,avgGrade\nschool123,150,85'

        ; (analyticsService.exportAnalyticsData as jest.Mock).mockResolvedValue(mockCSV)

      const response = await request(app).post('/api/v1/analytics/export').send({
        schoolId: 'school123',
        dataType: 'academic',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should return 400 for missing schoolId', async () => {
      const response = await request(app).post('/api/v1/analytics/export').send({
        dataType: 'all',
      })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('schoolId')
    })

    it('should handle export errors gracefully', async () => {
      ; (analyticsService.exportAnalyticsData as jest.Mock).mockRejectedValue(
        new Error('Export failed')
      )

      const response = await request(app).post('/api/v1/analytics/export').send({
        schoolId: 'school123',
        dataType: 'all',
      })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await request(app).get('/api/v1/analytics/nonexistent')

      expect(response.status).toBe(404)
    })
  })
})
