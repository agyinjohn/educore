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
  async createSchool(data: CreateSchoolRequest): Promise<ApiResponse<School>> {
    return apiClient.post<School>('/tenants', data);
  }

  async getSchool(id: string): Promise<ApiResponse<School>> {
    return apiClient.get<School>(`/tenants/${id}`);
  }

  async getSchoolBySubdomain(subdomain: string): Promise<ApiResponse<School>> {
    return apiClient.get<School>(`/tenants/subdomain/${subdomain}`);
  }
}

export const tenantService = new TenantService();
export default tenantService;
