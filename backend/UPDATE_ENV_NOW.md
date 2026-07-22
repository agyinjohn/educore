# 🚀 Update .env with MongoDB Atlas Connection

## The Issue
Services are running but showing: `MONGO_URI not found in .env, using default localhost`

This means the `.env` file still has placeholder values.

## Solution: Update .env File

### Step 1: Edit the .env File
```bash
nano /Users/apexcode/Desktop/EduCore/backend/.env
```

### Step 2: Replace the MONGO_URI Line

**Find this**:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/educore?retryWrites=true&w=majority
```

**Replace with your actual MongoDB Atlas connection string**:
```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/educore?retryWrites=true&w=majority
```

### Step 3: Get Your Connection String
1. Go to https://cloud.mongodb.com
2. Click on "Databases" → Your Cluster
3. Click "Connect" → "Drivers" → "Node.js"
4. Copy the connection string
5. Replace username, password, and cluster URL

### Step 4: Test the Connection

Kill the current services and restart:
```bash
# Stop: Ctrl+C
# Then restart:
npm run dev:phase1
```

### Step 5: Verify

You should see:
```
[student] [DB] Using MongoDB URI: mongodb+srv://your-user@cluster...
[student] [DB] MongoDB connected: mongodb+srv://your-user@cluster...
[academic] [DB] Using MongoDB URI: mongodb+srv://your-user@cluster...
[academic] [DB] MongoDB connected: mongodb+srv://your-user@cluster...
✓ student-service listening on port 3002
✓ academic-service listening on port 3003
```

---

## Connection String Format

### MongoDB Atlas (Recommended)
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/educore?retryWrites=true&w=majority
```

### Local MongoDB
```
mongodb://localhost:27017/educore
```

---

## Troubleshooting

### Still showing "MONGO_URI not found"
- Verify `.env` file exists: `/Users/apexcode/Desktop/EduCore/backend/.env`
- Verify line starts with `MONGO_URI=` (no spaces before)
- Restart services after editing

### "Connection refused"
- Check MongoDB Atlas IP whitelist
- Verify username and password
- Special characters in password must be URL encoded

### "Authentication failed"
- Verify correct username/password
- Create new user in MongoDB Atlas if needed

---

## Done!
Once you see all services running with successful MongoDB connections, you're ready to test the APIs!
