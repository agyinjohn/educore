import { AnalyticsService } from '../services/analytics.service';
import { DashboardMetric, CustomReport, AnalyticsEvent, DataCache } from '../models';
import { Types } from 'mongoose';

// Mock the models
jest.mock('../models');

describe('AnalyticsService', () => {
  const analyticsService = new AnalyticsService();
  const tenantId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should retrieve dashboard metrics', async () => {
      const mockDashboard = {
        attendanceMetric: { metricKey: 'attendance_rate', metricValue: 95 },
        gradeMetric: { metricKey: 'grade_distribution', metricValue: 3.5 },
        enrollmentMetric: { metricKey: 'enrollment_trend', metricValue: 250 },
        engagementMetric: { metricKey: 'student_engagement', metricValue: 87 },
      };

      (DashboardMetric.findOne as any as jest.Mock).mockResolvedValue(mockDashboard);

      const result = await analyticsService.getDashboard(tenantId, {
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
      });

      expect(result).toHaveProperty('dashboard');
      expect(result).toHaveProperty('lastUpdated');
    });
  });

  describe('getMetricsByCategory', () => {
    it('should retrieve metrics by category', async () => {
      const mockMetrics = [
        { metricKey: 'attendance_rate', category: 'attendance', metricValue: 95 },
        { metricKey: 'enrollment_trend', category: 'attendance', metricValue: 250 },
      ];

      (DashboardMetric.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockMetrics),
        }),
      });

      const result = await analyticsService.getMetricsByCategory(tenantId, 'attendance');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('metricKey');
    });
  });

  describe('getMetricTrends', () => {
    it('should retrieve metric trends', async () => {
      const mockTrends = [
        {
          metricKey: 'attendance_rate',
          metricValue: 95,
          dateRange: { period: 'monthly' },
        },
        {
          metricKey: 'attendance_rate',
          metricValue: 94,
          dateRange: { period: 'monthly' },
        },
      ];

      (DashboardMetric.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockTrends),
        }),
      });

      const result = await analyticsService.getMetricTrends(tenantId, 'attendance_rate');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('metricKey', 'attendance_rate');
    });
  });

  describe('upsertMetric', () => {
    it('should create or update a metric', async () => {
      const metricData = {
        metricKey: 'attendance_rate',
        metricName: 'Attendance Rate',
        metricValue: 95,
        category: 'attendance',
        dateRange: {
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-01-31'),
          period: 'monthly',
        },
      };

      const mockMetric = { _id: new Types.ObjectId(), ...metricData };

      (DashboardMetric.findOneAndUpdate as any as jest.Mock).mockResolvedValue(mockMetric);

      const result = await analyticsService.upsertMetric(tenantId, metricData);

      expect(result).toHaveProperty('metricKey', 'attendance_rate');
      expect(result).toHaveProperty('metricValue', 95);
    });
  });

  describe('getCustomReports', () => {
    it('should retrieve custom reports', async () => {
      const mockReports = [
        { reportName: 'Monthly Academic Report', reportType: 'academic' },
        { reportName: 'Attendance Summary', reportType: 'attendance' },
      ];

      (CustomReport.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockReports),
      });

      const result = await analyticsService.getCustomReports(tenantId);

      expect(result).toHaveLength(2);
    });
  });

  describe('createCustomReport', () => {
    it('should create a new custom report', async () => {
      const reportData = {
        reportName: 'Q1 Academic Performance',
        reportType: 'academic',
        selectedMetrics: ['attendance_rate', 'grade_distribution'],
      };

      const mockReport = {
        _id: new Types.ObjectId(),
        ...reportData,
        generationCount: 0,
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          ...reportData,
          generationCount: 0,
        }),
      };

      (CustomReport as any as jest.Mock).mockImplementation(() => mockReport);

      const result = await analyticsService.createCustomReport(tenantId, reportData);

      expect(result).toHaveProperty('reportName', 'Q1 Academic Performance');
      expect(result).toHaveProperty('generationCount', 0);
    });
  });

  describe('logEvent', () => {
    it('should log an analytics event', async () => {
      const eventData = {
        eventType: 'attendance_marked',
        entityType: 'student',
        data: { studentId: new Types.ObjectId(), presentDays: 20 },
      };

      const mockEvent = {
        _id: new Types.ObjectId(),
        ...eventData,
        timestamp: new Date(),
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          ...eventData,
          timestamp: new Date(),
        }),
      };

      (AnalyticsEvent as any as jest.Mock).mockImplementation(() => mockEvent);

      const result = await analyticsService.logEvent(tenantId, eventData);

      expect(result).toHaveProperty('eventType', 'attendance_marked');
    });
  });

  describe('getSummaryStats', () => {
    it('should retrieve summary statistics', async () => {
      (DashboardMetric.countDocuments as any as jest.Mock).mockResolvedValue(42);
      (CustomReport.countDocuments as any as jest.Mock).mockResolvedValue(8);
      (AnalyticsEvent.countDocuments as any as jest.Mock).mockResolvedValue(156);

      const result = await analyticsService.getSummaryStats(tenantId);

      expect(result).toHaveProperty('metricsCount', 42);
      expect(result).toHaveProperty('reportsCount', 8);
      expect(result).toHaveProperty('eventsCount', 156);
      expect(result).toHaveProperty('cacheStatus', 'active');
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache by key', async () => {
      (DataCache.deleteOne as any as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const result = await analyticsService.invalidateCache(tenantId, 'dashboard_metrics');

      expect(result).toBeDefined();
    });

    it('should invalidate all cache for tenant', async () => {
      (DataCache.deleteMany as any as jest.Mock).mockResolvedValue({ deletedCount: 5 });

      const result = await analyticsService.invalidateCache(tenantId);

      expect(result).toBeDefined();
    });
  });
});
