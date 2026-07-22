import mongoose from 'mongoose'
import { config } from './index'

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.database.url)
    console.log('[analytics-service] ✓ MongoDB connected')
  } catch (error) {
    console.error('[analytics-service] MongoDB connection error:', error)
    throw error
  }
}

export default mongoose
