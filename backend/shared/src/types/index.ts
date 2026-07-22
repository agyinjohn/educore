// ─── Roles ───────────────────────────────────────────────────────────────────
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_OWNER = 'SCHOOL_OWNER',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  ACADEMIC_HEAD = 'ACADEMIC_HEAD',
  TEACHER = 'TEACHER',
  ACCOUNTANT = 'ACCOUNTANT',
  HR_MANAGER = 'HR_MANAGER',
  LIBRARIAN = 'LIBRARIAN',
  TRANSPORT_COORDINATOR = 'TRANSPORT_COORDINATOR',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  WARDEN = 'WARDEN',
}

// ─── Permissions ─────────────────────────────────────────────────────────────
export enum Action {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  APPROVE = 'approve',
}

export enum Resource {
  STUDENT = 'student',
  STAFF = 'staff',
  CLASS = 'class',
  TIMETABLE = 'timetable',
  ATTENDANCE = 'attendance',
  GRADE = 'grade',
  EXAM = 'exam',
  FEE = 'fee',
  PAYROLL = 'payroll',
  LEAVE = 'leave',
  LIBRARY = 'library',
  TRANSPORT = 'transport',
  HOSTEL = 'hostel',
  INVENTORY = 'inventory',
  REPORT = 'report',
  TENANT = 'tenant',
  USER = 'user',
}

// ─── JWT Payload ──────────────────────────────────────────────────────────────
export interface JwtPayload {
  sub: string        // user id
  schoolId: string   // tenant id (null for SUPER_ADMIN)
  role: Role
  email: string
  iat?: number
  exp?: number
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    limit: number
    nextCursor?: string
  }
}

// ─── Service Events (inter-service messaging) ─────────────────────────────────
export enum ServiceEvent {
  USER_CREATED = 'user.created',
  USER_DELETED = 'user.deleted',
  TENANT_CREATED = 'tenant.created',
  TENANT_SUSPENDED = 'tenant.suspended',
  STUDENT_ENROLLED = 'student.enrolled',
  ATTENDANCE_MARKED = 'attendance.marked',
  GRADE_PUBLISHED = 'grade.published',
  PAYMENT_RECEIVED = 'payment.received',
}
