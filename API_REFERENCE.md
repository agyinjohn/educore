# EduCore API Reference - Phase 3

## Report Service API (Port 4007)

### Financial Reports

#### 1. Generate Financial Report
```
POST /api/v1/reports/financial/generate
Content-Type: application/json

Request Body:
{
  "schoolId": "string",        // required
  "reportType": "string"       // required: "daily"|"weekly"|"monthly"|"quarterly"|"annual"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "schoolId": "string",
    "reportType": "string",
    "revenue": "number",
    "collected": "number",
    "outstanding": "number",
    "refunded": "number",
    "reportDate": "ISO8601",
    "createdAt": "ISO8601"
  }
}

Error (400):
{
  "success": false,
  "message": "string"
}
```

#### 2. Get Financial Report
```
GET /api/v1/reports/financial/:id

Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "schoolId": "string",
    "reportType": "string",
    "revenue": "number",
    "collected": "number",
    "outstanding": "number",
    "refunded": "number"
  }
}

Error (404):
{
  "success": false,
  "message": "Report not found"
}
```

#### 3. List Financial Reports
```
GET /api/v1/reports/financial?schoolId=string&reportType=string&page=number&limit=number

Query Parameters:
- schoolId: string (required)
- reportType: string (optional)
- page: number (default: 1)
- limit: number (default: 10)

Response (200 OK):
{
  "success": true,
  "data": {
    "reports": [
      {
        "_id": "ObjectId",
        "schoolId": "string",
        "reportType": "string",
        "revenue": "number",
        "collected": "number",
        "outstanding": "number",
        "refunded": "number"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### 4. Delete Financial Report
```
DELETE /api/v1/reports/financial/:id

Response (200 OK):
{
  "success": true,
  "message": "Financial report deleted successfully"
}

Error (404):
{
  "success": false,
  "message": "Report not found"
}
```

---

### Academic Reports

#### 1. Generate Academic Report
```
POST /api/v1/reports/academic/generate
Content-Type: application/json

Request Body:
{
  "schoolId": "string",        // required
  "reportType": "string",      // required: "class"|"student"|"subject"
  "classId": "string",         // required for "class" type
  "studentId": "string",       // required for "student" type
  "subject": "string"          // required for "subject" type
}

Response (201 Created):
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "schoolId": "string",
    "reportType": "string",
    "classId": "string",
    "studentId": "string",
    "subject": "string",
    "totalStudents": "number",
    "averageGrade": "number",
    "reportDate": "ISO8601",
    "createdAt": "ISO8601"
  }
}
```

#### 2. Get Academic Report
```
GET /api/v1/reports/academic/:id

Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "schoolId": "string",
    "reportType": "string",
    "classId": "string",
    "totalStudents": "number",
    "averageGrade": "number"
  }
}
```

#### 3. List Academic Reports
```
GET /api/v1/reports/academic?schoolId=string&reportType=string&classId=string&studentId=string&page=number&limit=number

Query Parameters:
- schoolId: string (required)
- reportType: string (optional)
- classId: string (optional)
- studentId: string (optional)
- page: number (default: 1)
- limit: number (default: 10)

Response (200 OK):
{
  "success": true,
  "data": {
    "reports": [...],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### 4. Delete Academic Report
```
DELETE /api/v1/reports/academic/:id

Response (200 OK):
{
  "success": true,
  "message": "Academic report deleted successfully"
}
```

---

## Analytics Service API (Port 4008)

### Dashboard

#### Get Dashboard Metrics
```
GET /api/v1/analytics/dashboard?schoolId=string

Query Parameters:
- schoolId: string (required)

Response (200 OK):
{
  "success": true,
  "data": {
    "schoolId": "string",
    "totalRevenue": "number",
    "totalStudents": "number",
    "averageGrade": "number",
    "attendanceRate": "number",
    "totalStaff": "number",
    "activeClasses": "number",
    "successRate": "number"
  }
}

Error (400):
{
  "success": false,
  "message": "schoolId is required"
}
```

---

### Financial Analytics

#### Get Financial Summary
```
GET /api/v1/analytics/finance/summary?schoolId=string

Query Parameters:
- schoolId: string (required)

Response (200 OK):
{
  "success": true,
  "data": {
    "schoolId": "string",
    "totalRevenue": "number",
    "totalCollected": "number",
    "outstanding": "number",
    "refunded": "number",
    "collectionRate": "number",
    "monthlyTrend": [
      {
        "month": "string",
        "revenue": "number"
      }
    ]
  }
}
```

#### Get Financial Trends
```
GET /api/v1/analytics/finance/trends?schoolId=string&startDate=ISO8601&endDate=ISO8601&period=string

Query Parameters:
- schoolId: string (required)
- startDate: ISO8601 (optional)
- endDate: ISO8601 (optional)
- period: string (optional: "daily"|"weekly"|"monthly")

Response (200 OK):
{
  "success": true,
  "data": {
    "schoolId": "string",
    "period": "string",
    "trends": [
      {
        "date": "ISO8601",
        "revenue": "number",
        "expenses": "number",
        "profit": "number"
      }
    ],
    "totalRevenue": "number",
    "averageDaily": "number",
    "highestDay": "number"
  }
}
```

---

### Academic Analytics

#### Get Academic Summary
```
GET /api/v1/analytics/academic/summary?schoolId=string

Query Parameters:
- schoolId: string (required)

Response (200 OK):
{
  "success": true,
  "data": {
    "schoolId": "string",
    "totalStudents": "number",
    "averageGrade": "number",
    "highestGrade": "number",
    "lowestGrade": "number",
    "gradeDistribution": {
      "A+": "number",
      "A": "number",
      "B": "number",
      "C": "number",
      "D": "number",
      "F": "number"
    },
    "passRate": "number"
  }
}
```

#### Get Academic Performance
```
GET /api/v1/analytics/academic/performance?schoolId=string&classId=string

Query Parameters:
- schoolId: string (required)
- classId: string (optional)
- metric: string (optional: "performance"|"attendance"|"grades")

Response (200 OK):
{
  "success": true,
  "data": {
    "schoolId": "string",
    "classId": "string",
    "studentCount": "number",
    "averageGrade": "number",
    "performanceBySubject": {
      "Mathematics": "number",
      "English": "number",
      "Science": "number"
    },
    "attendanceByClass": {
      "classId": "number"
    }
  }
}
```

---

### Operational Metrics

#### Get Operational Metrics
```
GET /api/v1/analytics/operational/metrics?schoolId=string

Query Parameters:
- schoolId: string (required)

Response (200 OK):
{
  "success": true,
  "data": {
    "schoolId": "string",
    "totalEnrolled": "number",
    "activeStudents": "number",
    "newEnrollments": "number",
    "withdrawals": "number",
    "enrollmentTrend": "number",
    "attendanceRate": "number",
    "averageAttendance": "number",
    "staffCount": "number",
    "studentTeacherRatio": "number"
  }
}

Error (400):
{
  "success": false,
  "message": "schoolId is required"
}
```

---

### Export

#### Export Analytics Data
```
POST /api/v1/analytics/export
Content-Type: application/json

Request Body:
{
  "schoolId": "string",        // required
  "dataType": "string"         // optional: "financial"|"academic"|"all" (default: "all")
}

Response (200 OK):
{
  "success": true,
  "data": "CSV formatted string"
}

Example Response:
{
  "success": true,
  "data": "schoolId,revenue,collected,students,avgGrade,attendance\nschool123,50000,48000,150,85,92\n"
}

Error (400):
{
  "success": false,
  "message": "schoolId is required"
}
```

---

## Health Check Endpoints

### Report Service
```
GET http://localhost:4007/health

Response (200 OK):
{
  "status": "ok",
  "service": "report-service",
  "timestamp": "ISO8601"
}
```

### Analytics Service
```
GET http://localhost:4008/health

Response (200 OK):
{
  "status": "ok",
  "service": "analytics-service",
  "timestamp": "ISO8601"
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error or missing required parameters"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Request/Response Headers

### Required Headers
```
Content-Type: application/json
```

### Optional Headers
```
Authorization: Bearer <token>  (when auth is implemented)
```

---

## Data Types

### ISO8601 Date Format
```
2024-01-15T10:30:45.123Z
```

### ObjectId (MongoDB)
```
507f1f77bcf86cd799439011
```

### Report Type Values
- Financial: "daily", "weekly", "monthly", "quarterly", "annual"
- Academic: "class", "student", "subject"

### Period Values
- "daily", "weekly", "monthly"

---

## Rate Limiting (Recommended)
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## Caching (Recommended)
- Dashboard metrics: 5 minutes
- Financial summary: 1 hour
- Academic performance: 30 minutes
- Operational metrics: 15 minutes

---

## Authentication (Future)
Once auth is integrated, include:
```
Authorization: Bearer <JWT_TOKEN>
```

All endpoints should verify user has access to requested schoolId.
