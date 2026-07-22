// Report Service API Client
// Matches backend/services/report-service exactly (mounted at /reports
// behind the API gateway). Template-based reporting: create a
// ReportTemplate, then generate a GeneratedReport instance from it.

import { apiClient, ApiResponse } from '../api-client';

export type ReportType = 'ACADEMIC' | 'FINANCIAL' | 'ATTENDANCE' | 'CUSTOM';
export type ReportFormat = 'PDF' | 'EXCEL' | 'JSON' | 'CSV';
export type GeneratedReportStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface ReportSection {
  sectionId: string;
  title: string;
  type: 'HEADER' | 'CHART' | 'TABLE' | 'SUMMARY' | 'FOOTER';
  config?: Record<string, any>;
}

export interface ReportTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  reportType: ReportType;
  sections: ReportSection[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CreateReportTemplateRequest {
  name: string;
  description?: string;
  reportType: ReportType;
  sections?: ReportSection[];
}

export interface GeneratedReport {
  id: string;
  tenantId: string;
  templateId: string;
  title: string;
  status: GeneratedReportStatus;
  format: ReportFormat;
  fileUrl?: string;
  filters?: Record<string, any>;
  generatedAt: string;
  expiresAt: string;
  error?: { code: string; message: string };
}

export interface GenerateReportRequest {
  templateId: string;
  format: ReportFormat;
  filters?: Record<string, any>;
}

export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

export interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  schedule: {
    frequency: ScheduleFrequency;
    time: string;
    timezone: string;
  };
  format: ReportFormat;
  recipients: Array<{ email: string; type: 'TO' | 'CC' | 'BCC' }>;
  isActive: boolean;
  nextGenerationAt: string;
}

export interface CreateScheduledReportRequest {
  templateId: string;
  name: string;
  schedule: { frequency: ScheduleFrequency; time: string; timezone?: string };
  format: ReportFormat;
  recipients: Array<{ email: string; type?: 'TO' | 'CC' | 'BCC' }>;
}

export class ReportService {
  // ==================== Templates ====================

  async getTemplates(params?: { reportType?: string; isActive?: boolean }): Promise<ApiResponse<ReportTemplate[]>> {
    const query = params
      ? `?${Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${v}`).join('&')}`
      : '';
    return apiClient.get<ReportTemplate[]>(`/reports/templates${query}`);
  }

  async getTemplate(templateId: string): Promise<ApiResponse<ReportTemplate>> {
    return apiClient.get<ReportTemplate>(`/reports/templates/${templateId}`);
  }

  async createTemplate(request: CreateReportTemplateRequest): Promise<ApiResponse<ReportTemplate>> {
    return apiClient.post<ReportTemplate>('/reports/templates', { sections: [], ...request });
  }

  async deleteTemplate(templateId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/reports/templates/${templateId}`);
  }

  // ==================== Generate / Generated Reports ====================

  async generateReport(request: GenerateReportRequest): Promise<ApiResponse<GeneratedReport>> {
    return apiClient.post<GeneratedReport>('/reports/generate', request);
  }

  async getGeneratedReports(params?: { status?: string; format?: string; limit?: number }): Promise<ApiResponse<GeneratedReport[]>> {
    const query = params
      ? `?${Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${v}`).join('&')}`
      : '';
    return apiClient.get<GeneratedReport[]>(`/reports/generated${query}`);
  }

  async deleteGeneratedReport(reportId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/reports/generated/${reportId}`);
  }

  // ==================== Scheduled Reports ====================

  async getScheduledReports(): Promise<ApiResponse<ScheduledReport[]>> {
    return apiClient.get<ScheduledReport[]>('/reports/scheduled');
  }

  // The backend model requires nextGenerationAt but nothing computes it —
  // derive a first run time (tomorrow at the chosen time) rather than
  // asking the user to pick a raw timestamp.
  async createScheduledReport(request: CreateScheduledReportRequest): Promise<ApiResponse<ScheduledReport>> {
    const [hours, minutes] = request.schedule.time.split(':').map(Number);
    const nextGenerationAt = new Date();
    nextGenerationAt.setDate(nextGenerationAt.getDate() + 1);
    nextGenerationAt.setHours(hours || 0, minutes || 0, 0, 0);
    return apiClient.post<ScheduledReport>('/reports/scheduled', {
      ...request,
      schedule: { timezone: 'UTC', ...request.schedule },
      nextGenerationAt: nextGenerationAt.toISOString(),
    });
  }

  async deleteScheduledReport(scheduleId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/reports/scheduled/${scheduleId}`);
  }

  // ==================== Stats ====================

  async getStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/reports/stats');
  }
}

export const reportService = new ReportService();

export default reportService;
