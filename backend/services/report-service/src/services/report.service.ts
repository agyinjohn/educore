import { Types } from 'mongoose';
import ReportTemplate, { IReportTemplate } from '../models/ReportTemplate';
import GeneratedReport, { IGeneratedReport } from '../models/GeneratedReport';
import ScheduledReport, { IScheduledReport } from '../models/ScheduledReport';

export class ReportService {
  /**
   * Get all report templates for a tenant
   */
  async getReportTemplates(
    tenantId: Types.ObjectId,
    filters?: { reportType?: string; isActive?: boolean }
  ): Promise<any[]> {
    const query: any = { tenantId };
    if (filters?.reportType) query.reportType = filters.reportType;
    if (filters?.isActive !== undefined) query.isActive = filters.isActive;
    return ReportTemplate.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get a single report template by ID
   */
  async getReportTemplate(tenantId: Types.ObjectId, templateId: string): Promise<any> {
    return ReportTemplate.findOne({
      _id: templateId,
      tenantId,
    });
  }

  /**
   * Create a new report template
   */
  async createReportTemplate(
    tenantId: Types.ObjectId,
    templateData: Partial<IReportTemplate>,
    userId: Types.ObjectId
  ): Promise<any> {
    const template = new ReportTemplate({
      ...templateData,
      tenantId,
      createdBy: userId,
    });
    return template.save();
  }

  /**
   * Update an existing report template
   */
  async updateReportTemplate(
    tenantId: Types.ObjectId,
    templateId: string,
    updates: Partial<IReportTemplate>,
    userId: Types.ObjectId
  ): Promise<any> {
    return ReportTemplate.findOneAndUpdate(
      { _id: templateId, tenantId },
      {
        ...updates,
        lastModifiedBy: userId,
      },
      { new: true }
    );
  }

  /**
   * Delete a report template
   */
  async deleteReportTemplate(tenantId: Types.ObjectId, templateId: string): Promise<any> {
    return ReportTemplate.findOneAndDelete({
      _id: templateId,
      tenantId,
    });
  }

  /**
   * Generate a report from a template
   */
  async generateReport(
    tenantId: Types.ObjectId,
    templateId: string,
    format: 'PDF' | 'EXCEL' | 'JSON' | 'CSV',
    filters?: Record<string, any>,
    userId?: Types.ObjectId
  ): Promise<any> {
    const template = await ReportTemplate.findOne({
      _id: templateId,
      tenantId,
    });

    if (!template) {
      throw new Error('Report template not found');
    }

    // Create pending report
    const report = new GeneratedReport({
      tenantId,
      templateId,
      title: template.name,
      format,
      status: 'GENERATING',
      filters,
      data: {},
      generatedBy: userId || new Types.ObjectId(),
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await report.save();

    // Simulate report generation (in production, use a job queue)
    try {
      const reportData = await this.buildReportData(template, filters);
      report.data = reportData;
      report.status = 'COMPLETED';
      report.metadata.generationTime = Date.now() - report.generatedAt.getTime();
    } catch (error: any) {
      report.status = 'FAILED';
      report.error = {
        code: 'GENERATION_FAILED',
        message: error.message || 'Failed to generate report',
      };
    }

    return report.save();
  }

  /**
   * Build report data based on template configuration
   */
  private async buildReportData(
    template: IReportTemplate,
    filters?: Record<string, any>
  ): Promise<Record<string, any>> {
    const data: Record<string, any> = {
      template: {
        name: template.name,
        type: template.reportType,
        generatedAt: new Date().toISOString(),
      },
      sections: {},
    };

    // Process each section
    for (const section of template.sections) {
      data.sections[section.sectionId] = {
        title: section.title,
        type: section.type,
        content: this.generateSectionContent(section.type, section.config),
      };
    }

    // Add summary if enabled
    if (template.settings.includeSummary) {
      data.summary = {
        totalRecords: Math.floor(Math.random() * 1000) + 100,
        generationTime: new Date().toISOString(),
      };
    }

    return data;
  }

  /**
   * Generate content for a specific section
   */
  private generateSectionContent(type: string, config?: Record<string, any>): any {
    switch (type) {
      case 'HEADER':
        return { title: config?.title || 'Report Header' };
      case 'SUMMARY':
        return {
          totalStudents: 450,
          averageGPA: 3.5,
          attendanceRate: 94.2,
        };
      case 'TABLE':
        return {
          headers: ['Name', 'Grade', 'Attendance'],
          rows: [
            ['John Doe', 'A', '95%'],
            ['Jane Smith', 'A-', '92%'],
          ],
        };
      case 'CHART':
        return {
          type: config?.chartType || 'BAR',
          labels: ['Jan', 'Feb', 'Mar'],
          values: [85, 90, 88],
        };
      case 'FOOTER':
        return { text: 'Report generated automatically' };
      default:
        return {};
    }
  }

  /**
   * Get generated reports
   */
  async getGeneratedReports(
    tenantId: Types.ObjectId,
    filters?: { status?: string; format?: string; limit?: number }
  ): Promise<any[]> {
    const query: any = { tenantId };
    if (filters?.status) query.status = filters.status;
    if (filters?.format) query.format = filters.format;

    return GeneratedReport.find(query)
      .sort({ createdAt: -1 })
      .limit(filters?.limit || 50);
  }

  /**
   * Get a specific generated report
   */
  async getGeneratedReport(tenantId: Types.ObjectId, reportId: string): Promise<any> {
    return GeneratedReport.findOne({
      _id: reportId,
      tenantId,
    });
  }

  /**
   * Delete a generated report
   */
  async deleteGeneratedReport(tenantId: Types.ObjectId, reportId: string): Promise<any> {
    return GeneratedReport.findOneAndDelete({
      _id: reportId,
      tenantId,
    });
  }

  /**
   * Create a scheduled report
   */
  async createScheduledReport(
    tenantId: Types.ObjectId,
    scheduleData: Partial<IScheduledReport>,
    userId: Types.ObjectId
  ): Promise<any> {
    const scheduled = new ScheduledReport({
      ...scheduleData,
      tenantId,
      createdBy: userId,
    });
    return scheduled.save();
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(
    tenantId: Types.ObjectId,
    filters?: { isActive?: boolean }
  ): Promise<any[]> {
    const query: any = { tenantId };
    if (filters?.isActive !== undefined) query.isActive = filters.isActive;
    return ScheduledReport.find(query).sort({ createdAt: -1 });
  }

  /**
   * Update a scheduled report
   */
  async updateScheduledReport(
    tenantId: Types.ObjectId,
    scheduleId: string,
    updates: Partial<IScheduledReport>
  ): Promise<any> {
    return ScheduledReport.findOneAndUpdate(
      { _id: scheduleId, tenantId },
      updates,
      { new: true }
    );
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(tenantId: Types.ObjectId, scheduleId: string): Promise<any> {
    return ScheduledReport.findOneAndDelete({
      _id: scheduleId,
      tenantId,
    });
  }

  /**
   * Get reports due for generation
   */
  async getReportsDueForGeneration(): Promise<any[]> {
    return ScheduledReport.find({
      isActive: true,
      nextGenerationAt: { $lte: new Date() },
    });
  }

  /**
   * Trigger scheduled report generation
   */
  async triggerScheduledReport(scheduledId: string): Promise<any> {
    const scheduled = await ScheduledReport.findById(scheduledId);
    if (!scheduled) {
      throw new Error('Scheduled report not found');
    }

    // Generate the report
    const report = await this.generateReport(
      scheduled.tenantId,
      scheduled.templateId.toString(),
      scheduled.format,
      scheduled.filters
    );

    // Update scheduled report metadata
    scheduled.lastGeneratedAt = new Date();
    scheduled.failureCount = report.status === 'FAILED' ? scheduled.failureCount + 1 : 0;
    scheduled.lastFailureReason = report.error?.message;
    scheduled.nextGenerationAt = this.calculateNextGeneration(scheduled);

    await scheduled.save();

    return report;
  }

  /**
   * Calculate next generation time based on schedule
   */
  private calculateNextGeneration(scheduled: IScheduledReport): Date {
    const now = new Date();
    const next = new Date(now);
    const [hours, minutes] = scheduled.schedule.time.split(':').map(Number);

    next.setHours(hours, minutes, 0, 0);

    switch (scheduled.schedule.frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'ANNUALLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }

  /**
   * Get report statistics
   */
  async getReportStats(tenantId: Types.ObjectId): Promise<any> {
    const [templateCount, generatedCount, scheduledCount] = await Promise.all([
      ReportTemplate.countDocuments({ tenantId }),
      GeneratedReport.countDocuments({ tenantId, status: 'COMPLETED' }),
      ScheduledReport.countDocuments({ tenantId, isActive: true }),
    ]);

    return {
      templates: templateCount,
      generated: generatedCount,
      scheduled: scheduledCount,
    };
  }
}

export default new ReportService();
