import mongoose from 'mongoose'
import { config } from './index'

let isConnected = false

export async function connectDB(): Promise<void> {
  if (isConnected) return

  try {
    await mongoose.connect(config.db.url, {
      serverSelectionTimeoutMS: 5000,
    })

    isConnected = true
    console.log('[finance-service] MongoDB connected:', config.db.url)
  } catch (error) {
    console.error('[finance-service] MongoDB connection failed:', error)
    throw error
  }
}

export default mongoose
