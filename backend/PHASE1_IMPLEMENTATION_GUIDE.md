# EduCore Phase 1 Implementation Guide

## Overview
Phase 1 delivers the **Academic Core** microservices using Node.js, Express, MongoDB, and TypeScript. This includes:
- **Student Management** (enrolment, profiles, status tracking)
- **Timetabling** (class schedules with conflict detection)
- **Attendance** (marking, reporting, at-risk alerts)
- **Grades** (recording, aggregation, publishing)
- **Assessments & Exams** (scheduling, result recording)

All services enforce:
- **JWT authentication** via `authenticate` middleware
- **Role-based access control (RBAC)** via `authorize` middleware
- **Multi-tenancy isolation** with `school_id` on all data
- **Data validation** using Zod schemas
- **MongoDB** with proper indexing for performance

## Project Structure

```
backend/
├── services/
│   ├── api-gateway/        # Request routing & aggregation
│   ├── auth-service/       # JWT, authentication, RBAC
│   ├── tenant-service/     # School/tenant provisioning
│   ├── student-service/    # Student CRUD, enrolment
│   ├── academic-service/   # Timetable, attendance, grades, exams
│   ├── finance-service/    # Phase 2
│   └── notification-service/ # Phase 4
├── shared/                 # Shared types, schemas, event bus
├── package.json            # Root workspace config
└── .env.example            # Environment variables template
```

## Phase 1 Services

### `student-service` (Port 3001)
**Responsibility:** Student lifecycle management

**Endpoints:**
- `POST /api/v1/students` — Create student (SCHOOL_ADMIN, TEACHER)
- `GET /api/v1/students?class_id=...&status=...&limit=20&cursor=...` — List students with cursor pagination
- `GET /api/v1/students/:id` — Get student details
- `PUT /api/v1/students/:id` — Update student (SCHOOL_ADMIN)
- `DELETE /api/v1/students/:id` — Soft-delete student (SCHOOL_ADMIN)
- `POST /api/v1/students/import/bulk` — Import students from CSV/JSON (SCHOOL_ADMIN)

**Security:**
- All endpoints require `authenticate` + `tenantIsolation` middleware
- Role-based permission checks via `authorize` middleware
- Zod schema validation for request body/query
- Soft deletes maintain audit trail

**Data Model:**
- `Student` Mongoose schema with fields: school_id, name, email, DOB, class_id, status, guardians, etc.
- Indexes: `{school_id, status}`, `{school_id, class_id}`, `{admissionNumber, school_id}`

### `academic-service` (Port 3002)
**Responsibility:** Timetable, attendance, grades, assessments, exams

**Endpoints:**

**Classes:**
- `POST /api/v1/academic/classes` — Create class
- `GET /api/v1/academic/classes?academicYear=...` — List classes

**Attendance:**
- `POST /api/v1/academic/attendance` — Mark attendance (single/batch)
- `GET /api/v1/academic/attendance/student/:studentId` — Get student attendance history
- `GET /api/v1/academic/attendance/class/:classId?date=YYYY-MM-DD` — Get class attendance for a date

**Grades:**
- `POST /api/v1/academic/grades` — Record grade for assessment
- `GET /api/v1/academic/grades/student/:studentId?term=...` — Get student grades for term
- `POST /api/v1/academic/grades/publish` — Publish grades (ACADEMIC_HEAD, SCHOOL_ADMIN)

**Assessments:**
- `POST /api/v1/academic/assessments` — Create assessment
- `GET /api/v1/academic/assessments?classId=...&term=...` — List assessments

**Security:**
- Same authentication + authorization pattern as student-service
- Teachers can only mark attendance for their classes (pending API gateway validation)
- Grade publishing restricted to ACADEMIC_HEAD

**Data Models:**
- `Class`: school_id, name, section, academicYear, teacher_id, capacity
- `Attendance`: school_id, student_id, class_id, subject_id, date, period, status, note
- `Grade`: school_id, student_id, subject_id, assessment_id, score, term, status (draft/submitted/published)
- `Assessment`: school_id, subject_id, class_id, name, type, maxScore, date, term, weight
- `Exam`: school_id, name, subject_id, class_id, date, duration, maxScore, term, results[]

## Running Phase 1 Locally

### Prerequisites
```bash
# Install Node.js 18+ and npm 9+
# Install MongoDB 6+: https://docs.mongodb.com/manual/installation/
# Install Redis 7+: https://redis.io/download
```

### Setup & Start

```bash
# 1. Clone and navigate
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example)
cp .env.example .env

# 4. Start MongoDB and Redis (macOS with Homebrew)
brew services start mongodb-community
brew services start redis

# 5. Run Phase 1 services only
npm run dev:phase1

# Expected output:
# [api-gateway] running on port 3000
# [auth-service] running on port 3000
# [tenant-service] running on port 3001
# [student-service] running on port 3002
# [academic-service] running on port 3003
```

### Environment Variables (.env)
```env
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/educore
REDIS_URI=redis://localhost:6379
JWT_SECRET=dev-secret-key
```

## Testing Phase 1

### Using cURL / Postman

1. **Authenticate** (via auth-service):
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"..."}'
# Returns: { "token": "eyJhbGc..." }
```

2. **Create Student**:
```bash
TOKEN="eyJhbGc..."
curl -X POST http://localhost:3002/api/v1/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "dateOfBirth":"2010-05-15",
    "email":"john@example.com"
  }'
```

3. **Mark Attendance**:
```bash
curl -X POST http://localhost:3003/api/v1/academic/attendance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id":"<student_mongo_id>",
    "class_id":"<class_mongo_id>",
    "date":"2024-05-16",
    "period":1,
    "status":"present"
  }'
```

## Phase 1 Implementation Checklist

### Task 1: Database & Config ✅
- [x] MongoDB connection pooling
- [x] Redis connection (for queues, cache)
- [x] Environment config (config/index.ts)
- [x] TypeScript tsconfig per service

### Task 2: Security & Middleware ✅
- [x] JWT authentication middleware
- [x] RBAC authorization middleware
- [x] Tenant isolation middleware
- [x] Input validation (Zod)
- [x] CORS, Helmet, rate limiting (api-gateway)

### Task 3: Models & Schemas ✅
- [x] Student Mongoose model + indexes
- [x] Class model
- [x] Attendance model (prevent duplicates)
- [x] Grade model (with aggregation fields)
- [x] Assessment model
- [x] Exam model
- [x] Zod validation schemas

### Task 4: Services & Controllers ✅
- [x] StudentService (CRUD, bulk import)
- [x] AcademicService (classes, attendance, grades, assessments)
- [x] Student controllers
- [x] Academic controllers

### Task 5: Routes & Error Handling ✅
- [x] Student routes with middleware chain
- [x] Academic routes with middleware chain
- [x] Global error handler
- [x] 404 handler

### Task 6: API Gateway Integration (Pending)
- [ ] Register Phase 1 services in api-gateway
- [ ] Add rate limiting per endpoint
- [ ] Add request/response logging
- [ ] Implement cross-service authentication check

### Task 7: Tests (Pending)
- [ ] Jest setup per service
- [ ] Unit tests for services
- [ ] Integration tests (Supertest) for endpoints
- [ ] Mock MongoDB for unit tests
- [ ] Add tests to CI pipeline

### Task 8: Documentation (Pending)
- [ ] OpenAPI/Swagger spec generation
- [ ] API endpoint examples
- [ ] Data model ERD
- [ ] Deployment guide

### Task 9: Deployment (Pending)
- [ ] Dockerfiles per service
- [ ] Docker Compose for Phase 1
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline (GitHub Actions)

## Phase 1 Security Checklist

- [x] **Authentication:** JWT tokens signed with HS256
- [x] **Authorization:** Role-based access control (SCHOOL_ADMIN, TEACHER, ACADEMIC_HEAD)
- [x] **Multi-tenancy:** Row-level isolation via `school_id` on all documents
- [x] **Input Validation:** Zod schemas on all inputs
- [x] **Error Handling:** No stack traces in production
- [ ] **Rate Limiting:** Configured in api-gateway
- [ ] **Audit Logging:** Log create/update/delete to audit table
- [ ] **HTTPS:** Enforced in production
- [ ] **Database Encryption:** At rest (enable MongoDB encryption-at-rest)
- [ ] **Secrets Management:** Use AWS Secrets Manager / HashiCorp Vault in production

## Next Steps (After Phase 1 MVP)

1. **Register endpoints in API Gateway:** Proxy student & academic endpoints
2. **Add integration tests:** Supertest + Docker Compose for test DB
3. **Deploy to staging:** Kubernetes + CI/CD
4. **QA testing:** Acceptance criteria validation
5. **Phase 2:** Finance (fees, payments, payroll)

## Support & References

- **MongoDB Docs:** https://docs.mongodb.com
- **Mongoose Docs:** https://mongoosejs.com
- **Express Middleware:** https://expressjs.com/en/guide/using-middleware.html
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725
- **Zod Validation:** https://zod.dev

---
Generated: May 16, 2026  
Version: Phase 1 - MVP  
Status: Ready for development
