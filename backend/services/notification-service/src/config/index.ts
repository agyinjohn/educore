import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const config = {
  // Service
  port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '4006', 10),
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/educore_notifications',

  // Redis / Event Bus
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT — must match the secret auth-service signs with (JWT_ACCESS_SECRET)
  jwtSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '15m',

  // Email / SMS providers (Phase 4 integrations)
  sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',

  // Firebase Cloud Messaging (for push notifications)
  fcmServerKey: process.env.FCM_SERVER_KEY || '',

  // Feature flags
  enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  enableSmsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
  enablePushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
}

export default config
