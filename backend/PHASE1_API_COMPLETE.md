# Phase 1 Complete API Reference

## Overview

EduCore Phase 1 provides 24 REST API endpoints across 2 microservices (student-service and academic-service) for managing students, classes, timetables, attendance, grades, assessments, and analytics.

**Base URLs:**
- Student Service: `http://localhost:3002/api/students`
- Academic Service: `http://localhost:3003/api/academic`

**Authentication:** All endpoints (except `/health`) require JWT bearer token:
```
Authorization: Bearer <jwt_token>
```

---

## Student Service (Port 3002)

### 1. Create Student
**POST** `/api/students`
```bash
curl -X POST http://localhost:3002/api/students \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@student.com",
    "dateOfBirth": "2010-05-15",
    "gender": "male",
    "class_id": "class123",
    "status": "active",
    "guardians": [{"name": "Jane Doe", "phone": "+1234567890"}]
  }'
```
**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "_id": "student123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@student.com",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. List Students
**GET** `/api/students?page=1&limit=20&status=active`
```bash
curl http://localhost:3002/api/students \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": [
    { "_id": "student123", "firstName": "John", "lastName": "Doe", "status": "active" },
    { "_id": "student124", "firstName": "Jane", "lastName": "Smith", "status": "active" }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "hasMore": false,
    "cursor": "student124"
  }
}
```

### 3. Get Student by ID
**GET** `/api/students/:studentId`
```bash
curl http://localhost:3002/api/students/student123 \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK (same structure as Create Student response)

### 4. Update Student
**PATCH** `/api/students/:studentId`
```bash
curl -X PATCH http://localhost:3002/api/students/student123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jonathan",
    "status": "active"
  }'
```
**Response:** 200 OK

### 5. Delete Student (Soft Delete)
**DELETE** `/api/students/:studentId`
```bash
curl -X DELETE http://localhost:3002/api/students/student123 \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK (student marked as deleted, not removed from DB)

### 6. Bulk Import Students
**POST** `/api/students/bulk-import`
```bash
curl -X POST http://localhost:3002/api/students/bulk-import \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "students": [
      {"firstName": "John", "lastName": "Doe", "email": "john@school.com", "class_id": "class123"},
      {"firstName": "Jane", "lastName": "Smith", "email": "jane@school.com", "class_id": "class123"}
    ]
  }'
```
**Response:** 201 Created
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

---

## Academic Service (Port 3003)

### 1. Create Class
**POST** `/api/academic/classes`
```bash
curl -X POST http://localhost:3003/api/academic/classes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Class 10A",
    "section": "A",
    "academicYear": "2024-2025",
    "teacher_id": "teacher123",
    "capacity": 40
  }'
```
**Response:** 201 Created

### 2. List Classes
**GET** `/api/academic/classes?academicYear=2024-2025`
```bash
curl http://localhost:3003/api/academic/classes \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK

### 3. Create Timetable Slot
**POST** `/api/academic/timetable`
```bash
curl -X POST http://localhost:3003/api/academic/timetable \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": "class123",
    "teacher_id": "teacher123",
    "subject": "Mathematics",
    "dayOfWeek": "Monday",
    "period": 1,
    "startTime": "09:00",
    "endTime": "10:00",
    "room": "Room 101",
    "academicYear": "2024-2025",
    "term": "Term 1"
  }'
```
**Response:** 201 Created or 409 Conflict (if teacher/room already booked)

### 4. Get Timetable for Class
**GET** `/api/academic/timetable/class/:classId?academicYear=2024-2025&term=Term 1`
```bash
curl http://localhost:3003/api/academic/timetable/class/class123?academicYear=2024-2025&term=Term%201 \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "slot1",
      "dayOfWeek": "Monday",
      "period": 1,
      "subject": "Mathematics",
      "teacher_id": "teacher123",
      "room": "Room 101",
      "startTime": "09:00",
      "endTime": "10:00"
    }
  ]
}
```

### 5. Mark Attendance (Single)
**POST** `/api/academic/attendance`
```bash
curl -X POST http://localhost:3003/api/academic/attendance \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "student123",
    "class_id": "class123",
    "date": "2024-01-15",
    "period": 1,
    "status": "present"
  }'
```
**Response:** 201 Created

### 6. Mark Bulk Attendance
**POST** `/api/academic/attendance/bulk`
```bash
curl -X POST http://localhost:3003/api/academic/attendance/bulk \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {"student_id": "student1", "class_id": "class123", "date": "2024-01-15", "period": 1, "status": "present"},
      {"student_id": "student2", "class_id": "class123", "date": "2024-01-15", "period": 1, "status": "absent"},
      {"student_id": "student3", "class_id": "class123", "date": "2024-01-15", "period": 1, "status": "late"}
    ]
  }'
```
**Response:** 201 Created
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

### 7. Get Student Attendance
**GET** `/api/academic/attendance/student/:studentId`
```bash
curl http://localhost:3003/api/academic/attendance/student/student123 \
  -H "Authorization: Bearer <token>"
```

### 8. Get Class Attendance
**GET** `/api/academic/attendance/class/:classId`
```bash
curl http://localhost:3003/api/academic/attendance/class/class123 \
  -H "Authorization: Bearer <token>"
```

### 9. Get Student Attendance Stats
**GET** `/api/academic/attendance/stats/student/:studentId?term=Term 1`
```bash
curl http://localhost:3003/api/academic/attendance/stats/student/student123?term=Term%201 \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "total": 40,
    "present": 38,
    "absent": 1,
    "late": 1,
    "excused": 0,
    "attendanceRate": 95
  }
}
```

### 10. Get Class Attendance Stats
**GET** `/api/academic/attendance/stats/class/:classId?date=2024-01-15`
```bash
curl http://localhost:3003/api/academic/attendance/stats/class/class123?date=2024-01-15 \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "totalStudents": 40,
    "present": 38,
    "absent": 1,
    "late": 1,
    "attendancePercentage": 95
  }
}
```

### 11. Record Grade
**POST** `/api/academic/grades`
```bash
curl -X POST http://localhost:3003/api/academic/grades \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "student123",
    "class_id": "class123",
    "subject": "Mathematics",
    "percentage": 85,
    "assessment_id": "assessment123",
    "term": "Term 1"
  }'
```
**Response:** 201 Created

### 12. Get Student Grades
**GET** `/api/academic/grades/student/:studentId`
```bash
curl http://localhost:3003/api/academic/grades/student/student123 \
  -H "Authorization: Bearer <token>"
```

### 13. Publish Grades
**POST** `/api/academic/grades/publish`
```bash
curl -X POST http://localhost:3003/api/academic/grades/publish \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": "class123",
    "term": "Term 1",
    "academicYear": "2024-2025"
  }'
```
**Response:** 200 OK (all draft grades for the class/term published)

### 14. Get Term Average Grades
**GET** `/api/academic/grades/term-averages/:classId?term=Term 1`
```bash
curl http://localhost:3003/api/academic/grades/term-averages/class123?term=Term%201 \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "subject": "Mathematics",
      "averagePercentage": 78.5,
      "studentCount": 40
    },
    {
      "subject": "English",
      "averagePercentage": 82.1,
      "studentCount": 40
    }
  ]
}
```

### 15. Get Student Rank in Class
**GET** `/api/academic/grades/student-rank/:studentId?term=Term 1`
```bash
curl http://localhost:3003/api/academic/grades/student-rank/student123?term=Term%201 \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "studentId": "student123",
    "termAverage": 84.5,
    "rank": 3,
    "percentile": 92.5,
    "totalStudents": 40
  }
}
```

### 16. Get Grade Distribution
**GET** `/api/academic/grades/distribution/:classId?term=Term 1`
```bash
curl http://localhost:3003/api/academic/grades/distribution/class123?term=Term%201 \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "A": 8,
    "B": 12,
    "C": 15,
    "D": 4,
    "F": 1
  }
}
```

### 17. Get At-Risk Students
**GET** `/api/academic/at-risk/:classId?attendanceThreshold=80&gradeThreshold=65`
```bash
curl http://localhost:3003/api/academic/at-risk/class123?attendanceThreshold=80&gradeThreshold=65 \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "student_id": "student456",
      "name": "Student ABC123",
      "attendanceRate": 72,
      "averageGrade": 58,
      "riskLevel": "high",
      "reason": ["Low attendance: 72%", "Low average grade: 58%"]
    }
  ]
}
```

### 18. Create Assessment
**POST** `/api/academic/assessments`
```bash
curl -X POST http://localhost:3003/api/academic/assessments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": "class123",
    "name": "Unit Test 1",
    "type": "test",
    "totalMarks": 100,
    "weight": 15,
    "term": "Term 1",
    "dueDate": "2024-01-20"
  }'
```
**Response:** 201 Created

### 19. List Assessments
**GET** `/api/academic/assessments?classId=class123&term=Term 1`
```bash
curl http://localhost:3003/api/academic/assessments?classId=class123&term=Term%201 \
  -H "Authorization: Bearer <token>"
```
**Response:** 200 OK

---

## Error Handling

All endpoints follow consistent error response format:

**4xx Client Error:**
```json
{
  "success": false,
  "message": "Validation failed: email must be valid"
}
```

**5xx Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### Common Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Timetable conflict detected
- `500 Internal Server Error` - Server error

---

## Authentication Flow

1. **Login** (via auth-service): Get JWT token
2. **Add token to header**: `Authorization: Bearer <jwt_token>`
3. **All requests** include this header (except `/health`)

---

## Pagination

List endpoints support cursor-based pagination:
- `?page=1` - Page number (default: 1)
- `?limit=20` - Results per page (default: 20)
- `?cursor=lastId` - Cursor for next page

Response includes:
```json
{
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "hasMore": true,
    "cursor": "student124"
  }
}
```

---

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Window**: 1 minute rolling window
- **Headers**: 
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1705334460`

---

## Implementation Checklist

- ✅ 24 REST endpoints (6 students + 18 academic)
- ✅ JWT authentication + RBAC
- ✅ Input validation (Zod schemas)
- ✅ Error handling with consistent responses
- ✅ Cursor pagination for large datasets
- ✅ Soft deletes with audit trail
- ✅ Timetable conflict detection
- ✅ Bulk operations (attendance, student import)
- ✅ At-risk student detection
- ✅ Grade analytics (rank, distribution, averages)
- ✅ Multi-tenancy isolation (school_id filtering)
- ✅ Comprehensive documentation
