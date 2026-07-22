// AI Service API Client
// Matches backend/services/ai-service exactly (mounted at /ai behind the
// gateway). Predictive models, performance predictions, anomaly detection,
// and risk assessment — all fairly generic/free-form on the backend (no
// fixed metric schema), so types here stay loose rather than pretending to
// know a structure the API doesn't enforce.

import { apiClient, ApiResponse } from '../api-client';

export interface PredictionModel {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

export interface PerformancePrediction {
  id: string;
  studentId: string;
  modelId: string;
  prediction: Record<string, any>;
  createdAt: string;
}

export interface Anomaly {
  id: string;
  studentId: string;
  metrics: Record<string, any>;
  detectedAt: string;
  status: string;
}

export interface RiskAssessment {
  id: string;
  studentId: string;
  riskLevel: string;
  metrics: Record<string, any>;
  createdAt: string;
}

export class AiService {
  async getModels(): Promise<ApiResponse<PredictionModel[]>> {
    return apiClient.get<PredictionModel[]>('/ai/models');
  }

  async createModel(data: { name: string; type: string }): Promise<ApiResponse<PredictionModel>> {
    return apiClient.post<PredictionModel>('/ai/models', data);
  }

  async predictPerformance(studentId: string, modelId: string, features: Record<string, any>): Promise<ApiResponse<PerformancePrediction>> {
    return apiClient.post<PerformancePrediction>('/ai/predict', { studentId, modelId, features });
  }

  async getStudentPredictions(studentId: string): Promise<ApiResponse<PerformancePrediction[]>> {
    return apiClient.get<PerformancePrediction[]>(`/ai/predictions/${studentId}`);
  }

  async detectAnomalies(studentId: string, metrics: Record<string, any>): Promise<ApiResponse<Anomaly[]>> {
    return apiClient.post<Anomaly[]>('/ai/anomalies/detect', { studentId, metrics });
  }

  async getAnomalies(studentId: string): Promise<ApiResponse<Anomaly[]>> {
    return apiClient.get<Anomaly[]>(`/ai/anomalies/${studentId}`);
  }

  async assessRisk(studentId: string, metrics: Record<string, any>): Promise<ApiResponse<RiskAssessment>> {
    return apiClient.post<RiskAssessment>('/ai/risk-assess', { studentId, metrics });
  }

  async getRiskAssessments(): Promise<ApiResponse<RiskAssessment[]>> {
    return apiClient.get<RiskAssessment[]>('/ai/risk-assessments');
  }
}

export const aiService = new AiService();

export default aiService;
