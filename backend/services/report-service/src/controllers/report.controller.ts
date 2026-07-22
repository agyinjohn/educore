import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ReportService from '../services/report.service';

export class ReportController {
  /**
   * GET /api/v1/reports/health
   */
  async health(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'healthy',
      service: 'report-service',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * GET /api/v1/reports/templates
   */
  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { reportType, isActive } = req.query;

      const templates = await ReportService.getReportTemplates(tenantId, {
        reportType: reportType as string,
        isActive: isActive === 'true',
      });

      res.json({
        success: true,
        data: templates,
        count: templates.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/reports/templates/:templateId
   */
  async getTemplate(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { templateId } = req.params;

      const template = await ReportService.getReportTemplate(tenantId, templateId);

      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found',
        });
        return;
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/v1/reports/templates
   */
  async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const userId = new Types.ObjectId(req.headers['x-user-id'] as string);
      const templateData = req.body;

      const template = await ReportService.createReportTemplate(
        tenantId,
        templateData,
        userId
      );

      res.status(201).json({
        success: true,
        data: template,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/v1/reports/templates/:templateId
   */
  async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const userId = new Types.ObjectId(req.headers['x-user-id'] as string);
      const { templateId } = req.params;

      const template = await ReportService.updateReportTemplate(
        tenantId,
        templateId,
        req.body,
        userId
      );

      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found',
        });
        return;
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/v1/reports/templates/:templateId
   */
  async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { templateId } = req.params;

      const template = await ReportService.deleteReportTemplate(tenantId, templateId);

      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/v1/reports/generate
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const userId = new Types.ObjectId(req.headers['x-user-id'] as string);
      const { templateId, format, filters } = req.body;

      const report = await ReportService.generateReport(
        tenantId,
        templateId,
        format,
        filters,
        userId
      );

      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/reports/generated
   */
  async getGeneratedReports(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { status, format, limit } = req.query;

      const reports = await ReportService.getGeneratedReports(tenantId, {
        status: status as string,
        format: format as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        data: reports,
        count: reports.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/reports/generated/:reportId
   */
  async getGeneratedReport(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { reportId } = req.params;

      const report = await ReportService.getGeneratedReport(tenantId, reportId);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found',
        });
        return;
      }

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/v1/reports/generated/:reportId
   */
  async deleteGeneratedReport(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { reportId } = req.params;

      const report = await ReportService.deleteGeneratedReport(tenantId, reportId);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/v1/reports/scheduled
   */
  async createScheduledReport(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const userId = new Types.ObjectId(req.headers['x-user-id'] as string);
      const scheduleData = req.body;

      const scheduled = await ReportService.createScheduledReport(
        tenantId,
        scheduleData,
        userId
      );

      res.status(201).json({
        success: true,
        data: scheduled,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/reports/scheduled
   */
  async getScheduledReports(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { isActive } = req.query;

      const scheduled = await ReportService.getScheduledReports(tenantId, {
        isActive: isActive === 'true',
      });

      res.json({
        success: true,
        data: scheduled,
        count: scheduled.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/v1/reports/scheduled/:scheduleId
   */
  async updateScheduledReport(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { scheduleId } = req.params;

      const scheduled = await ReportService.updateScheduledReport(
        tenantId,
        scheduleId,
        req.body
      );

      if (!scheduled) {
        res.status(404).json({
          success: false,
          error: 'Scheduled report not found',
        });
        return;
      }

      res.json({
        success: true,
        data: scheduled,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/v1/reports/scheduled/:scheduleId
   */
  async deleteScheduledReport(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { scheduleId } = req.params;

      const scheduled = await ReportService.deleteScheduledReport(tenantId, scheduleId);

      if (!scheduled) {
        res.status(404).json({
          success: false,
          error: 'Scheduled report not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Scheduled report deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/reports/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const stats = await ReportService.getReportStats(tenantId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new ReportController();
