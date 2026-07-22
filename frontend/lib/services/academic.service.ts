// Academic Service API Client
// Handles courses, classes, grades, and academic management

import { apiClient, ApiResponse } from '../api-client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  semester: string;
  instructor: string;
  instructorId: string;
  duration: number;
  enrollmentLimit: number;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  classCode: string;
  level: string;
  section?: string;
  academicYear: string;
  courseId: string;
  teacherId: string;
  capacity: number;
  currentEnrollment: number;
  schedule?: Schedule[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  classId: string;
  marks: number;
  outOfMarks: number;
  percentage: number;
  grade: string;
  gradingScale: string;
  remarks?: string;
  issuedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  courseId: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'dropped' | 'completed';
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  name: string;
  code: string;
  description?: string;
  credits: number;
  semester: string;
  instructorId: string;
  duration: number;
  enrollmentLimit: number;
}

export interface CreateClassRequest {
  name: string;
  classCode: string;
  level: string;
  section?: string;
  academicYear: string;
  courseId: string;
  teacherId: string;
  capacity: number;
  schedule?: Schedule[];
}

export interface EnrollStudentRequest {
  studentId: string;
  classId: string;
  courseId: string;
}

export interface GradeRequest {
  studentId: string;
  courseId: string;
  marks: number;
  outOfMarks?: number;
  remarks?: string;
}

// ============================================================================
// Academic Service Class
// ============================================================================

export class AcademicService {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL =
      baseURL || process.env.NEXT_PUBLIC_ACADEMIC_API_URL || 'http://localhost:4002';
  }

  // ==================== Courses ====================

  // Get all courses
  async getCourses(params?: { page?: number; limit?: number; search?: string }): Promise<
    ApiResponse<{
      courses: Course[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    return apiClient.get<any>(`${this.baseURL}/courses${query}`);
  }

  // Get course by ID
  async getCourse(id: string): Promise<ApiResponse<Course>> {
    return apiClient.get<Course>(`${this.baseURL}/courses/${id}`);
  }

  // Create course
  async createCourse(request: CreateCourseRequest): Promise<ApiResponse<Course>> {
    return apiClient.post<Course>(`${this.baseURL}/courses`, request);
  }

  // Update course
  async updateCourse(id: string, request: Partial<CreateCourseRequest>): Promise<ApiResponse<Course>> {
    return apiClient.put<Course>(`${this.baseURL}/courses/${id}`, request);
  }

  // Delete course
  async deleteCourse(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`${this.baseURL}/courses/${id}`);
  }

  // ==================== Classes ====================

  // Get all classes
  async getClasses(params?: { page?: number; limit?: number; search?: string }): Promise<
    ApiResponse<{
      classes: Class[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    return apiClient.get<any>(`${this.baseURL}/classes${query}`);
  }

  // Get class by ID
  async getClass(id: string): Promise<ApiResponse<Class>> {
    return apiClient.get<Class>(`${this.baseURL}/classes/${id}`);
  }

  // Create class
  async createClass(request: CreateClassRequest): Promise<ApiResponse<Class>> {
    return apiClient.post<Class>(`${this.baseURL}/classes`, request);
  }

  // Update class
  async updateClass(id: string, request: Partial<CreateClassRequest>): Promise<ApiResponse<Class>> {
    return apiClient.put<Class>(`${this.baseURL}/classes/${id}`, request);
  }

  // Delete class
  async deleteClass(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`${this.baseURL}/classes/${id}`);
  }

  // ==================== Enrollments ====================

  // Get student enrollments
  async getStudentEnrollments(studentId: string): Promise<ApiResponse<Enrollment[]>> {
    return apiClient.get<Enrollment[]>(`${this.baseURL}/students/${studentId}/enrollments`);
  }

  // Get class enrollments
  async getClassEnrollments(classId: string): Promise<
    ApiResponse<{
      enrollments: Enrollment[];
      total: number;
    }>
  > {
    return apiClient.get<any>(`${this.baseURL}/classes/${classId}/enrollments`);
  }

  // Enroll student in class
  async enrollStudent(request: EnrollStudentRequest): Promise<ApiResponse<Enrollment>> {
    return apiClient.post<Enrollment>(`${this.baseURL}/enrollments`, request);
  }

  // Unenroll student from class
  async unenrollStudent(enrollmentId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`${this.baseURL}/enrollments/${enrollmentId}`);
  }

  // ==================== Grades ====================

  // Get student grades
  async getStudentGrades(studentId: string): Promise<ApiResponse<Grade[]>> {
    return apiClient.get<Grade[]>(`${this.baseURL}/students/${studentId}/grades`);
  }

  // Get class grades
  async getClassGrades(classId: string): Promise<
    ApiResponse<{
      grades: Grade[];
      classAverage: number;
    }>
  > {
    return apiClient.get<any>(`${this.baseURL}/classes/${classId}/grades`);
  }

  // Add grade
  async addGrade(request: GradeRequest): Promise<ApiResponse<Grade>> {
    return apiClient.post<Grade>(`${this.baseURL}/grades`, request);
  }

  // Update grade
  async updateGrade(id: string, request: Partial<GradeRequest>): Promise<ApiResponse<Grade>> {
    return apiClient.put<Grade>(`${this.baseURL}/grades/${id}`, request);
  }

  // Get student transcript
  async getTranscript(studentId: string): Promise<ApiResponse<{
    studentName: string;
    enrollmentNumber: string;
    courses: (Course & { grade: Grade })[];
    gpa: number;
    totalCredits: number;
  }>> {
    return apiClient.get<any>(`${this.baseURL}/students/${studentId}/transcript`);
  }
}

// ============================================================================
// Default Academic Service Instance
// ============================================================================

export const academicService = new AcademicService();

export default academicService;
