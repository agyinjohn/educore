// Analytics Service API Client
// Handles analytics data, reports, and dashboard metrics

import { apiClient, ApiResponse } from '../api-client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface DashboardMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalRevenue: number;
  studentGrowth: number;
  revenueGrowth: number;
  attendanceRate: number;
  passRate: number;
}

export interface StudentAnalytics {
  studentId: string;
  totalEnrollments: number;
  averageGPA: number;
  attendancePercentage: number;
  performanceTrend: PerformancePoint[];
  enrollmentHistory: EnrollmentRecord[];
}

export interface PerformancePoint {
  date: string;
  value: number;
}

export interface EnrollmentRecord {
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  completionDate?: string;
  grade: string;
}

export interface ClassAnalytics {
  classId: string;
  className: string;
  totalStudents: number;
  averageAttendance: number;
  averageGPA: number;
  topPerformers: StudentPerformance[];
  needsImprovement: StudentPerformance[];
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  gpa: number;
  attendance: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface RevenueAnalytics {
  totalRevenue: number;
  collectedAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  collectionRate: number;
  monthlyRevenue: MonthlyData[];
  paymentMethods: Record<string, number>;
}

export interface MonthlyData {
  month: string;
  amount: number;
}

export interface AttendanceAnalytics {
  averageAttendance: number;
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceTrend: PerformancePoint[];
  classAttendance: ClassAttendanceRecord[];
}

export interface ClassAttendanceRecord {
  classId: string;
  className: string;
  attendance: number;
  presentStudents: number;
  totalStudents: number;
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageGrade: number;
  studentProgress: StudentProgress[];
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  progress: number;
  lastActivityDate: string;
}

export interface AcademicTrend {
  period: string;
  averageGPA: number;
  passRate: number;
  studentCount: number;
}

// ============================================================================
// Analytics Service Class
// ============================================================================

export class AnalyticsService {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL =
      baseURL || process.env.NEXT_PUBLIC_ANALYTICS_API_URL || 'http://localhost:4008';
  }

  // ==================== Dashboard ====================

  // Get dashboard metrics
  async getDashboardMetrics(
    params?: { startDate?: string; endDate?: string }
  ): Promise<ApiResponse<DashboardMetrics>> {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    return apiClient.get<DashboardMetrics>(`${this.baseURL}/analytics/dashboard${query}`);
  }

  // ==================== Student Analytics ====================

  // Get student analytics
  async getStudentAnalytics(studentId: string): Promise<ApiResponse<StudentAnalytics>> {
    return apiClient.get<StudentAnalytics>(`${this.baseURL}/analytics/students/${studentId}`);
  }

  // Get student performance comparison
  async getStudentComparison(studentIds: string[]): Promise<
    ApiResponse<StudentPerformance[]>
  > {
    return apiClient.post<StudentPerformance[]>(`${this.baseURL}/analytics/students/compare`, {
      studentIds,
    });
  }

  // ==================== Class Analytics ====================

  // Get class analytics
  async getClassAnalytics(classId: string): Promise<ApiResponse<ClassAnalytics>> {
    return apiClient.get<ClassAnalytics>(`${this.baseURL}/analytics/classes/${classId}`);
  }

  // ==================== Revenue Analytics ====================

  // Get revenue analytics
  async getRevenueAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<RevenueAnalytics>> {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    return apiClient.get<RevenueAnalytics>(`${this.baseURL}/analytics/revenue${query}`);
  }

  // ==================== Attendance Analytics ====================

  // Get attendance analytics
  async getAttendanceAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<AttendanceAnalytics>> {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    return apiClient.get<AttendanceAnalytics>(`${this.baseURL}/analytics/attendance${query}`);
  }

  // ==================== Course Analytics ====================

  // Get course analytics
  async getCourseAnalytics(courseId: string): Promise<ApiResponse<CourseAnalytics>> {
    return apiClient.get<CourseAnalytics>(`${this.baseURL}/analytics/courses/${courseId}`);
  }

  // Get all course analytics
  async getAllCourseAnalytics(): Promise<ApiResponse<CourseAnalytics[]>> {
    return apiClient.get<CourseAnalytics[]>(`${this.baseURL}/analytics/courses`);
  }

  // ==================== Trends ====================

  // Get academic trends
  async getAcademicTrends(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<AcademicTrend[]>> {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    return apiClient.get<AcademicTrend[]>(`${this.baseURL}/analytics/trends/academic${query}`);
  }

  // ==================== Exports ====================

  // Export analytics data
  async exportAnalytics(
    type: 'dashboard' | 'students' | 'revenue' | 'attendance',
    format: 'csv' | 'excel' | 'pdf',
    params?: Record<string, any>
  ): Promise<Blob> {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    const response = await apiClient.get<any>(
      `${this.baseURL}/analytics/export?type=${type}&format=${format}${query ? `&${query}` : ''}`,
      {
        responseType: 'blob',
      }
    );
    return response.data as unknown as Blob;
  }
}

// ============================================================================
// Default Analytics Service Instance
// ============================================================================

export const analyticsService = new AnalyticsService();

export default analyticsService;
