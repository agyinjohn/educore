import mongoose from 'mongoose'
import { config } from './index'

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
    })
    console.log('[notification-service] ✓ MongoDB connected')
  } catch (error) {
    console.error('[notification-service] ✗ MongoDB connection failed:', error)
    process.exit(1)
  }
}

export async function disconnectDB() {
  await mongoose.disconnect()
  console.log('[notification-service] ✓ MongoDB disconnected')
}
