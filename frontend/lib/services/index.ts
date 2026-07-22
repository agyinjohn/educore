/**
 * Services Index
 * Barrel export for all service clients and types
 */

import { authService, type User, type LoginRequest, type LoginResponse, type RegisterRequest } from './auth.service';

import { studentService, type Student, type CreateStudentRequest, type StudentListParams } from './student.service';

import {
  academicService,
  type Course,
  type Class,
  type Grade,
  type Enrollment,
  type CreateCourseRequest,
  type CreateClassRequest,
} from './academic.service';

import {
  financeService,
  type FeeStructure,
  type StudentFee,
  type Payment,
  type Invoice,
  type FinancialReport,
} from './finance.service';

import { analyticsService, type DashboardMetrics, type StudentAnalytics } from './analytics.service';
import { tenantService, type School, type CreateSchoolRequest } from './tenant.service';

// Re-export all types
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Student,
  CreateStudentRequest,
  StudentListParams,
  Course,
  Class,
  Grade,
  Enrollment,
  CreateCourseRequest,
  CreateClassRequest,
  FeeStructure,
  StudentFee,
  Payment,
  Invoice,
  FinancialReport,
  DashboardMetrics,
  StudentAnalytics,
  School,
  CreateSchoolRequest,
};

/**
 * Services Interface
 * Provides type-safe access to all service instances
 */
export interface Services {
  auth: typeof authService;
  student: typeof studentService;
  academic: typeof academicService;
  finance: typeof financeService;
  analytics: typeof analyticsService;
}

/**
 * Combined services instance
 */
export const services: Services = {
  auth: authService,
  student: studentService,
  academic: academicService,
  finance: financeService,
  analytics: analyticsService,
};

// Re-export service instances for convenient access
export { authService, studentService, academicService, financeService, analyticsService, tenantService };
