# ✅ Dotenv Configuration Updated

## What Just Happened

I've updated both services to properly load environment variables from the root `.env` file:

### Changes Made

**Student Service** (`services/student-service/src/config/db.ts`):
```typescript
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Load environment variables from root .env file
dotenv.config({ path: '../../../.env' })

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/educore'

if (!process.env.MONGO_URI) {
  console.warn('[DB] MONGO_URI not found in .env, using default localhost')
}
```

**Academic Service** (`services/academic-service/src/config/db.ts`):
```typescript
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Load environment variables from root .env file
dotenv.config({ path: '../../../.env' })

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/educore'

if (!process.env.MONGO_URI) {
  console.warn('[DB] MONGO_URI not found in .env, using default localhost')
}
```

### ✨ Key Changes

1. **Added `import dotenv from 'dotenv'`** - Loads .env package
2. **Added `dotenv.config({ path: '../../../.env' })`** - Reads from root `.env` file
3. **Added validation warning** - Shows if `MONGO_URI` is missing
4. **Added debug logging** - Shows which URI is being used

### How It Works Now

```
.env file (root)
    ↓ (dotenv reads from here)
mongodb+srv://...@cluster.mongodb.net/educore
    ↓ (process.env.MONGO_URI set)
const mongoUri = process.env.MONGO_URI
    ↓ (connection string used)
mongoose.connect(mongoUri)
```

### 📋 Next Steps

1. **Update `.env`** with your MongoDB Atlas URI:
```bash
nano /Users/apexcode/Desktop/EduCore/backend/.env
```

2. **Replace this line**:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/educore?retryWrites=true&w=majority
```

3. **Run services**:
```bash
npm run dev:phase1
```

4. **You should see**:
```
[DB] Using MongoDB URI: mongodb+srv://your-username:***@cluster...
[DB] MongoDB connected: mongodb+srv://your-username:***@cluster...
```

### ✅ Verification

After running services, check for:
- ✓ `[DB] Using MongoDB URI:` message (shows it loaded from .env)
- ✓ `[DB] MongoDB connected:` message (shows successful connection)
- ✓ No "connection refused" errors

### Troubleshooting

**If you see**: `[DB] MONGO_URI not found in .env, using default localhost`

**Fix**: 
1. Verify `.env` file exists in root (`/backend/.env`)
2. Verify `MONGO_URI=...` line is in the file
3. Restart services

**If you see**: `MongoDB connection failed`

**Fix**:
1. Verify MongoDB Atlas URI is correct
2. Verify username/password are correct
3. Verify IP is whitelisted in MongoDB Atlas

### Files Modified

```
✓ services/student-service/src/config/db.ts
✓ services/academic-service/src/config/db.ts
```

### Status

✅ **Dotenv configuration complete**
⏳ **Waiting for you to add MongoDB Atlas URI to `.env`**
⏳ **Ready to run: npm run dev:phase1**

---

**Your next action**: Update `.env` with your MongoDB Atlas connection string and run `npm run dev:phase1`
