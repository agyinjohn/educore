# ⚡ Quick Setup Instructions - MongoDB Atlas + EduCore Phase 1

## What You Need to Do

### Step 1: Update `.env` File (30 seconds)

The `.env` file has been created at:
```
/Users/apexcode/Desktop/EduCore/backend/.env
```

Edit it and replace the MongoDB Atlas connection string:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/educore?retryWrites=true&w=majority
```

**Replace**:
- `username` → Your MongoDB Atlas username
- `password` → Your MongoDB Atlas password (URL encode special chars)
- `cluster.mongodb.net` → Your actual cluster URL

### Step 2: Get Your MongoDB Atlas Connection String

1. Go to https://cloud.mongodb.com
2. Login to your account
3. Click on "Databases" → Your Cluster
4. Click "Connect" → "Drivers" → "Node.js"
5. Copy the connection string
6. Update your `.env` file

### Step 3: Start Services

```bash
cd /Users/apexcode/Desktop/EduCore/backend
npm run dev:phase1
```

**Expected Output**:
```
✓ api-gateway listening on port 3001
✓ auth-service listening on port 3000
✓ tenant-service listening on port 3004
✓ student-service listening on port 3002
✓ academic-service listening on port 3003
```

---

## Architecture: Microservices with Shared MongoDB Database

```
┌─────────────────────────────────────────┐
│   MongoDB Atlas (Cloud)                 │
│   Database: educore                     │
├─────────────────────────────────────────┤
│ Collections:                            │
│  ├── students (student-service)         │
│  ├── classes (academic-service)         │
│  ├── timetableslots (academic-service)  │
│  ├── attendances (academic-service)     │
│  ├── grades (academic-service)          │
│  ├── assessments (academic-service)     │
│  └── exams (academic-service)           │
└─────────────────────────────────────────┘
         ↑              ↑
         │              │
    ┌────┴───┐      ┌───┴──────┐
    │ Student│      │ Academic │
    │Service │      │ Service  │
    │(3002)  │      │ (3003)   │
    └────────┘      └──────────┘
```

**Shared Database Strategy**:
- ✅ One MongoDB "educore" database
- ✅ Multiple collections (one per entity type)
- ✅ Each service connects to same `MONGO_URI`
- ✅ Services manage their own collections
- ✅ Perfect for Phase 1

**Future**: In Phase 2+, can split into separate databases per service (database per service pattern).

---

## File Locations & Purpose

```
backend/
├── .env                              ← UPDATE THIS with MongoDB Atlas URI
├── .env.example                      ← Template (reference only)
├── MONGODB_ATLAS_SETUP.md            ← Setup guide (detailed)
├── init-db.sh                        ← Auto-init script (optional)
│
├── services/
│   ├── student-service/
│   │   └── src/config/db.ts          ← Reads MONGO_URI from .env
│   └── academic-service/
│       └── src/config/db.ts          ← Reads MONGO_URI from .env
└── QUICK_REFERENCE.md                ← Quick commands
```

---

## Step-by-Step: From Zero to Running

### 1. Create MongoDB Atlas Account (5 min)
- Go to https://www.mongodb.com/cloud/atlas
- Sign up (free)
- Create organization and project

### 2. Create Cluster (2 min)
- Click "Create a Deployment"
- Select "M0 Sandbox" (free)
- Choose region close to you
- Click "Create"

### 3. Setup Network & User (2 min)
- Network Access: Allow "0.0.0.0/0" (anywhere)
- Database Access: Create user (save username/password)

### 4. Get Connection String (1 min)
- Go to Cluster → Connect → Drivers → Node.js
- Copy connection string

### 5. Update .env (1 min)
```bash
cd /Users/apexcode/Desktop/EduCore/backend
nano .env  # or open in editor
# Paste connection string, replace username/password
# Save
```

### 6. Run Services (1 min)
```bash
npm run dev:phase1
```

**Total Time**: ~15 minutes

---

## Connection String Format

### MongoDB Atlas
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/educore?retryWrites=true&w=majority
```

### MongoDB Community (Local)
```
mongodb://localhost:27017/educore
```

### MongoDB Remote Server
```
mongodb://host:27017/educore
```

---

## Testing Connection

Once services are running:

```bash
# Test student service
curl http://localhost:3002/health

# Expected: 200 OK + health check response
```

---

## Troubleshooting

### "Connection Refused"
- ✓ Check `.env` has correct `MONGO_URI`
- ✓ Verify MongoDB Atlas username/password
- ✓ Check IP address is whitelisted in Network Access
- ✓ Special characters in password must be URL encoded

### "No Collections"
- Collections auto-create when first data inserted
- Or manually create via MongoDB Atlas console

### "Permission Denied"
- Verify user has appropriate role
- Create new user if needed

### Services Not Connecting
- Restart services: `npm run dev:phase1`
- Check logs for error messages
- Verify all 5 services show "listening on port X"

---

## Environment Variables Explained

```env
# MongoDB Connection (REQUIRED)
MONGO_URI=mongodb+srv://...

# Redis (Optional for Phase 1)
REDIS_URI=redis://localhost:6379

# JWT Secret (IMPORTANT: change in production)
JWT_SECRET=your-dev-secret-key-change-in-production

# Environment
NODE_ENV=development

# Service Ports
AUTH_SERVICE_PORT=3000
TENANT_SERVICE_PORT=3004
STUDENT_SERVICE_PORT=3002
ACADEMIC_SERVICE_PORT=3003
API_GATEWAY_PORT=3001

# External Services (optional)
RESEND_API_KEY=...
TWILIO_ACCOUNT_SID=...
AWS_S3_BUCKET=...
```

Only `MONGO_URI` is required for Phase 1 to work.

---

## Next Steps

1. ✅ Create `.env` file with MongoDB Atlas URI
2. ✅ Run `npm run dev:phase1`
3. ✅ Verify all 5 services start
4. ✅ Test endpoints (see `PHASE1_API_COMPLETE.md`)
5. ✅ Proceed with Phase 2 (Finance Service)

---

## Documentation

- **Setup**: This file
- **Detailed Setup**: `MONGODB_ATLAS_SETUP.md`
- **API Reference**: `PHASE1_API_COMPLETE.md`
- **Quick Start**: `QUICK_REFERENCE.md`
- **Architecture**: `PHASE1_IMPLEMENTATION_GUIDE.md`

---

## Support

**Question**: How do I get MongoDB Atlas connection string?
**Answer**: MongoDB Atlas → Cluster → Connect → Drivers → Node.js → Copy string

**Question**: Can I use a local MongoDB instead?
**Answer**: Yes, use `mongodb://localhost:27017/educore`

**Question**: Can I use separate databases per service?
**Answer**: Yes (Phase 2+), create separate `MONGO_URI` per service

**Question**: How do I scale this later?
**Answer**: Phase 2: Implement database per service pattern with event messaging

---

## Microservices Database Evolution

```
Phase 1 (Current):
  Single DB → All services
  ✓ Simple
  ✓ Easy to manage

Phase 2:
  Separate DB per service
  ✓ Better isolation
  ✓ Independent scaling

Phase 3+:
  Distributed with event bus
  ✓ Full microservices
  ✓ Event-driven
  ✓ High scalability
```

---

**Ready to go!** Update `.env` and run `npm run dev:phase1` 🚀
