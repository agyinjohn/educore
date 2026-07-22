# Phase 4 Quick Start Guide

## 📌 Overview

You've just completed the **Communication Hub** backend for Phase 4! This service handles:
- Bulk SMS/email/push notifications
- Parent-teacher two-way messaging
- Emergency broadcast alerts
- Message templating & scheduling

## 🚀 Quick Start (5 minutes)

### 1. **Install Dependencies**
```bash
cd backend/services/notification-service
npm install
```

### 2. **Configure Environment**
```bash
# Copy .env from root
cp ../../.env .env.local

# Or add these to .env
NOTIFICATION_SERVICE_PORT=4006
MONGODB_URI=mongodb://localhost:27017/educore_notifications
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

### 3. **Run Service (Development)**
```bash
npm run dev
```

Expected output:
```
[notification-service] ✓ MongoDB connected
[notification-service] ✓ Event bus connected
[notification-service] ✓ Server running on port 4006
```

### 4. **Test an Endpoint**
```bash
# Get health status
curl http://localhost:4006/health

# Send bulk notification (requires JWT token)
curl -X POST http://localhost:4006/api/v1/notifications/bulk \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "school123",
    "title": "Test Notification",
    "body": "This is a test",
    "channels": ["email"],
    "audience": {"type": "all_parents"}
  }'
```

### 5. **Run Tests**
```bash
npm run test
npm run test:coverage
```

---

## 📚 API Endpoints Summary

### Notifications (Bulk Messages)
```
POST   /api/v1/notifications/bulk                    - Send bulk notification
GET    /api/v1/notifications/templates               - List templates
POST   /api/v1/notifications/templates               - Create template
GET    /api/v1/notifications/:messageId/delivery-status  - Track delivery
POST   /api/v1/notifications/:messageId/read         - Mark as read
GET    /api/v1/notifications/recipient/:recipientId  - Get recipient notifications
POST   /api/v1/notifications/:messageId/publish      - Publish draft
```

### Messaging (Parent-Teacher)
```
POST   /api/v1/messages/threads                      - Create thread
POST   /api/v1/messages/:threadId                    - Send message
GET    /api/v1/messages/:threadId                    - Get thread messages
GET    /api/v1/messages/threads/parent/:parentId     - Get parent threads
GET    /api/v1/messages/threads/teacher/:teacherId   - Get teacher threads
POST   /api/v1/messages/:threadId/archive            - Archive thread
GET    /api/v1/messages/:threadId/search             - Search messages
```

### Emergency Broadcasts
```
POST   /api/v1/broadcasts/emergency                  - Send emergency alert
GET    /api/v1/broadcasts/emergency                  - Get broadcast history
POST   /api/v1/broadcasts/:broadcastId/confirm-read  - Confirm read receipt
GET    /api/v1/broadcasts/:broadcastId/receipts      - Get receipt status
```

---

## 🔐 Role-Based Access

| Role | Permissions |
|------|-------------|
| `SCHOOL_ADMIN` | Send bulk notifications, create templates, send emergency broadcasts |
| `TEACHER` | Message parents, receive notifications, view delivery status |
| `PARENT` | Message teachers, view notifications, confirm emergency broadcasts |
| `STUDENT` | View notifications, receive assignments/exam alerts |
| `ACADEMIC_HEAD` | Send academic notifications, access delivery stats |

---

## 💾 Database Schemas

### Message (Bulk Notifications)
```typescript
{
  school_id: string,
  title: string,
  body: string,
  channels: ['email', 'sms', 'push'],
  audience: {
    type: 'all_parents' | 'specific_class' | 'custom',
    classIds?: string[],
    userIds?: string[]
  },
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed',
  scheduledFor?: Date,
  templateId?: string,
  createdBy: string,
  createdAt: Date,
  updatedAt: Date
}
```

### ParentMessage (Two-Way Messaging)
```typescript
{
  school_id: string,
  threadId: string,
  parentId: string,
  teacherId: string,
  studentId: string,
  senderRole: 'parent' | 'teacher' | 'admin',
  message: string,
  attachments?: string[],
  isModerated: boolean,
  isArchived: boolean,
  createdAt: Date
}
```

### EmergencyBroadcast
```typescript
{
  school_id: string,
  title: string,
  body: string,
  priority: 'routine' | 'urgent' | 'emergency',
  channels: ['push', 'sms', 'email'],
  requiresReadReceipt: true,
  createdBy: string,
  confirmedReadBy: string[],
  createdAt: Date
}
```

---

## 🔄 Event Bus Integration

The service automatically sends notifications when:

1. **Student marked absent** → Send SMS/push to parent
2. **Grades published** → Send email/push to student & parent
3. **Payment received** → Send receipt email
4. **User created** → Send welcome email

---

## 🧪 Testing Commands

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- notification.controller.test.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 📊 Project Structure

```
src/
├── config/              # Configuration (env, database)
├── models/              # Mongoose schemas (6 models)
├── services/            # Business logic (3 services)
├── controllers/         # Request handlers (3 controllers)
├── routes/              # API routes (3 route files)
├── middleware/          # Auth & RBAC
├── types/               # TypeScript interfaces
├── __tests__/           # Jest test suite
└── index.ts             # Server entry point
```

---

## 🐛 Troubleshooting

### Service won't start
```
Error: ECONNREFUSED - MongoDB not running
Solution: Start MongoDB: mongod
```

### JWT token invalid
```
Error: Invalid or expired token
Solution: 
1. Ensure token is in Authorization header
2. Token format: "Bearer YOUR_TOKEN_HERE"
3. Check JWT_SECRET matches auth-service
```

### Event bus connection failed
```
Warning: Event bus initialization failed
Solution:
1. Ensure Redis is running: redis-server
2. Check REDIS_URL in .env
3. Service will continue without event bus (non-critical)
```

---

## 📋 Checklist for Integration

- [ ] Notification-service running on port 4006
- [ ] MongoDB connected (check console logs)
- [ ] Redis connected for event bus
- [ ] JWT token generation working from auth-service
- [ ] Test endpoint returns 200 OK
- [ ] Add routes to API gateway (`/api/v1/notifications/*`)
- [ ] Set environment variables in production
- [ ] Configure SendGrid API key (for emails)
- [ ] Configure Twilio credentials (for SMS)
- [ ] Configure Firebase key (for push notifications)

---

## 🎯 Next Steps

1. **API Gateway Integration** (5 minutes)
   - Add notification-service routes to gateway config
   - Proxy `/api/v1/notifications/*` to port 4006

2. **Frontend Development** (Parallel)
   - Parent portal UI
   - Admin notification dashboard
   - Student notifications view

3. **External API Integration** (Phase 5)
   - SendGrid for emails
   - Twilio for SMS
   - Firebase for push notifications

---

## 📞 Support

For issues or questions:
1. Check `PHASE4_API_COMPLETE.md` for full API reference
2. Review `PHASE4_IMPLEMENTATION_COMPLETE.md` for architecture
3. Check test files for usage examples
4. Review EduCore_SRS_v1_0.md for requirements

---

*Phase 4 Communication Hub — Ready for Integration!* 🎉
