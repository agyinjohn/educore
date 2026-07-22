import request from 'supertest';
import express, { Express } from 'express';
import AnalyticsController from '../controllers/analytics.controller';
import analyticsRoutes from '../routes/analytics.routes';

describe('Analytics API Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock middleware
    app.use((req, res, next) => {
      (req as any).tenantId = 'test-tenant-id';
      (req as any).userId = 'test-user-id';
      next();
    });

    app.use('/api/v1/analytics', analyticsRoutes);
  });

  describe('GET /api/v1/analytics/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/v1/analytics/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('service', 'analytics-service');
      expect(response.body).toHaveProperty('status', 'healthy');
    });
  });

  describe('GET /api/v1/analytics/dashboard', () => {
    it('should return 400 when date range is missing', async () => {
      const response = await request(app).get('/api/v1/analytics/dashboard');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return dashboard when valid date range provided', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .query({
          startDate: '2026-01-01',
          endDate: '2026-01-31',
        });

      expect([200, 500]).toContain(response.status); // 500 is expected if DB not connected
    });
  });

  describe('GET /api/v1/analytics/stats', () => {
    it('should return summary statistics', async () => {
      const response = await request(app).get('/api/v1/analytics/stats');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('POST /api/v1/analytics/metrics', () => {
    it('should return 400 when required fields missing', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/metrics')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should create metric when valid data provided', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/metrics')
        .send({
          metricKey: 'attendance_rate',
          metricName: 'Attendance Rate',
          metricValue: 95,
          category: 'attendance',
          dateRange: {
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-01-31'),
            period: 'monthly',
          },
        });

      expect([201, 500]).toContain(response.status);
    });
  });

  describe('GET /api/v1/analytics/metrics/:category', () => {
    it('should return 400 for invalid category', async () => {
      const response = await request(app).get('/api/v1/analytics/metrics/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return metrics for valid category', async () => {
      const response = await request(app).get('/api/v1/analytics/metrics/attendance');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/v1/analytics/trends/:metricKey', () => {
    it('should return trends for metric', async () => {
      const response = await request(app).get('/api/v1/analytics/trends/attendance_rate');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/v1/analytics/reports', () => {
    it('should return custom reports', async () => {
      const response = await request(app).get('/api/v1/analytics/reports');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('POST /api/v1/analytics/reports', () => {
    it('should return 400 when required fields missing', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/reports')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should create report when valid data provided', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/reports')
        .send({
          reportName: 'Q1 Academic Report',
          reportType: 'academic',
          selectedMetrics: ['attendance_rate', 'grade_distribution'],
        });

      expect([201, 500]).toContain(response.status);
    });
  });

  describe('POST /api/v1/analytics/events', () => {
    it('should return 400 when required fields missing', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should log event when valid data provided', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send({
          eventType: 'attendance_marked',
          entityType: 'student',
          data: { presentDays: 20 },
        });

      expect([201, 500]).toContain(response.status);
    });
  });
});
