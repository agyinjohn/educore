# Phase 1 API Reference

## Authentication

All endpoints (except `/health`) require JWT authentication via Bearer token in the `Authorization` header.

### Header Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### JWT Payload Structure
```json
{
  "userId": "user_123",
  "email": "teacher@example.com",
  "role": "TEACHER",
  "school_id": "school_abc",
  "iat": 1715851200,
  "exp": 1715854800
}
```

---

## Student Service Endpoints

### Base URL
```
http://localhost:3002/api/v1/students
```

### 1. Create Student
**Endpoint:** `POST /api/v1/students`  
**Roles:** SCHOOL_ADMIN, TEACHER  
**Description:** Create a new student record in the school

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+233501234567",
  "dateOfBirth": "2010-05-15",
  "gender": "M",
  "admissionNumber": "ADM2024001",
  "guardians": [
    {
      "name": "Jane Doe",
      "relationship": "Mother",
      "phone": "+233501234568",
      "email": "jane.doe@example.com"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "663c4a8f1e8d4b5a7c9d2e1f",
    "school_id": "school_abc",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+233501234567",
    "dateOfBirth": "2010-05-15T00:00:00.000Z",
    "gender": "M",
    "status": "active",
    "admissionNumber": "ADM2024001",
    "enrolmentDate": "2024-05-16T10:30:00.000Z",
    "guardians": [...],
    "createdAt": "2024-05-16T10:30:00.000Z",
    "updatedAt": "2024-05-16T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` — Missing required fields or invalid data format
- `401 Unauthorized` — Missing or invalid JWT token
- `403 Forbidden` — User role not authorized (requires SCHOOL_ADMIN or TEACHER)

---

### 2. List Students
**Endpoint:** `GET /api/v1/students`  
**Roles:** All authenticated users  
**Description:** Retrieve paginated list of students with optional filtering

**Query Parameters:**
```
?limit=20          # Items per page (default: 20, max: 100)
&cursor=<objectId> # For cursor-based pagination (omit for first page)
&class_id=class_1  # Filter by class
&status=active     # Filter by status (active, inactive, suspended, graduated, withdrawn)
```

**Example Request:**
```bash
curl "http://localhost:3002/api/v1/students?limit=20&status=active" \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "663c4a8f1e8d4b5a7c9d2e1f",
      "firstName": "John",
      "lastName": "Doe",
      "status": "active",
      "class_id": "class_1",
      "enrolmentDate": "2024-05-16T10:30:00.000Z"
    },
    { ... }
  ],
  "cursor": "663c4a8f1e8d4b5a7c9d2e20",
  "hasMore": true
}
```

---

### 3. Get Student Details
**Endpoint:** `GET /api/v1/students/:id`  
**Roles:** All authenticated users  
**Description:** Retrieve a specific student's full profile

**Path Parameters:**
```
:id = MongoDB ObjectId of student
```

**Example Request:**
```bash
curl "http://localhost:3002/api/v1/students/663c4a8f1e8d4b5a7c9d2e1f" \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "663c4a8f1e8d4b5a7c9d2e1f",
    "school_id": "school_abc",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "dateOfBirth": "2010-05-15",
    "guardians": [...],
    "medicalInfo": "Allergic to peanuts",
    "photo": "https://s3.example.com/students/663c4a8f.jpg"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Student not found"
}
```

---

### 4. Update Student
**Endpoint:** `PUT /api/v1/students/:id`  
**Roles:** SCHOOL_ADMIN  
**Description:** Update student information

**Request Body:**
```json
{
  "firstName": "Jonathan",
  "class_id": "class_2",
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { ... updated student record ... }
}
```

---

### 5. Delete Student (Soft Delete)
**Endpoint:** `DELETE /api/v1/students/:id`  
**Roles:** SCHOOL_ADMIN  
**Description:** Soft-delete a student (sets `deletedAt` timestamp, data retained for audit)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student deleted",
  "data": {
    "_id": "663c4a8f1e8d4b5a7c9d2e1f",
    "deletedAt": "2024-05-16T11:00:00.000Z"
  }
}
```

---

### 6. Bulk Import Students
**Endpoint:** `POST /api/v1/students/import/bulk`  
**Roles:** SCHOOL_ADMIN  
**Description:** Import multiple students from CSV/JSON (max 1,000 per request)

**Request Body:**
```json
{
  "students": [
    {
      "firstName": "Alice",
      "lastName": "Smith",
      "email": "alice@example.com",
      "dateOfBirth": "2010-03-10",
      "admissionNumber": "ADM2024002"
    },
    { ... }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "count": 100,
  "data": [ ... imported students ... ]
}
```

---

## Academic Service Endpoints

### Base URL
```
http://localhost:3003/api/v1/academic
```

### 7. Create Class
**Endpoint:** `POST /api/v1/academic/classes`  
**Roles:** SCHOOL_ADMIN, ACADEMIC_HEAD  
**Description:** Create a new class

**Request Body:**
```json
{
  "name": "Form 1A",
  "section": "A",
  "academicYear": "2024",
  "teacher_id": "teacher_123",
  "capacity": 40,
  "gradeLevel": "9"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "663c4a8f1e8d4b5a7c9d3f1a",
    "school_id": "school_abc",
    "name": "Form 1A",
    "academicYear": "2024",
    "capacity": 40,
    "createdAt": "2024-05-16T10:30:00.000Z"
  }
}
```

---

### 8. List Classes
**Endpoint:** `GET /api/v1/academic/classes`  
**Roles:** All authenticated users  
**Description:** List all classes for an academic year

**Query Parameters:**
```
?academicYear=2024  # REQUIRED: Academic year filter
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "663c4a8f1e8d4b5a7c9d3f1a",
      "name": "Form 1A",
      "section": "A",
      "academicYear": "2024",
      "teacher_id": "teacher_123",
      "capacity": 40
    },
    { ... }
  ]
}
```

---

### 9. Mark Attendance
**Endpoint:** `POST /api/v1/academic/attendance`  
**Roles:** TEACHER, SCHOOL_ADMIN  
**Description:** Mark attendance for a student in a class during a period

**Request Body:**
```json
{
  "student_id": "663c4a8f1e8d4b5a7c9d2e1f",
  "class_id": "663c4a8f1e8d4b5a7c9d3f1a",
  "subject_id": "math",
  "date": "2024-05-16",
  "period": 1,
  "status": "present",
  "note": "On time"
}
```

**Status Enum:** `present`, `absent`, `late`, `excused`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "663c4a8f1e8d4b5a7c9d4g2b",
    "school_id": "school_abc",
    "student_id": "663c4a8f1e8d4b5a7c9d2e1f",
    "class_id": "663c4a8f1e8d4b5a7c9d3f1a",
    "date": "2024-05-16T00:00:00.000Z",
    "period": 1,
    "status": "present",
    "recordedAt": "2024-05-16T10:30:00.000Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "message": "Invalid status", "path": ["body", "status"] }
  ]
}
```

---

### 10. Get Student Attendance
**Endpoint:** `GET /api/v1/academic/attendance/student/:studentId`  
**Roles:** All authenticated users  
**Description:** Get attendance history for a student

**Path Parameters:**
```
:studentId = MongoDB ObjectId of student
```

**Query Parameters (Optional):**
```
?startDate=2024-05-01  # ISO date
&endDate=2024-05-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "663c4a8f1e8d4b5a7c9d4g2b",
      "student_id": "663c4a8f1e8d4b5a7c9d2e1f",
      "class_id": "663c4a8f1e8d4b5a7c9d3f1a",
      "date": "2024-05-16T00:00:00.000Z",
      "period": 1,
      "status": "present"
    },
    { ... }
  ]
}
```

---

### 11. Get Class Attendance
**Endpoint:** `GET /api/v1/academic/attendance/class/:classId`  
**Roles:** All authenticated users  
**Description:** Get attendance for entire class on a specific date

**Path Parameters:**
```
:classId = MongoDB ObjectId of class
```

**Query Parameters:**
```
?date=2024-05-16  # Default: today (ISO format)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "663c4a8f1e8d4b5a7c9d4g2b",
      "student_id": "663c4a8f1e8d4b5a7c9d2e1f",
      "class_id": "663c4a8f1e8d4b5a7c9d3f1a",
      "date": "2024-05-16T00:00:00.000Z",
      "period": 1,
      "status": "present"
    },
    { ... }
  ]
}
```

---

### 12. Record Grade
**Endpoint:** `POST /api/v1/academic/grades`  
**Roles:** TEACHER, SCHOOL_ADMIN  
**Description:** Record a grade for a student in an assessment

**Request Body:**
```json
{
  "student_id": "663c4a8f1e8d4b5a7c9d2e1f",
  "subject_id": "math",
  "assessment_id": "assessment_quiz_1",
  "score": 85,
  "maxScore": 100,
  "term": "term_1",
  "feedback": "Excellent work!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "663c4a8f1e8d4b5a7c9d5h3c",
    "school_id": "school_abc",
    "student_id": "663c4a8f1e8d4b5a7c9d2e1f",
    "subject_id": "math",
    "score": 85,
    "maxScore": 100,
    "percentage": 85,
    "term": "term_1",
    "status": "draft",
    "createdAt": "2024-05-16T10:30:00.000Z"
  }
}
```

---

### 13. Get Student Grades
**Endpoint:** `GET /api/v1/academic/grades/student/:studentId`  
**Roles:** All authenticated users  
**Description:** Get all grades for a student in a term

**Path Parameters:**
```
:studentId = MongoDB ObjectId of student
```

**Query Parameters:**
```
?term=term_1  # REQUIRED: Term filter
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "663c4a8f1e8d4b5a7c9d5h3c",
      "student_id": "663c4a8f1e8d4b5a7c9d2e1f",
      "subject_id": "math",
      "score": 85,
      "percentage": 85,
      "term": "term_1",
      "status": "draft",
      "feedback": "Excellent work!"
    },
    { ... }
  ]
}
```

---

### 14. Publish Grades
**Endpoint:** `POST /api/v1/academic/grades/publish`  
**Roles:** ACADEMIC_HEAD, SCHOOL_ADMIN  
**Description:** Publish all grades for a term (change status from draft → published)

**Request Body:**
```json
{
  "term": "term_1",
  "academicYear": "2024"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Grades published",
  "data": {
    "modifiedCount": 342,
    "matchedCount": 342
  }
}
```

---

### 15. Create Assessment
**Endpoint:** `POST /api/v1/academic/assessments`  
**Roles:** TEACHER, SCHOOL_ADMIN  
**Description:** Create an assessment (quiz, test, exam, etc.)

**Request Body:**
```json
{
  "subject_id": "math",
  "class_id": "663c4a8f1e8d4b5a7c9d3f1a",
  "name": "Algebra Quiz 1",
  "type": "quiz",
  "maxScore": 50,
  "weight": 0.2,
  "description": "Basic algebra questions",
  "date": "2024-05-20",
  "term": "term_1",
  "academicYear": "2024",
  "dueDate": "2024-05-22"
}
```

**Type Enum:** `quiz`, `test`, `exam`, `project`, `assignment`, `classwork`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "663c4a8f1e8d4b5a7c9d6i4d",
    "school_id": "school_abc",
    "subject_id": "math",
    "class_id": "663c4a8f1e8d4b5a7c9d3f1a",
    "name": "Algebra Quiz 1",
    "type": "quiz",
    "maxScore": 50,
    "weight": 0.2,
    "date": "2024-05-20T00:00:00.000Z",
    "term": "term_1",
    "dueDate": "2024-05-22T00:00:00.000Z",
    "createdAt": "2024-05-16T10:30:00.000Z"
  }
}
```

---

### 16. List Assessments
**Endpoint:** `GET /api/v1/academic/assessments`  
**Roles:** All authenticated users  
**Description:** List assessments for a class in a term

**Query Parameters:**
```
?classId=663c4a8f1e8d4b5a7c9d3f1a  # REQUIRED
&term=term_1                        # REQUIRED
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "663c4a8f1e8d4b5a7c9d6i4d",
      "name": "Algebra Quiz 1",
      "type": "quiz",
      "subject_id": "math",
      "maxScore": 50,
      "date": "2024-05-20T00:00:00.000Z",
      "weight": 0.2
    },
    { ... }
  ]
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "message": "String must contain at least 1 character(s)",
      "path": ["body", "firstName"]
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Missing or invalid authorization header"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Student not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

Rate limits are applied per endpoint (to be configured in API Gateway Phase 1):
- **Authentication endpoints:** 10 requests per minute
- **Read endpoints:** 100 requests per minute per user
- **Write endpoints:** 50 requests per minute per user

---

## Pagination

Cursor-based pagination is used for large result sets:

**Request:**
```bash
GET /api/v1/students?limit=20&cursor=663c4a8f1e8d4b5a7c9d2e1f
```

**Response:**
```json
{
  "success": true,
  "data": [ ... 20 items ... ],
  "cursor": "663c4a8f1e8d4b5a7c9d2e20",
  "hasMore": true
}
```

**For next page:**
```bash
GET /api/v1/students?limit=20&cursor=663c4a8f1e8d4b5a7c9d2e20
```

---

## Testing Endpoints Locally

### 1. Get JWT Token
```bash
# (Assuming auth-service is running)
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password"}' \
  | jq -r '.data.token')

echo $TOKEN
```

### 2. Create Student
```bash
curl -X POST http://localhost:3002/api/v1/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "dateOfBirth":"2010-05-15",
    "email":"john@example.com"
  }' | jq
```

### 3. List Students
```bash
curl -X GET "http://localhost:3002/api/v1/students?limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

**Last Updated:** May 16, 2026  
**Version:** Phase 1 MVP
