# Frontend Development Plan - Phase 2

## Overview

Complete frontend implementation for EduCore using Next.js 16, React 19, TypeScript, and Tailwind CSS.

**Start Date**: May 24, 2026
**Estimated Duration**: 3-4 weeks
**Status**: Infrastructure Complete ✅ → Ready for UI Development

---

## Implementation Timeline

### Week 1: Authentication & Core Layout

#### Day 1-2: Authentication Pages (8 hours)

**Login Page** (`app/login/page.tsx`)
- Email/password form with validation
- "Remember me" checkbox
- Password visibility toggle
- Error message display
- Link to registration and forgot password
- Redirect to dashboard on success

```typescript
Components needed:
- LoginForm component
- EmailInput component
- PasswordInput component
- SubmitButton component
- AuthLayout component
```

**Register Page** (`app/(auth)/register/page.tsx`)
- First name, last name, email fields
- Password & confirm password
- Phone number (optional)
- Terms & conditions checkbox
- Email verification flow
- Link to login page

```typescript
Components needed:
- RegisterForm component
- FormInput components
- PasswordStrength indicator
- TermsCheckbox component
```

**Forgot Password Page** (`app/(auth)/forgot-password/page.tsx`)
- Email input for password reset
- Email verification message
- Resend email link
- Back to login link

**Reset Password Page** (`app/(auth)/reset-password/page.tsx`)
- Token validation
- New password input
- Confirm password input
- Success/error messaging

**Deliverables**:
- ✅ 4 authentication pages
- ✅ Form validation with React Hook Form
- ✅ Error handling
- ✅ Integration with AuthService
- ✅ Styling with Tailwind CSS

---

#### Day 3-4: Dashboard Layout (8 hours)

**Main Layout** (`app/dashboard/layout.tsx`)
- Top navigation bar with logo, user menu, notifications
- Left sidebar with navigation menu
- Main content area
- Mobile responsive drawer menu
- Theme switcher (light/dark)

```typescript
Components needed:
- TopNav component (with user dropdown, notifications, theme toggle)
- Sidebar component (with navigation menu)
- MobileNav component (drawer for mobile)
- BreadcrumbNav component
- UserProfileMenu component
- NotificationBell component
```

**Dashboard Home** (`app/dashboard/page.tsx`)
- Welcome message
- KPI cards:
  - Total Students
  - Total Courses
  - Total Revenue
  - Attendance Rate
- Charts:
  - Student enrollment trend (line chart)
  - Attendance by class (bar chart)
  - Revenue by month (area chart)
- Recent activities section
- Quick action buttons

```typescript
Components needed:
- KPICard component
- LineChart component (using Chart.js or Recharts)
- BarChart component
- AreaChart component
- ActivityFeed component
- QuickActionCard component
```

**Deliverables**:
- ✅ Responsive dashboard layout
- ✅ Navigation system
- ✅ Dashboard homepage
- ✅ KPI cards and charts
- ✅ Mobile responsive design

---

### Week 2: Feature Pages - Part 1

#### Day 1-2: Student Management (8 hours)

**Student List Page** (`app/dashboard/students/page.tsx`)
- Data table with columns:
  - Roll number
  - Name
  - Email
  - Class/Section
  - Enrollment date
  - Status (Active/Inactive)
  - Actions (View, Edit, Delete)
- Search functionality
- Filter by class, status
- Pagination (10, 25, 50 per page)
- Bulk actions (Export, Delete, Change Status)
- "Create Student" button

```typescript
Components needed:
- StudentTable component
- StudentTableRow component
- SearchBar component
- FilterButton component
- PaginationControl component
- BulkActionToolbar component
- DataTableProvider component (for state management)
```

**Student Detail Page** (`app/dashboard/students/[id]/page.tsx`)
- Personal information
- Contact information
- Enrollment information
- Attendance record (table with filters)
- Grade history (table)
- Documents section
- Payment history
- Edit button (modal or separate page)

```typescript
Components needed:
- StudentProfile component
- StudentInfo section
- ContactInfo section
- AttendanceHistory component
- GradeHistory component
- DocumentsList component
- PaymentHistory component
- EditStudentModal component
```

**Create/Edit Student Page** (`app/dashboard/students/new`, `/app/dashboard/students/[id]/edit`)
- Form with fields:
  - First name, Last name
  - Email, Phone
  - Date of birth
  - Address
  - Class/Section
  - Parent information
  - Document upload
- Form validation
- Success/error messages
- Cancel and Submit buttons

```typescript
Components needed:
- StudentForm component
- FormField components
- FileUpload component
- AddressInput component
- ParentInfo section
```

**Deliverables**:
- ✅ Student list with search/filter/pagination
- ✅ Student detail view
- ✅ Create/edit student forms
- ✅ Integration with StudentService
- ✅ Responsive tables with mobile view

---

#### Day 3-4: Course/Academic Management (8 hours)

**Courses List Page** (`app/dashboard/courses/page.tsx`)
- Data table with columns:
  - Course code
  - Course name
  - Instructor
  - Credits
  - Semester
  - Status
  - Actions
- Search and filter
- "Create Course" button
- Bulk export

```typescript
Components needed:
- CourseTable component
- CourseCard component (for grid view)
- ViewToggle component (list/grid)
- CourseFilter component
```

**Course Detail Page** (`app/dashboard/courses/[id]/page.tsx`)
- Course information
- Enrolled students (table)
- Schedule
- Class list (classes for this course)
- Grades overview
- Edit button

```typescript
Components needed:
- CourseHeader component
- CourseInfo section
- StudentEnrollment component
- ClassSchedule component
- GradesOverview component
```

**Classes Management** (`app/dashboard/courses/[id]/classes`)
- List of classes for a course
- Class details (schedule, room, capacity, enrolled students)
- Grade entry interface for teachers

**Enrollments** (`app/dashboard/enrollments`)
- Enroll student in course/class
- Unenroll student
- View enrollment status
- Bulk enrollment from CSV

**Grade Management** (`app/dashboard/grades`)
- Grade entry table
- Add/edit grades
- Calculate GPA
- View student transcript
- Print transcript

```typescript
Components needed:
- GradeTable component
- GradeEntry component
- GradeInput component
- TranscriptView component
- GPACalculator component
```

**Deliverables**:
- ✅ Course management UI
- ✅ Class management interface
- ✅ Enrollment system
- ✅ Grade entry and tracking
- ✅ Student transcript view

---

### Week 3: Feature Pages - Part 2

#### Day 1-2: Finance Management (8 hours)

**Finance Dashboard** (`app/dashboard/finance/page.tsx`)
- Revenue statistics
  - Total revenue
  - Pending payments
  - Overdue payments
  - Collections this month
- Charts:
  - Monthly revenue trend
  - Payment method breakdown
  - Collection status
- Recent transactions
- Outstanding payments list

```typescript
Components needed:
- RevenueCard component
- StatisticCard component
- TransactionTable component
- PaymentMethodChart component
```

**Fee Structure Management** (`app/dashboard/finance/fee-structures`)
- List of fee structures
- Create/edit fee structure
- Add/remove fee components
- Applicable to classes/batches

```typescript
Components needed:
- FeeStructureTable component
- FeeStructureForm component
- FeeComponentInput component
```

**Student Fees** (`app/dashboard/finance/student-fees`)
- List students with their fee status
- Filter by status (pending, partial, paid, overdue)
- View fee details
- Record payment
- Generate invoice
- Send invoice email

```typescript
Components needed:
- StudentFeeTable component
- FeeDetailView component
- PaymentRecordForm component
- InvoicePreview component
```

**Payments** (`app/dashboard/finance/payments`)
- Payment records table
- Record new payment (multiple methods: cash, check, online)
- Payment receipt
- Refund payment
- Payment analytics

```typescript
Components needed:
- PaymentTable component
- PaymentForm component
- PaymentMethodSelect component
- ReceiptPrinter component
- RefundForm component
```

**Invoices** (`app/dashboard/finance/invoices`)
- Invoice list
- Generate invoice (manual or auto)
- Invoice template selection
- Send invoice (email, print, download)
- Track invoice status
- Invoice history

```typescript
Components needed:
- InvoiceList component
- InvoiceTemplate component
- InvoiceGenerator component
- InvoiceSender component
- InvoicePreview component
```

**Financial Reports** (`app/dashboard/finance/reports`)
- Revenue summary by month/period
- Payment method breakdown
- Collection efficiency report
- Outstanding amount report
- Student-wise payment status
- Export to PDF/Excel

```typescript
Components needed:
- ReportBuilder component
- ReportSelector component
- DateRangePicker component
- ExportButton component
- ReportDisplay component
```

**Deliverables**:
- ✅ Finance dashboard
- ✅ Fee structure management
- ✅ Student fee tracking
- ✅ Payment recording
- ✅ Invoice generation
- ✅ Financial reports

---

#### Day 3-4: Analytics & Reports (8 hours)

**Analytics Dashboard** (`app/dashboard/analytics/page.tsx`)
- Main metrics
  - Total students
  - Enrollment trend
  - Attendance rate
  - Academic performance
  - Revenue metrics
- Charts:
  - Student performance distribution
  - Attendance trends
  - Course popularity
  - Revenue forecast
- Comparison tools

```typescript
Components needed:
- MetricCard component
- PerformanceChart component
- AttendanceTrend component
- RevenueChart component
- ComparisonTool component
```

**Student Analytics** (`app/dashboard/analytics/students`)
- Student performance analytics
- Attendance analytics
- Grade trends
- Comparison with class average
- Learning curve analysis

**Academic Analytics** (`app/dashboard/analytics/academic`)
- Course performance
- Class-wise performance
- Subject-wise analysis
- Pass/fail rates
- Grade distribution

**Attendance Analytics** (`app/dashboard/analytics/attendance`)
- Attendance trends
- Class-wise attendance
- Student-wise attendance
- Absence patterns
- Attendance forecast

**Revenue Analytics** (`app/dashboard/analytics/revenue`)
- Revenue trends
- Collection efficiency
- Revenue by student batch
- Payment method analysis
- Forecasting

**Custom Reports** (`app/dashboard/analytics/custom-reports`)
- Report builder
- Custom chart creation
- Scheduled reports
- Report export
- Report sharing

```typescript
Components needed:
- ReportBuilder component
- ChartBuilder component
- MetricSelector component
- ReportScheduler component
- ShareReport component
```

**Deliverables**:
- ✅ Analytics dashboard
- ✅ Student analytics
- ✅ Academic analytics
- ✅ Attendance analytics
- ✅ Revenue analytics
- ✅ Custom report builder

---

### Week 4: Polish & Testing

#### Day 1-2: Settings & Admin Features (8 hours)

**User Settings** (`app/dashboard/settings/profile`)
- Update profile information
- Change password
- Two-factor authentication
- Session management
- Download data

**System Settings** (admin only)
- User management
- Role management
- Permission management
- Batch/class management
- Academic year configuration
- System preferences

```typescript
Components needed:
- SettingsLayout component
- ProfileSettings component
- PasswordChange component
- 2FASetup component
- UserManagement component
- RoleManager component
```

**Deliverables**:
- ✅ User settings pages
- ✅ Admin settings
- ✅ User management interface

---

#### Day 3-4: Testing & Deployment Prep (8 hours)

**Unit Tests**
- Service client tests
- Auth context tests
- Component tests (critical components)
- Utility function tests
- Target: 80% coverage

**Integration Tests**
- Auth flow (login → dashboard → logout)
- Student management flow
- Finance management flow
- API error handling

**E2E Tests** (Playwright or Cypress)
- Complete user journeys
- Cross-browser compatibility
- Mobile responsiveness
- Performance testing

**Performance Optimization**
- Bundle size analysis
- Image optimization
- Code splitting
- Lazy loading
- Caching strategy

**Deliverables**:
- ✅ Comprehensive test suite
- ✅ E2E test coverage
- ✅ Performance optimized
- ✅ Ready for production deployment

---

## Component Library

### UI Components (shadcn/ui + Custom)

```typescript
// Forms
- Input
- Label
- Button
- Textarea
- Select
- Checkbox
- Radio
- Toggle
- DatePicker
- TimePicker
- ColorPicker

// Tables & Lists
- DataTable
- Pagination
- SearchBar
- Filter
- Sort
- Toolbar

// Data Display
- Card
- Badge
- Avatar
- Progress
- Skeleton
- Empty State
- Error Boundary

// Feedback
- Toast/Notification
- Dialog/Modal
- Alert
- Popover
- Tooltip
- Loading Spinner
- Progress Indicator

// Navigation
- Sidebar
- TopNav
- Breadcrumb
- Tabs
- Menu
- Dropdown

// Layout
- Container
- Grid
- Stack
- Flex
- Section
```

---

## Technology Implementation Details

### Form Validation (React Hook Form + Zod)

```typescript
// Define schema
const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters'),
});

// Use in component
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(studentSchema),
});
```

### Data Fetching (React Query)

```typescript
// Queries
const { data, isLoading, error } = useQuery({
  queryKey: ['students', page],
  queryFn: () => studentService.getStudents({ page }),
});

// Mutations
const { mutate, isPending } = useMutation({
  mutationFn: (data) => studentService.createStudent(data),
  onSuccess: () => queryClient.invalidateQueries(['students']),
});
```

### Styling (Tailwind CSS)

```typescript
// Use utility classes
<div className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-50">
  <span className="text-sm font-medium text-gray-700">Total Students</span>
  <span className="text-2xl font-bold text-blue-600">1,234</span>
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

### State Management (Zustand)

```typescript
// Global state
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  filters: {},
  setFilters: (filters) => set({ filters }),
}));

// In component
const { user, filters, setFilters } = useStore();
```

---

## Development Guidelines

### Code Organization

```
Feature folder structure:
features/
├── students/
│   ├── components/
│   │   ├── StudentTable.tsx
│   │   ├── StudentForm.tsx
│   │   └── StudentDetail.tsx
│   ├── hooks/
│   │   ├── useStudents.ts
│   │   ├── useCreateStudent.ts
│   │   └── useUpdateStudent.ts
│   ├── types/
│   │   └── index.ts
│   └── services/
│       └── index.ts
```

### Naming Conventions

```typescript
// Components (PascalCase)
StudentTable.tsx
StudentForm.tsx

// Pages (lowercase)
students/page.tsx
students/[id]/page.tsx

// Utilities/Hooks (camelCase)
useStudents.ts
useAuth.ts

// Types (PascalCase)
Student.ts
StudentRequest.ts
```

### Import Organization

```typescript
// 1. External imports
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal imports
import { studentService } from '@/lib/services';
import { useAuth } from '@/lib/contexts/auth.context';

// 3. Component imports
import { StudentTable } from './StudentTable';
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] Tests passing (80%+ coverage)
- [ ] Lighthouse score > 90
- [ ] No console errors/warnings
- [ ] Mobile responsive tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Performance optimized (bundle < 500KB)
- [ ] Security audit passed
- [ ] Docker image built successfully
- [ ] Kubernetes manifests validated
- [ ] CI/CD pipeline integrated
- [ ] Staging deployment successful
- [ ] Production deployment plan ready

---

## Estimated Effort

| Phase | Component | Duration | Status |
|-------|-----------|----------|--------|
| Infrastructure | API Client, Services, Auth Context | 1 week | ✅ Complete |
| Week 1 | Auth Pages + Dashboard Layout | 1 week | 📋 Pending |
| Week 2 | Student + Course Management | 1 week | 📋 Pending |
| Week 3 | Finance + Analytics | 1 week | 📋 Pending |
| Week 4 | Settings + Testing + Polish | 1 week | 📋 Pending |
| **Total** | **Complete Frontend** | **~4 weeks** | 🚀 Ready to Start |

---

## Success Metrics

- ✅ All pages implemented and functional
- ✅ Full API integration working
- ✅ 80%+ test coverage
- ✅ Responsive on mobile/tablet/desktop
- ✅ Performance score > 90 (Lighthouse)
- ✅ Zero security vulnerabilities
- ✅ Zero TypeScript errors
- ✅ 100% uptime on staging
- ✅ Ready for production deployment

---

**Status**: Infrastructure Complete ✅ → Ready to Begin UI Development

