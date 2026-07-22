import ReportService from '../services/report.service';
import ReportTemplate from '../models/ReportTemplate';
import GeneratedReport from '../models/GeneratedReport';
import ScheduledReport from '../models/ScheduledReport';
import { Types } from 'mongoose';

jest.mock('../models/ReportTemplate');
jest.mock('../models/GeneratedReport');
jest.mock('../models/ScheduledReport');

describe('ReportService', () => {
  const tenantId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const templateId = new Types.ObjectId().toString();
  const reportId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getReportTemplates', () => {
    it('should return all report templates for a tenant', async () => {
      const mockTemplates = [
        { _id: new Types.ObjectId(), name: 'Template 1', reportType: 'ACADEMIC' },
      ];
      (ReportTemplate.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTemplates),
      });

      const result = await ReportService.getReportTemplates(tenantId);

      expect(ReportTemplate.find).toHaveBeenCalledWith({ tenantId });
      expect(result).toEqual(mockTemplates);
    });

    it('should filter templates by reportType', async () => {
      const mockTemplates = [
        { _id: new Types.ObjectId(), name: 'Financial Report', reportType: 'FINANCIAL' },
      ];
      (ReportTemplate.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTemplates),
      });

      await ReportService.getReportTemplates(tenantId, { reportType: 'FINANCIAL' });

      expect(ReportTemplate.find).toHaveBeenCalledWith({
        tenantId,
        reportType: 'FINANCIAL',
      });
    });
  });

  describe('getReportTemplate', () => {
    it('should return a single template by ID', async () => {
      const mockTemplate = {
        _id: templateId,
        name: 'Test Template',
        tenantId,
      };
      (ReportTemplate.findOne as any as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await ReportService.getReportTemplate(tenantId, templateId);

      expect(ReportTemplate.findOne).toHaveBeenCalledWith({
        _id: templateId,
        tenantId,
      });
      expect(result).toEqual(mockTemplate);
    });

    it('should return null if template not found', async () => {
      (ReportTemplate.findOne as any as jest.Mock).mockResolvedValue(null);

      const result = await ReportService.getReportTemplate(tenantId, templateId);

      expect(result).toBeNull();
    });
  });

  describe('createReportTemplate', () => {
    it('should create a new report template', async () => {
      const templateData = {
        name: 'New Template',
        reportType: 'ACADEMIC' as const,
        sections: [],
        settings: {
          includeCharts: true,
          includeSummary: true,
          pageSize: 'A4' as const,
          orientation: 'PORTRAIT' as const,
        },
      };

      const mockSavedTemplate = {
        _id: templateId,
        ...templateData,
        tenantId,
        createdBy: userId,
      };

      const mockTemplate = {
        save: jest.fn().mockResolvedValue(mockSavedTemplate),
      };

      (ReportTemplate as any).mockImplementation(() => mockTemplate);

      const result = await ReportService.createReportTemplate(tenantId, templateData, userId);

      expect(result).toEqual(mockSavedTemplate);
      expect(mockTemplate.save).toHaveBeenCalled();
    });
  });

  describe('updateReportTemplate', () => {
    it('should update a report template', async () => {
      const updates = { name: 'Updated Template' };
      const mockUpdatedTemplate = {
        _id: templateId,
        name: 'Updated Template',
        tenantId,
      };

      (ReportTemplate.findOneAndUpdate as any as jest.Mock).mockResolvedValue(
        mockUpdatedTemplate
      );

      const result = await ReportService.updateReportTemplate(
        tenantId,
        templateId,
        updates,
        userId
      );

      expect(ReportTemplate.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedTemplate);
    });
  });

  describe('deleteReportTemplate', () => {
    it('should delete a report template', async () => {
      const mockDeletedTemplate = {
        _id: templateId,
        name: 'Deleted Template',
      };

      (ReportTemplate.findOneAndDelete as any as jest.Mock).mockResolvedValue(
        mockDeletedTemplate
      );

      const result = await ReportService.deleteReportTemplate(tenantId, templateId);

      expect(ReportTemplate.findOneAndDelete).toHaveBeenCalledWith({
        _id: templateId,
        tenantId,
      });
      expect(result).toEqual(mockDeletedTemplate);
    });
  });

  describe('generateReport', () => {
    it('should generate a report from a template', async () => {
      const mockTemplate = {
        _id: templateId,
        name: 'Test Template',
        reportType: 'ACADEMIC',
        sections: [
          {
            sectionId: 'sec1',
            title: 'Summary',
            type: 'SUMMARY',
          },
        ],
        settings: {
          includeSummary: true,
          includeCharts: true,
        },
      };

      (ReportTemplate.findOne as any as jest.Mock).mockResolvedValue(mockTemplate);

      const mockGeneratedReport = {
        _id: reportId,
        status: 'COMPLETED',
        data: {},
        save: jest.fn().mockResolvedValue({
          _id: reportId,
          status: 'COMPLETED',
          data: { template: { name: 'Test Template' } },
        }),
      };

      (GeneratedReport as any).mockImplementation(() => mockGeneratedReport);

      const result = await ReportService.generateReport(tenantId, templateId, 'PDF', {}, userId);

      expect(result._id).toBeDefined();
      expect(result.status).toBe('COMPLETED');
    });

    it('should throw error if template not found', async () => {
      (ReportTemplate.findOne as any as jest.Mock).mockResolvedValue(null);

      await expect(
        ReportService.generateReport(tenantId, templateId, 'PDF', {}, userId)
      ).rejects.toThrow('Report template not found');
    });
  });

  describe('getGeneratedReports', () => {
    it('should return generated reports for a tenant', async () => {
      const mockReports = [
        { _id: reportId, status: 'COMPLETED', format: 'PDF' },
      ];
      (GeneratedReport.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockReports),
        }),
      });

      const result = await ReportService.getGeneratedReports(tenantId);

      expect(result).toEqual(mockReports);
    });
  });

  describe('createScheduledReport', () => {
    it('should create a scheduled report', async () => {
      const scheduleData = {
        templateId: new Types.ObjectId(),
        name: 'Weekly Report',
        schedule: {
          frequency: 'WEEKLY' as const,
          time: '09:00',
          timezone: 'UTC',
        },
        format: 'PDF' as const,
        recipients: [{ email: 'admin@example.com', type: 'TO' as const }],
      };

      const mockScheduledReport = {
        _id: new Types.ObjectId(),
        ...scheduleData,
        tenantId,
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          ...scheduleData,
          tenantId,
        }),
      };

      (ScheduledReport as any).mockImplementation(() => mockScheduledReport);

      const result = await ReportService.createScheduledReport(
        tenantId,
        scheduleData,
        userId
      );

      expect(result).toBeDefined();
      expect(mockScheduledReport.save).toHaveBeenCalled();
    });
  });

  describe('getScheduledReports', () => {
    it('should return active scheduled reports', async () => {
      const mockScheduled = [
        {
          _id: new Types.ObjectId(),
          name: 'Weekly Report',
          isActive: true,
        },
      ];

      (ScheduledReport.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockScheduled),
      });

      const result = await ReportService.getScheduledReports(tenantId, { isActive: true });

      expect(result).toEqual(mockScheduled);
    });
  });

  describe('getReportStats', () => {
    it('should return report statistics', async () => {
      (ReportTemplate.countDocuments as any as jest.Mock).mockResolvedValue(5);
      (GeneratedReport.countDocuments as any as jest.Mock).mockResolvedValue(12);
      (ScheduledReport.countDocuments as any as jest.Mock).mockResolvedValue(3);

      const result = await ReportService.getReportStats(tenantId);

      expect(result.templates).toBe(5);
      expect(result.generated).toBe(12);
      expect(result.scheduled).toBe(3);
    });
  });
});
