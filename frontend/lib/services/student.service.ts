// Student Service API Client
// Handles student management, enrollment, and profile operations

import { apiClient, ApiResponse } from '../api-client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Student {
  id: string;
  userId: string;
  enrollmentNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  parentName: string;
  parentPhoneNumber: string;
  parentEmail: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  currentClass: string;
  section: string;
  rollNumber: number;
  admissionType: string;
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  parentName: string;
  parentPhoneNumber: string;
  parentEmail: string;
  enrollmentType: string;
  currentClass: string;
  section: string;
  admissionType: string;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  class?: string;
  section?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}

// ============================================================================
// Student Service Class
// ============================================================================

export class StudentService {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL =
      baseURL || process.env.NEXT_PUBLIC_STUDENT_API_URL || 'http://localhost:4001';
  }

  // Get all students
  async getStudents(params?: StudentListParams): Promise<ApiResponse<StudentListResponse>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return apiClient.get<StudentListResponse>(
      `${this.baseURL}/students${query ? `?${query}` : ''}`
    );
  }

  // Get student by ID
  async getStudent(id: string): Promise<ApiResponse<Student>> {
    return apiClient.get<Student>(`${this.baseURL}/students/${id}`);
  }

  // Create new student
  async createStudent(request: CreateStudentRequest): Promise<ApiResponse<Student>> {
    return apiClient.post<Student>(`${this.baseURL}/students`, request);
  }

  // Update student
  async updateStudent(
    id: string,
    request: UpdateStudentRequest
  ): Promise<ApiResponse<Student>> {
    return apiClient.put<Student>(`${this.baseURL}/students/${id}`, request);
  }

  // Delete student
  async deleteStudent(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`${this.baseURL}/students/${id}`);
  }

  // Get student attendance
  async getAttendance(
    studentId: string,
    params?: { month?: number; year?: number }
  ): Promise<ApiResponse<Attendance[]>> {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    return apiClient.get<Attendance[]>(`${this.baseURL}/students/${studentId}/attendance${query}`);
  }

  // Get attendance statistics
  async getAttendanceStats(studentId: string): Promise<ApiResponse<AttendanceStats>> {
    return apiClient.get<AttendanceStats>(
      `${this.baseURL}/students/${studentId}/attendance/stats`
    );
  }

  // Mark attendance
  async markAttendance(
    studentId: string,
    attendance: Omit<Attendance, 'id'>
  ): Promise<ApiResponse<Attendance>> {
    return apiClient.post<Attendance>(
      `${this.baseURL}/students/${studentId}/attendance`,
      attendance
    );
  }

  // Upload student document
  async uploadDocument(
    studentId: string,
    file: File,
    documentType: string
  ): Promise<ApiResponse<Document>> {
    return apiClient.upload<Document>(
      `${this.baseURL}/students/${studentId}/documents`,
      file,
      'document',
      { type: documentType }
    );
  }

  // Export students to CSV
  async exportStudents(params?: StudentListParams): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();

    const response = await apiClient.get<any>(
      `${this.baseURL}/students/export?format=csv${query ? `&${query}` : ''}`,
      {
        responseType: 'blob',
      }
    );

    return response.data as unknown as Blob;
  }

  // Bulk import students
  async bulkImportStudents(file: File): Promise<ApiResponse<{ imported: number; errors: any[] }>> {
    return apiClient.upload<{ imported: number; errors: any[] }>(
      `${this.baseURL}/students/import`,
      file,
      'file'
    );
  }
}

// ============================================================================
// Default Student Service Instance
// ============================================================================

export const studentService = new StudentService();

export default studentService;
