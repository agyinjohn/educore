import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import mongoose from 'mongoose'

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/educore'

if (!process.env.MONGO_URI) {
  console.warn('[DB] MONGO_URI not found in .env, using default localhost')
}

console.log('[DB] Using MongoDB URI:', mongoUri)

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    })
    console.log('[DB] MongoDB connected:', mongoUri)
  } catch (error) {
    console.error('[DB] MongoDB connection failed:', error)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    console.log('[DB] MongoDB disconnected')
  } catch (error) {
    console.error('[DB] MongoDB disconnection failed:', error)
  }
}
