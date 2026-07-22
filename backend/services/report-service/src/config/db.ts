import mongoose from 'mongoose'
import { config } from './index'

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.database.url)
    console.log('[report-service] ✓ MongoDB connected')
  } catch (error) {
    console.error('[report-service] MongoDB connection error:', error)
    throw error
  }
}

export default mongoose
