// Analytics Service API Client
// Matches backend/services/analytics-service exactly (mounted at /analytics
// behind the API gateway). The backend only exposes pre-aggregated metric
// documents — there is no per-student/per-course analytics endpoint yet.

import { apiClient, ApiResponse } from '../api-client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type MetricCategory = 'academic' | 'attendance' | 'finance' | 'engagement' | 'operations';
export type TrendPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DashboardMetric {
  metricKey: string;
  category: MetricCategory;
  value: number;
  [key: string]: any;
}

export interface DashboardOverview {
  dashboard: {
    attendance: DashboardMetric | null;
    grades: DashboardMetric | null;
    enrollment: DashboardMetric | null;
    engagement: DashboardMetric | null;
  };
  lastUpdated: string;
}

export interface CustomReport {
  id: string;
  name: string;
  metrics: string[];
  createdAt: string;
}

export interface SummaryStats {
  [key: string]: any;
}

// ============================================================================
// Analytics Service Class
// ============================================================================

export class AnalyticsService {
  // ==================== Dashboard ====================

  // startDate/endDate are required by the backend (ISO date strings)
  async getDashboardOverview(startDate: string, endDate: string): Promise<ApiResponse<DashboardOverview>> {
    return apiClient.get<DashboardOverview>(
      `/analytics/dashboard?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );
  }

  // ==================== Metrics ====================

  async getMetricsByCategory(category: MetricCategory, limit = 10): Promise<ApiResponse<DashboardMetric[]>> {
    return apiClient.get<DashboardMetric[]>(`/analytics/metrics/${category}?limit=${limit}`);
  }

  async getMetricTrends(metricKey: string, period: TrendPeriod = 'monthly', limit = 12): Promise<ApiResponse<DashboardMetric[]>> {
    return apiClient.get<DashboardMetric[]>(`/analytics/trends/${metricKey}?period=${period}&limit=${limit}`);
  }

  async upsertMetric(metric: Record<string, any>): Promise<ApiResponse<DashboardMetric>> {
    return apiClient.post<DashboardMetric>('/analytics/metrics', metric);
  }

  // ==================== Custom Reports ====================

  async getCustomReports(): Promise<ApiResponse<CustomReport[]>> {
    return apiClient.get<CustomReport[]>('/analytics/reports');
  }

  async createCustomReport(report: { name: string; metrics: string[] }): Promise<ApiResponse<CustomReport>> {
    return apiClient.post<CustomReport>('/analytics/reports', report);
  }

  async updateCustomReport(reportId: string, report: Partial<{ name: string; metrics: string[] }>): Promise<ApiResponse<CustomReport>> {
    return apiClient.put<CustomReport>(`/analytics/reports/${reportId}`, report);
  }

  async deleteCustomReport(reportId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/analytics/reports/${reportId}`);
  }

  // ==================== Stats & Events ====================

  async getSummaryStats(): Promise<ApiResponse<SummaryStats>> {
    return apiClient.get<SummaryStats>('/analytics/stats');
  }

  async logEvent(event: Record<string, any>): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/analytics/events', event);
  }
}

// ============================================================================
// Default Analytics Service Instance
// ============================================================================

export const analyticsService = new AnalyticsService();

export default analyticsService;
