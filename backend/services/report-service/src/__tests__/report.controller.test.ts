import { Request, Response } from 'express';
import ReportController from '../controllers/report.controller';
import ReportService from '../services/report.service';
import { Types } from 'mongoose';

jest.mock('../services/report.service');

describe('ReportController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const tenantId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const templateId = new Types.ObjectId().toString();
  const reportId = new Types.ObjectId().toString();

  beforeEach(() => {
    mockRequest = {
      headers: {
        'x-tenant-id': tenantId.toString(),
        'x-user-id': userId.toString(),
      },
      params: {},
      query: {},
      body: {},
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('health', () => {
    it('should return healthy status', async () => {
      await ReportController.health(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'report-service',
        })
      );
    });
  });

  describe('getTemplates', () => {
    it('should get all report templates', async () => {
      const mockTemplates = [
        { _id: templateId, name: 'Template 1', reportType: 'ACADEMIC' },
      ];

      (ReportService.getReportTemplates as jest.Mock).mockResolvedValue(mockTemplates);

      await ReportController.getTemplates(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTemplates,
          count: 1,
        })
      );
    });

    it('should handle errors when fetching templates', async () => {
      (ReportService.getReportTemplates as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await ReportController.getTemplates(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Database error',
        })
      );
    });
  });

  describe('createTemplate', () => {
    it('should create a new report template', async () => {
      mockRequest.body = {
        name: 'New Template',
        reportType: 'ACADEMIC',
        sections: [],
        settings: {
          includeCharts: true,
          includeSummary: true,
          pageSize: 'A4',
          orientation: 'PORTRAIT',
        },
      };

      const mockTemplate = {
        _id: templateId,
        ...mockRequest.body,
        tenantId,
        createdBy: userId,
      };

      (ReportService.createReportTemplate as jest.Mock).mockResolvedValue(mockTemplate);

      await ReportController.createTemplate(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTemplate,
        })
      );
    });

    it('should handle errors when creating template', async () => {
      (ReportService.createReportTemplate as jest.Mock).mockRejectedValue(
        new Error('Validation error')
      );

      await ReportController.createTemplate(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation error',
        })
      );
    });
  });

  describe('generateReport', () => {
    it('should generate a report', async () => {
      mockRequest.body = {
        templateId,
        format: 'PDF',
        filters: { startDate: '2024-01-01' },
      };

      const mockReport = {
        _id: reportId,
        status: 'COMPLETED',
        format: 'PDF',
        data: {},
      };

      (ReportService.generateReport as jest.Mock).mockResolvedValue(mockReport);

      await ReportController.generateReport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockReport,
        })
      );
    });

    it('should handle missing required fields', async () => {
      mockRequest.body = { templateId };

      (ReportService.generateReport as jest.Mock).mockRejectedValue(
        new Error('Format is required')
      );

      await ReportController.generateReport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getGeneratedReports', () => {
    it('should get generated reports with filters', async () => {
      mockRequest.query = { status: 'COMPLETED', format: 'PDF' };

      const mockReports = [
        {
          _id: reportId,
          status: 'COMPLETED',
          format: 'PDF',
        },
      ];

      (ReportService.getGeneratedReports as jest.Mock).mockResolvedValue(mockReports);

      await ReportController.getGeneratedReports(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockReports,
          count: 1,
        })
      );
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a report template', async () => {
      mockRequest.params = { templateId };

      (ReportService.deleteReportTemplate as jest.Mock).mockResolvedValue({
        _id: templateId,
      });

      await ReportController.deleteTemplate(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Template deleted successfully',
        })
      );
    });

    it('should return 404 if template not found', async () => {
      mockRequest.params = { templateId };

      (ReportService.deleteReportTemplate as jest.Mock).mockResolvedValue(null);

      await ReportController.deleteTemplate(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Template not found',
        })
      );
    });
  });

  describe('createScheduledReport', () => {
    it('should create a scheduled report', async () => {
      mockRequest.body = {
        templateId,
        name: 'Weekly Report',
        schedule: {
          frequency: 'WEEKLY',
          time: '09:00',
          timezone: 'UTC',
        },
        format: 'PDF',
        recipients: [{ email: 'admin@example.com', type: 'TO' }],
      };

      const mockScheduled = {
        _id: new Types.ObjectId(),
        ...mockRequest.body,
        tenantId,
      };

      (ReportService.createScheduledReport as jest.Mock).mockResolvedValue(mockScheduled);

      await ReportController.createScheduledReport(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });

  describe('getStats', () => {
    it('should return report statistics', async () => {
      const mockStats = {
        templates: 5,
        generated: 12,
        scheduled: 3,
      };

      (ReportService.getReportStats as jest.Mock).mockResolvedValue(mockStats);

      await ReportController.getStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockStats,
        })
      );
    });
  });
});
