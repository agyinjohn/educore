# Phase 4 — Communication Hub API Reference

**EduCore Communication Service**  
**API Version:** 1.0  
**Status:** ✅ Complete (Web Backend)  
**Date:** May 18, 2026

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Notification API (Bulk Messages)](#notification-api)
4. [Messaging API (Parent-Teacher)](#messaging-api)
5. [Emergency Broadcast API](#emergency-broadcast-api)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Overview

The Communication Hub microservice handles:
- **COMM-001:** Bulk notifications (SMS, email, push) to multiple audience groups
- **COMM-002:** Reusable message templates
- **COMM-003:** Scheduled announcements
- **COMM-004:** Delivery status tracking
- **COMM-005:** Emergency broadcasts with mandatory read receipts
- **COMM-010/011:** Two-way parent-teacher messaging
- **COMM-012:** Message threading and archival
- **COMM-013:** Staff internal messaging (future)
- **COMM-024:** Push notifications for key events
- **COMM-029:** Student notifications for exams, assignments

**Service Details:**
- **Port:** 4006 (development) / configurable
- **Base URL:** `http://localhost:4006/api/v1`
- **Authentication:** JWT Bearer token (required for all endpoints)
- **Multi-tenancy:** All data isolated by `school_id`

---

## Authentication

All endpoints (except `/health`) require JWT authentication.

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

### Supported Roles
- `SCHOOL_ADMIN` — Full access, can send bulk notifications, emergency broadcasts
- `TEACHER` — Can message parents, receive notifications
- `PARENT` — Can message teachers, view child notifications
- `STUDENT` — Can view notifications
- `ACADEMIC_HEAD` — Can message, send academic notifications

---

## Notification API

### 1. Send Bulk Notification
**POST** `/notifications/bulk`

**RBAC:** `SCHOOL_ADMIN` only  
**COMM-001:** Send SMS, email, or push to audience groups

#### Request Body
```json
{
  "schoolId": "school_abc",
  "title": "Attendance Reminder",
  "body": "Please mark attendance for Class 10A today.",
  "channels": ["email", "sms", "push"],
  "audience": {
    "type": "specific_class",
    "classIds": ["class_10a", "class_10b"]
  },
  "scheduledFor": "2024-05-20T10:00:00Z",
  "templateId": "tpl_123"
}
```

#### Audience Types
```typescript
"all_parents"       // All parents in school
"all_staff"         // All teachers & staff
"all_students"      // All students
"specific_class"    // specific classIds
"specific_grade"    // specific gradeIds (e.g., Grade 10)
"specific_roles"    // specific roles: ["TEACHER", "PARENT"]
"custom"            // custom userIds: ["user_1", "user_2", ...]
```

#### Channels
```typescript
"email"   // Email via SendGrid
"sms"     // SMS via Twilio
"push"    // Push notification via Firebase
"in_app"  // In-app notification (stored in DB)
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "msg_663c4a8f",
    "school_id": "school_abc",
    "title": "Attendance Reminder",
    "body": "Please mark attendance...",
    "channels": ["email", "sms", "push"],
    "audience": {
      "type": "specific_class",
      "classIds": ["class_10a", "class_10b"]
    },
    "status": "scheduled",
    "scheduledFor": "2024-05-20T10:00:00Z",
    "createdBy": "admin_123",
    "createdAt": "2024-05-19T14:30:00Z",
    "updatedAt": "2024-05-19T14:30:00Z"
  },
  "message": "Notification queued for sending"
}
```

#### Error Responses
- `400 Bad Request` — Missing title, body, channels, or schoolId
- `401 Unauthorized` — Missing or invalid JWT token
- `403 Forbidden` — User role not SCHOOL_ADMIN

---

### 2. Get Message Templates
**GET** `/notifications/templates?schoolId=school_abc`

**RBAC:** All authenticated users

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "tpl_123",
      "school_id": "school_abc",
      "name": "Attendance Alert",
      "description": "Sent when student is absent",
      "title": "Attendance Alert",
      "body": "Your child {{student_name}} was absent on {{date}}",
      "channels": ["sms", "push"],
      "variables": ["student_name", "date"],
      "isActive": true,
      "createdBy": "admin_123",
      "createdAt": "2024-05-15T10:00:00Z",
      "updatedAt": "2024-05-15T10:00:00Z"
    }
  ]
}
```

---

### 3. Create Message Template
**POST** `/notifications/templates`

**RBAC:** `SCHOOL_ADMIN` only  
**COMM-002:** Create reusable template with variables

#### Request Body
```json
{
  "schoolId": "school_abc",
  "name": "Grade Published",
  "description": "Sent when student's grades are published",
  "title": "Your Grades Are Ready",
  "body": "Hi {{student_name}}, your {{subject}} grades are now available. Score: {{score}}/{{maxScore}}",
  "channels": ["email", "push"],
  "variables": ["student_name", "subject", "score", "maxScore"]
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "tpl_new123",
    "school_id": "school_abc",
    "name": "Grade Published",
    "channels": ["email", "push"],
    "isActive": true,
    "createdAt": "2024-05-19T14:35:00Z"
  }
}
```

---

### 4. Get Delivery Status
**GET** `/notifications/:messageId/delivery-status?schoolId=school_abc`

**COMM-004:** Track sent/delivered/read status per recipient

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "deliveries": [
      {
        "_id": "del_123",
        "messageId": "msg_663c4a8f",
        "recipientId": "user_456",
        "recipientEmail": "parent@example.com",
        "channel": "email",
        "status": "delivered",
        "externalId": "sendgrid_msg_id_xyz",
        "sentAt": "2024-05-19T10:30:00Z",
        "deliveredAt": "2024-05-19T10:31:00Z",
        "readAt": "2024-05-19T10:35:00Z"
      }
    ],
    "stats": {
      "pending": 2,
      "sent": 45,
      "delivered": 43,
      "read": 40,
      "failed": 1,
      "bounced": 0
    }
  }
}
```

---

### 5. Mark Notification as Read
**POST** `/notifications/:messageId/read`

#### Request Body
```json
{
  "schoolId": "school_abc"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "status": "read",
    "readAt": "2024-05-19T14:40:00Z"
  }
}
```

---

### 6. Get Recipient Notifications
**GET** `/notifications/recipient/:recipientId?schoolId=school_abc&limit=20`

**COMM-024:** Get all notifications for a parent/student

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "delivery": {
        "_id": "del_789",
        "messageId": "msg_663c4a8f",
        "status": "delivered",
        "channel": "push",
        "createdAt": "2024-05-19T10:30:00Z"
      },
      "message": {
        "_id": "msg_663c4a8f",
        "title": "Attendance Reminder",
        "body": "Please mark attendance...",
        "channels": ["email", "sms", "push"],
        "status": "sent"
      }
    }
  ]
}
```

---

### 7. Publish Draft/Scheduled Message
**POST** `/notifications/:messageId/publish`

**RBAC:** `SCHOOL_ADMIN` only

#### Request Body
```json
{
  "schoolId": "school_abc"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "status": "sending",
    "message": "Message published successfully"
  }
}
```

---

## Messaging API

### 1. Get or Create Message Thread
**POST** `/messages/threads`

**COMM-010:** Parent-teacher communication channel

#### Request Body
```json
{
  "schoolId": "school_abc",
  "parentId": "parent_123",
  "teacherId": "teacher_456",
  "studentId": "student_789"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "thread_123",
    "school_id": "school_abc",
    "parentId": "parent_123",
    "teacherId": "teacher_456",
    "studentId": "student_789",
    "isActive": true,
    "lastMessageAt": "2024-05-19T14:00:00Z",
    "createdAt": "2024-05-19T14:00:00Z"
  }
}
```

---

### 2. Send Message in Thread
**POST** `/messages/:threadId`

**COMM-010/011:** Parent sends to teacher or vice versa  
**COMM-014:** All messages moderated (cannot message outside approved channels)

#### Request Body
```json
{
  "schoolId": "school_abc",
  "message": "Hi, how is my child doing in class?",
  "attachments": ["file_path_1", "file_path_2"]
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "msg_456",
    "school_id": "school_abc",
    "threadId": "thread_123",
    "parentId": "parent_123",
    "teacherId": "teacher_456",
    "message": "Hi, how is my child doing in class?",
    "senderRole": "parent",
    "isModerated": false,
    "attachments": ["file_path_1"],
    "createdAt": "2024-05-19T15:30:00Z"
  }
}
```

---

### 3. Get Thread Messages
**GET** `/messages/:threadId?schoolId=school_abc&limit=50&offset=0`

**COMM-012:** Retrieve message history with pagination

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "msg_456",
      "threadId": "thread_123",
      "message": "Hi, how is my child doing in class?",
      "senderRole": "parent",
      "isModerated": true,
      "createdAt": "2024-05-19T15:30:00Z"
    },
    {
      "_id": "msg_789",
      "message": "Your child is performing well! Here's the score...",
      "senderRole": "teacher",
      "createdAt": "2024-05-19T15:45:00Z"
    }
  ]
}
```

---

### 4. Get Parent Threads
**GET** `/messages/threads/parent/:parentId?schoolId=school_abc`

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "thread_1",
      "teacherId": "teacher_456",
      "studentId": "student_789",
      "isActive": true,
      "lastMessageAt": "2024-05-19T15:45:00Z"
    }
  ]
}
```

---

### 5. Get Teacher Threads
**GET** `/messages/threads/teacher/:teacherId?schoolId=school_abc`

---

### 6. Archive Thread
**POST** `/messages/:threadId/archive`

**COMM-012:** Archive thread and all messages

#### Request Body
```json
{
  "schoolId": "school_abc"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "isActive": false,
    "message": "Thread archived successfully"
  }
}
```

---

### 7. Search Messages
**GET** `/messages/:threadId/search?schoolId=school_abc&q=urgent`

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "msg_123",
      "message": "This is an urgent matter",
      "senderRole": "parent",
      "createdAt": "2024-05-19T14:00:00Z"
    }
  ]
}
```

---

## Emergency Broadcast API

### 1. Send Emergency Broadcast
**POST** `/broadcasts/emergency`

**RBAC:** `SCHOOL_ADMIN` only  
**COMM-005:** Emergency alert with mandatory read receipt

#### Request Body
```json
{
  "schoolId": "school_abc",
  "title": "School Lockdown Alert",
  "body": "School is under lockdown. All students and staff should stay in designated areas.",
  "priority": "emergency",
  "channels": ["push", "sms", "email"]
}
```

#### Priority Levels
```
"routine"   // Normal announcement
"urgent"    // Time-sensitive
"emergency" // Critical, requires acknowledgment
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "bcast_123",
    "school_id": "school_abc",
    "title": "School Lockdown Alert",
    "body": "School is under lockdown...",
    "priority": "emergency",
    "channels": ["push", "sms", "email"],
    "requiresReadReceipt": true,
    "createdBy": "admin_123",
    "confirmedReadBy": [],
    "createdAt": "2024-05-19T16:00:00Z"
  },
  "message": "Emergency broadcast sent with read receipt tracking"
}
```

---

### 2. Get Emergency Broadcast History
**GET** `/broadcasts/emergency?schoolId=school_abc&limit=20`

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "bcast_123",
      "title": "School Lockdown Alert",
      "priority": "emergency",
      "createdAt": "2024-05-19T16:00:00Z",
      "confirmedReadBy": ["user_1", "user_2", "user_3"]
    }
  ]
}
```

---

### 3. Confirm Read Receipt
**POST** `/broadcasts/:broadcastId/confirm-read`

**COMM-005:** User confirms they have read emergency broadcast

#### Request Body
```json
{
  "schoolId": "school_abc"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "confirmedReadBy": ["user_1", "user_2"],
    "message": "Read receipt confirmed"
  }
}
```

---

### 4. Get Read Receipt Status
**GET** `/broadcasts/:broadcastId/receipts?schoolId=school_abc`

**COMM-005:** Admin can view who has/hasn't confirmed

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "broadcastId": "bcast_123",
    "confirmed": 87,
    "pending": 13,
    "confirmedBy": ["user_1", "user_2", "..."],
    "pendingUsers": ["user_88", "user_89", "..."]
  }
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "schoolId, title, body, and channels are required"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Missing or invalid authorization header"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions. Required roles: SCHOOL_ADMIN"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Message not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

*To be implemented in Phase 5*

### Recommended Limits
- **Bulk Notifications:** 100/hour per school
- **Personal Messages:** 1000/day per user
- **Emergency Broadcasts:** 10/day per school
- **API Calls:** 10,000/hour per school

---

## Service Port Configuration

**Default Ports:**
- Local development: `4006`
- Test environment: `4106`
- Production: Configurable via `NOTIFICATION_SERVICE_PORT` env var

---

## Integration with Event Bus

The notification service listens to these events and sends automatic notifications:

```typescript
// When student is absent
ServiceEvent.ATTENDANCE_MARKED → Send SMS/push to parent

// When grades are published
ServiceEvent.GRADE_PUBLISHED → Send email/push to student & parent

// When payment received
ServiceEvent.PAYMENT_RECEIVED → Send receipt email

// When user created
ServiceEvent.USER_CREATED → Send welcome email
```

---

## Future Enhancements (Phase 5+)

- [ ] Multi-language support for messages (COMM-006)
- [ ] Staff internal group messaging (COMM-013)
- [ ] AI-powered message suggestions
- [ ] SMS delivery via Twilio (currently placeholder)
- [ ] Email delivery via SendGrid (currently placeholder)
- [ ] Firebase Cloud Messaging integration for push
- [ ] Message scheduling with timezone support
- [ ] Message analytics dashboard
- [ ] A/B testing for notification content
- [ ] Delivery rate monitoring & alerts

---

*Version 1.0 | Phase 4 Communication Hub | May 18, 2026*
