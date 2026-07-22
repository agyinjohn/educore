import { Request, Response } from 'express';
import { analyticsService } from '../services';

export class AnalyticsController {
  /**
   * GET /api/v1/analytics/dashboard
   * Get dashboard overview with key metrics
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate and endDate query parameters are required',
        });
      }

      const dashboard = await analyticsService.getDashboard(tenantId, {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get dashboard',
      });
    }
  }

  /**
   * GET /api/v1/analytics/metrics/:category
   * Get metrics by category (academic, attendance, finance, engagement, operations)
   */
  async getMetricsByCategory(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { category } = req.params;
      const { limit } = req.query;

      const validCategories = ['academic', 'attendance', 'finance', 'engagement', 'operations'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        });
      }

      const metrics = await analyticsService.getMetricsByCategory(
        tenantId,
        category as any,
        parseInt(limit as string) || 10
      );

      res.status(200).json({
        success: true,
        data: metrics,
        count: metrics.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get metrics',
      });
    }
  }

  /**
   * GET /api/v1/analytics/trends/:metricKey
   * Get metric trends over time
   */
  async getMetricTrends(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { metricKey } = req.params;
      const { period, limit } = req.query;

      const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
      const selectedPeriod = (period as string) || 'monthly';

      if (!validPeriods.includes(selectedPeriod)) {
        return res.status(400).json({
          success: false,
          error: `Invalid period. Must be one of: ${validPeriods.join(', ')}`,
        });
      }

      const trends = await analyticsService.getMetricTrends(
        tenantId,
        metricKey,
        selectedPeriod as any,
        parseInt(limit as string) || 12
      );

      res.status(200).json({
        success: true,
        data: trends,
        count: trends.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get trends',
      });
    }
  }

  /**
   * POST /api/v1/analytics/metrics
   * Create or update a dashboard metric
   */
  async upsertMetric(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const metricData = req.body;

      // Validate required fields
      if (!metricData.metricKey || !metricData.metricName || metricData.metricValue === undefined) {
        return res.status(400).json({
          success: false,
          error: 'metricKey, metricName, and metricValue are required',
        });
      }

      const metric = await analyticsService.upsertMetric(tenantId, metricData);

      res.status(201).json({
        success: true,
        data: metric,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create/update metric',
      });
    }
  }

  /**
   * GET /api/v1/analytics/reports
   * Get all custom reports for a tenant
   */
  async getCustomReports(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { reportType, createdBy } = req.query;

      const filter: any = {};
      if (reportType) filter.reportType = reportType;
      if (createdBy) filter.createdBy = createdBy;

      const reports = await analyticsService.getCustomReports(tenantId, filter);

      res.status(200).json({
        success: true,
        data: reports,
        count: reports.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get reports',
      });
    }
  }

  /**
   * POST /api/v1/analytics/reports
   * Create a new custom report
   */
  async createCustomReport(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const userId = (req as any).userId;
      const reportData = req.body;

      if (!reportData.reportName || !reportData.reportType) {
        return res.status(400).json({
          success: false,
          error: 'reportName and reportType are required',
        });
      }

      const report = await analyticsService.createCustomReport(tenantId, {
        ...reportData,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create report',
      });
    }
  }

  /**
   * PUT /api/v1/analytics/reports/:reportId
   * Update a custom report
   */
  async updateCustomReport(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const updates = req.body;

      const report = await analyticsService.updateCustomReport(reportId, updates);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found',
        });
      }

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update report',
      });
    }
  }

  /**
   * DELETE /api/v1/analytics/reports/:reportId
   * Delete a custom report
   */
  async deleteCustomReport(req: Request, res: Response) {
    try {
      const { reportId } = req.params;

      const result = await analyticsService.deleteCustomReport(reportId);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Report not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete report',
      });
    }
  }

  /**
   * GET /api/v1/analytics/stats
   * Get summary statistics
   */
  async getSummaryStats(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;

      const stats = await analyticsService.getSummaryStats(tenantId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get stats',
      });
    }
  }

  /**
   * POST /api/v1/analytics/events
   * Log an analytics event
   */
  async logEvent(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const eventData = req.body;

      if (!eventData.eventType || !eventData.entityType) {
        return res.status(400).json({
          success: false,
          error: 'eventType and entityType are required',
        });
      }

      const event = await analyticsService.logEvent(tenantId, {
        ...eventData,
        userId: (req as any).userId,
      });

      res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to log event',
      });
    }
  }

  /**
   * GET /api/v1/analytics/health
   * Health check endpoint
   */
  async health(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      service: 'analytics-service',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date(),
    });
  }
}

export default new AnalyticsController();
