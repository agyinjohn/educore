// Student Service API Client
// Matches backend/services/student-service exactly (mounted at /students
// behind the API gateway).

import { apiClient, ApiResponse } from '../api-client';

// ============================================================================
// Types & Interfaces (mirror the backend Mongoose model)
// ============================================================================

export type StudentStatus = 'active' | 'inactive' | 'suspended' | 'graduated' | 'withdrawn';

export interface Guardian {
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
}

export interface Student {
  id: string;
  school_id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  gender?: 'M' | 'F' | 'Other';
  class_id?: string;
  admissionNumber?: string;
  enrolmentDate: string;
  status: StudentStatus;
  guardians: Guardian[];
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  medicalInfo?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  gender?: 'M' | 'F' | 'Other';
  class_id?: string;
  admissionNumber?: string;
  enrolmentDate?: string;
  guardians?: Guardian[];
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  medicalInfo?: string;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  status?: StudentStatus;
}

// The backend returns { success, data: Student[], cursor, hasMore } — after
// apiClient's envelope-unwrapping interceptor, res.data IS the Student[]
// with cursor/hasMore merged on as extra properties (no exact total; the
// list is cursor-paginated).
export type StudentPage = Student[] & { cursor: string | null; hasMore: boolean };

export interface StudentListParams {
  limit?: number;
  cursor?: string;
  status?: string;
  class_id?: string;
}

// ============================================================================
// Student Service Class
// ============================================================================

export class StudentService {
  // Get all students
  async getStudents(params?: StudentListParams): Promise<ApiResponse<StudentPage>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return apiClient.get<StudentPage>(`/students${query ? `?${query}` : ''}`);
  }

  // Get student by ID
  async getStudent(id: string): Promise<ApiResponse<Student>> {
    return apiClient.get<Student>(`/students/${id}`);
  }

  // Create new student
  async createStudent(request: CreateStudentRequest): Promise<ApiResponse<Student>> {
    return apiClient.post<Student>('/students', request);
  }

  // Update student
  async updateStudent(id: string, request: UpdateStudentRequest): Promise<ApiResponse<Student>> {
    return apiClient.put<Student>(`/students/${id}`, request);
  }

  // Delete student
  async deleteStudent(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/students/${id}`);
  }

  // Bulk import students — backend returns { success, count, data: Student[] }
  async bulkImportStudents(students: CreateStudentRequest[]): Promise<ApiResponse<Student[] & { count: number }>> {
    return apiClient.post(`/students/import/bulk`, { students });
  }
}

// ============================================================================
// Default Student Service Instance
// ============================================================================

export const studentService = new StudentService();

export default studentService;
