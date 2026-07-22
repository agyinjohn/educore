import mongoose from 'mongoose'
import { config } from './index'

let isConnected = false

export async function connectDB(): Promise<void> {
  if (isConnected) return
  await mongoose.connect(config.db.url, { serverSelectionTimeoutMS: 5000 })
  isConnected = true
  console.log('[tenant-service] MongoDB connected (educore_tenants)')
}
