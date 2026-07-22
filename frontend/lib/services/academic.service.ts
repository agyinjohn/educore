// Academic Service API Client
// Handles classes, attendance, grades, assessments, and timetable.
// Matches backend/services/academic-service routes exactly (mounted at /academic
// behind the API gateway, which forwards to the service's /api/v1/academic).

import { apiClient, ApiResponse } from '../api-client';

// ============================================================================
// Types & Interfaces (mirror backend Mongoose models)
// ============================================================================

export interface Class {
  id: string;
  school_id: string;
  name: string;
  section?: string;
  academicYear: string;
  teacher_id?: string;
  capacity?: number;
  gradeLevel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassRequest {
  name: string;
  section?: string;
  academicYear: string;
  teacher_id?: string;
  capacity?: number;
  gradeLevel?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  subject_id?: string;
  date: string;
  period: number;
  status: AttendanceStatus;
  note?: string;
}

export interface MarkAttendanceRequest {
  student_id: string;
  class_id: string;
  subject_id?: string;
  date: string;
  period: number;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}

export type GradeStatus = 'draft' | 'submitted' | 'published';

export interface Grade {
  id: string;
  school_id: string;
  student_id: string;
  subject_id: string;
  assessment_id?: string;
  score: number;
  maxScore?: number;
  percentage?: number;
  grade?: string;
  term: string;
  academicYear: string;
  status: GradeStatus;
  feedback?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordGradeRequest {
  student_id: string;
  subject_id: string;
  assessment_id?: string;
  score: number;
  maxScore?: number;
  term: string;
  academicYear: string;
  feedback?: string;
}

export interface Assessment {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  name: string;
  type: AssessmentType;
  maxScore: number;
  weight?: number;
  description?: string;
  date: string;
  term: string;
  academicYear: string;
  dueDate?: string;
}

export type AssessmentType = 'quiz' | 'test' | 'exam' | 'project' | 'assignment' | 'classwork';

export interface CreateAssessmentRequest {
  class_id: string;
  subject_id: string;
  name: string;
  type: AssessmentType;
  maxScore: number;
  weight?: number;
  description?: string;
  date: string;
  term: string;
  academicYear: string;
  dueDate?: string;
}

export interface TimetableSlot {
  id: string;
  class_id: string;
  teacher_id: string;
  subject: string;
  dayOfWeek: string;
  period: number;
  startTime: string;
  endTime: string;
  academicYear: string;
  term: string;
}

export interface CreateTimetableSlotRequest {
  class_id: string;
  teacher_id: string;
  subject: string;
  dayOfWeek: string;
  period: number;
  startTime: string;
  endTime: string;
  academicYear: string;
  term: string;
}

export interface AtRiskStudent {
  student_id: string;
  attendancePercentage: number;
  averageGrade: number;
  reasons: string[];
}

// ============================================================================
// Academic Service Class
// ============================================================================

export class AcademicService {
  // ==================== Classes ====================

  async getClasses(academicYear: string): Promise<ApiResponse<Class[]>> {
    return apiClient.get<Class[]>(`/academic/classes?academicYear=${encodeURIComponent(academicYear)}`);
  }

  async createClass(request: CreateClassRequest): Promise<ApiResponse<Class>> {
    return apiClient.post<Class>('/academic/classes', request);
  }

  async updateClass(id: string, request: { name?: string; teacher_id?: string; capacity?: number }): Promise<ApiResponse<Class>> {
    return apiClient.put<Class>(`/academic/classes/${id}`, request);
  }

  async deleteClass(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/academic/classes/${id}`);
  }

  // ==================== Attendance ====================

  async markAttendance(request: MarkAttendanceRequest): Promise<ApiResponse<Attendance>> {
    return apiClient.post<Attendance>('/academic/attendance', request);
  }

  async markBulkAttendance(records: MarkAttendanceRequest[]): Promise<ApiResponse<Attendance[]>> {
    return apiClient.post<Attendance[]>('/academic/attendance/bulk', { records });
  }

  async getStudentAttendance(studentId: string): Promise<ApiResponse<Attendance[]>> {
    return apiClient.get<Attendance[]>(`/academic/attendance/student/${studentId}`);
  }

  async getClassAttendance(classId: string, date?: string): Promise<ApiResponse<Attendance[]>> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiClient.get<Attendance[]>(`/academic/attendance/class/${classId}${query}`);
  }

  async getAttendanceStats(studentId: string, term?: string): Promise<ApiResponse<AttendanceStats>> {
    const query = term ? `?term=${encodeURIComponent(term)}` : '';
    return apiClient.get<AttendanceStats>(`/academic/attendance/stats/student/${studentId}${query}`);
  }

  async getClassAttendanceStats(classId: string, date?: string): Promise<ApiResponse<any>> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiClient.get<any>(`/academic/attendance/stats/class/${classId}${query}`);
  }

  // ==================== Grades ====================

  async recordGrade(request: RecordGradeRequest): Promise<ApiResponse<Grade>> {
    return apiClient.post<Grade>('/academic/grades', request);
  }

  async getStudentGrades(studentId: string, term: string): Promise<ApiResponse<Grade[]>> {
    return apiClient.get<Grade[]>(`/academic/grades/student/${studentId}?term=${encodeURIComponent(term)}`);
  }

  // Submit draft grades for approval (draft -> submitted)
  async submitGrades(term: string, academicYear: string): Promise<ApiResponse<{ modifiedCount: number }>> {
    return apiClient.post('/academic/grades/submit', { term, academicYear });
  }

  // Publish submitted grades so students/parents can see them (submitted -> published)
  async publishGrades(term: string, academicYear: string): Promise<ApiResponse<{ modifiedCount: number }>> {
    return apiClient.post('/academic/grades/publish', { term, academicYear });
  }

  async getTermAverageGrades(classId: string, term: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/academic/grades/term-averages/${classId}?term=${encodeURIComponent(term)}`);
  }

  async getStudentRankInClass(studentId: string, term: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/academic/grades/student-rank/${studentId}?term=${encodeURIComponent(term)}`);
  }

  async getGradeDistribution(classId: string, term: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/academic/grades/distribution/${classId}?term=${encodeURIComponent(term)}`);
  }

  // ==================== Assessments ====================

  async createAssessment(request: CreateAssessmentRequest): Promise<ApiResponse<Assessment>> {
    return apiClient.post<Assessment>('/academic/assessments', request);
  }

  async listAssessments(classId: string, term: string): Promise<ApiResponse<Assessment[]>> {
    return apiClient.get<Assessment[]>(
      `/academic/assessments?classId=${encodeURIComponent(classId)}&term=${encodeURIComponent(term)}`
    );
  }

  // ==================== Timetable ====================

  async createTimetableSlot(request: CreateTimetableSlotRequest): Promise<ApiResponse<TimetableSlot>> {
    return apiClient.post<TimetableSlot>('/academic/timetable', request);
  }

  async getTimetableForClass(
    classId: string,
    academicYear: string,
    term: string
  ): Promise<ApiResponse<TimetableSlot[]>> {
    return apiClient.get<TimetableSlot[]>(
      `/academic/timetable/class/${classId}?academicYear=${encodeURIComponent(academicYear)}&term=${encodeURIComponent(term)}`
    );
  }

  // ==================== At-Risk Students ====================

  async getAtRiskStudents(
    classId: string,
    attendanceThreshold = 80,
    gradeThreshold = 65
  ): Promise<ApiResponse<AtRiskStudent[]>> {
    return apiClient.get<AtRiskStudent[]>(
      `/academic/at-risk/${classId}?attendanceThreshold=${attendanceThreshold}&gradeThreshold=${gradeThreshold}`
    );
  }
}

// ============================================================================
// Default Academic Service Instance
// ============================================================================

export const academicService = new AcademicService();

export default academicService;
