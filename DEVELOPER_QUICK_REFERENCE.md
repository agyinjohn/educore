# EduCore Developer Quick Reference

**Last Updated**: May 24, 2026

---

## Quick Start

### 1. Clone & Setup

```bash
# Clone repository
git clone <repo-url>
cd EduCore

# Setup backend
cd backend
npm install

# Setup frontend
cd frontend
npm install

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### 2. Run Development

```bash
# Terminal 1: Backend services (Docker)
cd backend
docker-compose up

# Terminal 2: Frontend (in another terminal)
cd frontend
npm run dev

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3000/api
```

### 3. Common Commands

```bash
# Backend
npm test              # Run tests
npm run build         # Build TypeScript
npm run lint          # Run ESLint
docker-compose up -d  # Start services in background
docker-compose down   # Stop services

# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm test             # Run tests
```

---

## Project Structure

```
EduCore/
├── backend/
│   ├── services/          # 10 microservices
│   │   ├── auth-service/
│   │   ├── student-service/
│   │   ├── academic-service/
│   │   └── ... (7 more services)
│   ├── shared/            # Shared utilities, types, schemas
│   ├── docker-compose.yml # Container orchestration
│   ├── k8s/              # Kubernetes manifests
│   └── .github/workflows/ # CI/CD pipelines
│
├── frontend/
│   ├── app/              # Next.js pages and layouts
│   ├── components/       # React components
│   ├── lib/
│   │   ├── api-client.ts    # HTTP client
│   │   ├── services/        # API service classes
│   │   ├── contexts/        # React contexts
│   │   └── utils/           # Utilities
│   ├── hooks/            # Custom React hooks
│   └── public/           # Static assets
│
└── docker-compose.yml    # Root orchestration
```

---

## Backend Services

### Service Ports & Endpoints

| Service | Port | Health Check | Key Endpoints |
|---------|------|--------------|---------------|
| Auth | 4000 | `/health` | `/login`, `/register`, `/refresh` |
| Student | 4001 | `/health` | `/students`, `/attendance` |
| Academic | 4002 | `/health` | `/courses`, `/classes`, `/grades` |
| Finance | 4003 | `/health` | `/fees`, `/payments`, `/invoices` |
| Notification | 4004 | `/health` | `/send-email`, `/send-sms` |
| Tenant | 4005 | `/health` | `/tenants`, `/config` |
| Report | 4006 | `/health` | `/reports`, `/generate` |
| AI | 4007 | `/health` | `/recommendations`, `/forecast` |
| Analytics | 4008 | `/health` | `/metrics`, `/trends` |
| Chatbot | 4009 | `/health` | `/chat`, `/query` |

### Testing Backend

```bash
# Run all tests
npm test

# Run specific service tests
npm test -- auth-service

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Adding a New Endpoint

```typescript
// In service/src/routes.ts
router.post('/new-endpoint', async (req, res) => {
  try {
    // Implementation
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Frontend Architecture

### API Usage

```typescript
import { studentService, academicService, financeService } from '@/lib/services';

// Fetch data
const students = await studentService.getStudents({ page: 1, limit: 10 });
const courses = await academicService.getCourses();
const fees = await financeService.getStudentFees(studentId);

// With React Query
import { useQuery } from '@tanstack/react-query';

const { data: students, isLoading } = useQuery({
  queryKey: ['students'],
  queryFn: () => studentService.getStudents(),
});
```

### Authentication

```typescript
import { useAuth } from '@/lib/contexts/auth.context';

export default function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return <Dashboard user={user} />;
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@/lib/components/protected-route';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

### Forms with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### State Management (Zustand)

```typescript
import { create } from 'zustand';

const useStore = create((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));

// Use in component
const { theme, setTheme } = useStore();
```

---

## Common Tasks

### Add a New API Endpoint

**Backend**:
1. Add route in service routes file
2. Add controller logic
3. Add tests
4. Update API documentation

**Frontend**:
1. Add method to service client
2. Add types/interfaces
3. Add API documentation
4. Create hook for React Query usage

### Create a New Page

```typescript
// app/dashboard/new-feature/page.tsx
'use client';

import { ProtectedRoute } from '@/lib/components/protected-route';
import NewFeatureContent from './content';

export default function NewFeaturePage() {
  return (
    <ProtectedRoute>
      <NewFeatureContent />
    </ProtectedRoute>
  );
}
```

### Add a New Component

```typescript
// components/MyComponent.tsx
'use client';

import { ReactNode } from 'react';

interface MyComponentProps {
  title: string;
  children: ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div className="p-4">
      <h1>{title}</h1>
      {children}
    </div>
  );
}
```

### Handle Errors

```typescript
try {
  await studentService.getStudents();
} catch (error: any) {
  if (error.status === 401) {
    // Handle unauthorized
    logout();
  } else if (error.status === 404) {
    // Handle not found
    showError('Student not found');
  } else {
    // Handle other errors
    showError(error.message);
  }
}
```

---

## Testing

### Backend Tests

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Specific file
npm test -- auth.service.test.ts
```

### Frontend Tests

```bash
# Unit tests
npm test

# E2E tests (Cypress/Playwright)
npm run test:e2e

# Coverage
npm test -- --coverage
```

### Writing Tests

```typescript
describe('StudentService', () => {
  it('should fetch students', async () => {
    const students = await studentService.getStudents();
    expect(students).toBeDefined();
  });
});
```

---

## Debugging

### Backend

```bash
# Enable debug logs
DEBUG=* npm run dev

# Use Node inspector
node --inspect-brk src/server.ts

# Connect VS Code debugger (F5)
```

### Frontend

```bash
# Browser DevTools (F12)
# Check Network, Console, Application tabs

# Next.js debug mode
NODE_OPTIONS='--inspect' npm run dev

# Enable React DevTools
# Install React DevTools browser extension
```

---

## Database

### MongoDB Connection

```bash
# From docker-compose
# Connection string: mongodb://mongo:27017/educore
# User: root / Password: password (dev only)

# Connect to MongoDB shell
docker exec -it educore-mongo mongosh -u root -p password

# View databases
show databases

# Use database
use educore

# View collections
show collections
```

### Common MongoDB Queries

```javascript
// View students
db.students.find()

// Count records
db.students.countDocuments()

// Find specific
db.students.findOne({ email: 'test@example.com' })

// Update
db.students.updateOne({ _id: ObjectId('...') }, { $set: { status: 'active' } })

// Delete
db.students.deleteOne({ _id: ObjectId('...') })
```

---

## Deployment

### Docker Build

```bash
# Build single service
docker build -t educore/auth-service backend/services/auth-service

# Build all services (via docker-compose)
docker-compose build

# Push to registry
docker push educore/auth-service:latest
```

### Kubernetes Deploy

```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments
kubectl get pods

# View logs
kubectl logs -f deployment/auth-service

# Scale deployment
kubectl scale deployment auth-service --replicas=5

# Update image
kubectl set image deployment/auth-service \
  auth-service=educore/auth-service:v1.1 --record
```

### CI/CD Pipeline

```bash
# Triggers automatically on:
# - Push to main/develop (run tests)
# - Merge to main (build Docker image)
# - Tag release (deploy to production)

# View workflow status
# GitHub Actions → Actions tab

# Manual trigger
# GitHub Actions → Select workflow → Run workflow
```

---

## Environment Variables

### Backend (.env)

```
# Database
MONGODB_URI=mongodb://mongo:27017/educore
MONGODB_USER=root
MONGODB_PASSWORD=password

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=refresh-secret
REFRESH_TOKEN_EXPIRY=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password

# Service URLs
AUTH_SERVICE_URL=http://auth-service:4000
STUDENT_SERVICE_URL=http://student-service:4001
# ... more services
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_API_URL=http://localhost:4000
NEXT_PUBLIC_STUDENT_API_URL=http://localhost:4001
# ... more endpoints

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key
```

---

## Useful Links

### Documentation
- API Reference: `/API_REFERENCE.md`
- Backend Guide: `/backend/PHASE1_README_FINAL.md`
- Frontend Guide: `/FRONTEND_INTEGRATION_GUIDE.md`
- DevOps Guide: `/backend/PHASE6_CICD_GUIDE.md`

### Project Status
- Current Status: `/PROJECT_STATUS_MAY2026.md`
- Frontend Plan: `/FRONTEND_DEVELOPMENT_PLAN.md`
- Phase Completion: `/PHASE3_COMPLETE.md`

### Resources
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Kubernetes: https://kubernetes.io/docs
- Docker: https://docs.docker.com

---

## Troubleshooting

### Services Won't Start

```bash
# Check Docker
docker ps -a

# View logs
docker logs container-name

# Restart services
docker-compose restart

# Full restart
docker-compose down
docker-compose up --build
```

### Frontend Won't Connect to Backend

1. Check backend is running: `docker ps | grep educore`
2. Check API URL in `.env.local`
3. Check CORS configuration in backend
4. Check network: `curl http://localhost:4000/health`

### TypeScript Errors

```bash
# Check types
npm run type-check

# Fix issues
npm run lint --fix

# Clear build
rm -rf .next
npm run build
```

### Database Issues

```bash
# Connect to MongoDB
docker exec -it educore-mongo mongosh

# Check connection
db.adminCommand('ping')

# View data
db.students.countDocuments()
```

---

## Getting Help

1. **Check Logs**: `docker logs service-name`
2. **Read Documentation**: See files listed above
3. **Check GitHub Issues**: Project issues and discussions
4. **Team Slack**: #educore-dev channel
5. **Code Review**: Create PR, request review

---

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No `any` types
- Full type coverage
- 85%+ test coverage

### Formatting
- Prettier formatting
- ESLint rules
- 2-space indentation
- Single quotes for strings

### Commits
```
feat: Add new student form
fix: Resolve auth token issue
docs: Update API documentation
test: Add student service tests
refactor: Improve error handling
chore: Update dependencies
```

### PRs
- Descriptive title
- Detailed description
- Link related issues
- Pass all CI checks
- Code review approval

---

**Need more help?** See the comprehensive guides in the documentation folder.

