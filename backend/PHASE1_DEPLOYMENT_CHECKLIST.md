# Phase 1 Architecture & Deployment Checklist

## Phase 1 Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API Gateway (Express)                       │   │
│  │         Port 3000 (Public Entry Point)                   │   │
│  │  - Request routing & aggregation                         │   │
│  │  - Rate limiting & request logging                       │   │
│  │  - Response normalization                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↓        ↓         ↓        ↓          ↓               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Auth Service │  │Tenant Service│  │Student Service(PORT 3002)│
│  │  (Port 3000) │  │  (Port 3001) │  │              │           │
│  │              │  │              │  │  Models:     │           │
│  │ - JWT issuer │  │ - School mgmt│  │  - Student   │           │
│  │ - User auth  │  │ - RBAC setup │  │              │           │
│  │ - Refresh    │  │ - Config     │  │ Controllers: │           │
│  │   tokens     │  │              │  │  - Create    │           │
│  └──────────────┘  └──────────────┘  │  - List      │           │
│                                       │  - Update    │           │
│  ┌────────────────────────────────────┼──────────────┤           │
│  │         Academic Service           │  - Delete    │           │
│  │            (Port 3003)             │  - Import    │           │
│  │                                    │              │           │
│  │ Models:                            └──────────────┘           │
│  │ - Class, TimetableSlot                                        │
│  │ - Attendance, Grade                                           │
│  │ - Assessment, Exam                                            │
│  │                                                                │
│  │ Controllers:                                                  │
│  │ - Mark Attendance                                             │
│  │ - Record Grades                                               │
│  │ - Publish Grades                                              │
│  │ - List Assessments                                            │
│  └────────────────────────────────────────────────────────────────┘
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                        Shared Services                            │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │  MongoDB (Shared DB) │  │   Redis              │             │
│  │  - Collections:      │  │   - Session store    │             │
│  │    * Students        │  │   - Job queue        │             │
│  │    * Classes         │  │   - Cache layer      │             │
│  │    * Attendance      │  │   - PubSub for       │             │
│  │    * Grades          │  │     events           │             │
│  │    * Assessments     │  │                      │             │
│  │    * Exams           │  │                      │             │
│  │                      │  │                      │             │
│  │  Row-Level Security: │  │                      │             │
│  │  All docs have       │  │                      │             │
│  │  school_id field     │  │                      │             │
│  └──────────────────────┘  └──────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Mark Attendance

```
1. Teacher logs in (auth-service)
   ├─ POST /auth/login
   └─ Returns JWT with { userId, role: "TEACHER", school_id: "..." }

2. Teacher marks attendance (academic-service)
   ├─ POST /academic/attendance
   ├─ Header: Authorization: Bearer <JWT>
   ├─ Body: { student_id, class_id, date, period, status }
   │
   ├─ Middleware pipeline:
   │  ├─ authenticate: Verify JWT, extract user context
   │  ├─ tenantIsolation: Confirm school_id
   │  ├─ authorize(["TEACHER", "SCHOOL_ADMIN"]): Check role
   │  └─ validate(markAttendanceSchema): Validate request
   │
   ├─ Controller: markAttendance(req, res)
   │  └─ Call academicService.markAttendance(schoolId, data)
   │
   ├─ Service: academicService.markAttendance()
   │  └─ Create Attendance document with school_id = req.user.school_id
   │
   ├─ MongoDB: Insert document
   │  └─ { school_id: "school_123", student_id, class_id, status, date, ... }
   │
   └─ Response: 201 { success: true, data: <attendance> }

3. Query attendance (ensure tenant isolation)
   ├─ GET /academic/attendance/student/:studentId
   ├─ MongoDB query: { school_id: "school_123", student_id: "..." }
   └─ Only returns this tenant's data
```

## Deployment Checklist (Pre-Production)

### Infrastructure Setup
- [ ] **MongoDB**
  - [ ] Replica set configured (3 nodes minimum)
  - [ ] Encryption at rest enabled
  - [ ] Authentication enabled (username/password)
  - [ ] Database backups scheduled (daily + incremental)
  - [ ] Backup retention: 30 days
  - [ ] Test restore procedure

- [ ] **Redis**
  - [ ] Cluster mode enabled (3+ nodes)
  - [ ] Persistence enabled (RDB + AOF)
  - [ ] Password authentication configured
  - [ ] Memory limits set appropriately

- [ ] **Network**
  - [ ] Services in private subnet (no direct internet)
  - [ ] API Gateway in public subnet / behind load balancer
  - [ ] Security groups: Restrict inter-service communication to needed ports
  - [ ] TLS/HTTPS enforced on all endpoints

### Security Configuration
- [ ] **Secrets Management**
  - [ ] JWT_SECRET rotated and stored in AWS Secrets Manager / Vault
  - [ ] Database password stored securely
  - [ ] API keys for external services encrypted
  - [ ] No secrets in git history (pre-commit hook)

- [ ] **Encryption**
  - [ ] TLS 1.3 certificates issued (wildcard for all services)
  - [ ] HSTS header configured
  - [ ] Database encryption at rest enabled
  - [ ] Data in transit encrypted (all intra-service communication via TLS)

- [ ] **Authentication & Authorization**
  - [ ] JWT refresh token rotation working
  - [ ] Token expiry set to 1 hour (short-lived)
  - [ ] RBAC roles tested (SCHOOL_ADMIN, TEACHER, ACADEMIC_HEAD, SUPER_ADMIN)
  - [ ] Tenant isolation verified (cross-tenant data leaks tested and blocked)

- [ ] **Audit & Logging**
  - [ ] All create/update/delete operations logged
  - [ ] Sensitive data access (PII, grades) logged with actor
  - [ ] Failed auth attempts logged
  - [ ] Logs centralized in ELK / CloudWatch
  - [ ] Log retention: 2 years minimum

### Application Configuration
- [ ] **Environment Variables**
  - [ ] Production `.env` file created (never committed)
  - [ ] All required vars set: MONGO_URI, REDIS_URI, JWT_SECRET, etc.
  - [ ] Database connection string uses credentials from Secrets Manager

- [ ] **Database Migrations**
  - [ ] Mongoose indexes created on all collections
  - [ ] Unique indexes verified
  - [ ] Compound indexes tested for query performance
  - [ ] Rollback procedure tested

- [ ] **Service Configuration**
  - [ ] All services configured with NODE_ENV=production
  - [ ] Error logging without stack traces enabled
  - [ ] Request logging configured (Morgan)
  - [ ] Rate limiting configured per endpoint

### Containerization & Deployment
- [ ] **Docker**
  - [ ] Dockerfile per service (multi-stage build)
  - [ ] Docker images built and pushed to registry
  - [ ] Image scan for vulnerabilities passed
  - [ ] .dockerignore configured (exclude node_modules)

- [ ] **Kubernetes**
  - [ ] Manifests created (Deployment, Service, ConfigMap, Secret)
  - [ ] Resource limits set (CPU, memory)
  - [ ] Liveness & readiness probes configured
  - [ ] Autoscaling policies configured (HPA)
  - [ ] Pod disruption budgets set

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions workflow configured
  - [ ] Tests run on every PR (unit + integration)
  - [ ] Linting (ESLint) passed
  - [ ] Type checking (TypeScript) passed
  - [ ] Build artifacts generated
  - [ ] Artifact pushed to Docker registry
  - [ ] Kubernetes deployment automated

### Monitoring & Observability
- [ ] **Application Monitoring**
  - [ ] APM (Datadog / Sentry) configured
  - [ ] Error tracking & alerting enabled
  - [ ] Transaction tracing for slow endpoints
  - [ ] Custom metrics defined

- [ ] **Infrastructure Monitoring**
  - [ ] CPU, memory, disk usage monitored
  - [ ] Database performance metrics tracked
  - [ ] Redis memory usage alerts set
  - [ ] Network latency monitored

- [ ] **Health Checks**
  - [ ] `/health` endpoints return 200 OK
  - [ ] Database connectivity checked in health endpoint
  - [ ] Redis connectivity checked
  - [ ] Dependencies health verified

### Testing & Validation
- [ ] **Unit Tests**
  - [ ] Service layer tests passing (80%+ coverage)
  - [ ] Model validation tests passing
  - [ ] Middleware tests passing

- [ ] **Integration Tests**
  - [ ] Full endpoint tests (Supertest)
  - [ ] Authentication flow tested (login → token → access resource)
  - [ ] Tenant isolation tested (school A cannot access school B data)
  - [ ] Error handling tested (400, 401, 403, 500 responses)

- [ ] **Load Testing**
  - [ ] 1,000 concurrent users: < 300ms P95
  - [ ] Sustained load test 1 hour: no memory leaks
  - [ ] Database connection pool: no exhaustion
  - [ ] Redis connection pool: no exhaustion

- [ ] **Security Testing**
  - [ ] SQL injection attempts blocked (Zod validation)
  - [ ] Cross-site scripting (XSS) tests passed
  - [ ] Cross-site request forgery (CSRF) protected
  - [ ] Authentication bypass attempts blocked
  - [ ] Authorization bypass attempts blocked

### Deployment Steps (Rolling Update)
```bash
# 1. Pre-deployment checks
kubectl get nodes  # Confirm cluster healthy
kubectl get pods   # Confirm current pods running

# 2. Build & push new image
docker build -t educore/academic-service:v1.1.0 .
docker push educore/academic-service:v1.1.0

# 3. Update Kubernetes deployment (rolling update)
kubectl set image deployment/academic-service \
  academic-service=educore/academic-service:v1.1.0

# 4. Monitor rollout
kubectl rollout status deployment/academic-service
kubectl logs -f deployment/academic-service

# 5. Run smoke tests
curl http://academic-service/health
# Expected: { "status": "ok", "service": "academic-service" }

# 6. Verify data integrity
# - Query MongoDB: confirm all data accessible
# - Check audit logs: no errors during deployment

# 7. Rollback if needed
kubectl rollout undo deployment/academic-service
```

### Post-Deployment Verification
- [ ] All services healthy (`/health` returns 200)
- [ ] Database connected & accessible
- [ ] Redis connected & accessible
- [ ] API endpoints responding within SLA (< 300ms P95)
- [ ] Logs being collected centrally
- [ ] Monitoring & alerting active
- [ ] Backup verified (can restore if needed)

### Incident Response Plan
- [ ] **On-call rotation** established
- [ ] **Runbook** for common failures (DB down, Redis down, etc.)
- [ ] **Rollback procedure** tested and documented
- [ ] **Communication plan** for incidents (slack, email, status page)
- [ ] **Post-incident review** process defined

---

**Deployment Approval:** [Tech Lead Name]  
**Go-Live Date:** [Date]  
**Rollback Plan:** [Plan]
