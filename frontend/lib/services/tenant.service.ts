import { apiClient, ApiResponse } from '../api-client';

export interface CreateSchoolRequest {
  name: string;
  subdomain: string;
  country?: string;
  timezone?: string;
  currency?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  gradingScale?: 'percentage' | 'gpa' | 'letter' | 'custom';
  termStructure?: 'trimester' | 'semester' | 'quarter';
}

export interface School {
  id: string;
  name: string;
  subdomain: string;
  country: string;
  timezone: string;
  currency: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  subscriptionTier: string;
  status: string;
  ownerId: string;
  createdAt: string;
}

class TenantService {
  private baseURL = process.env.NEXT_PUBLIC_TENANT_API_URL || 'http://localhost:4005';

  async createSchool(data: CreateSchoolRequest): Promise<ApiResponse<School>> {
    return apiClient.post<School>(`${this.baseURL}/schools`, data);
  }

  async getSchool(id: string): Promise<ApiResponse<School>> {
    return apiClient.get<School>(`${this.baseURL}/schools/${id}`);
  }
}

export const tenantService = new TenantService();
export default tenantService;
