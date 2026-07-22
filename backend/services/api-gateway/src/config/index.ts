import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
  },

  services: {
    auth: requireEnv('AUTH_SERVICE_URL'),
    tenant: requireEnv('TENANT_SERVICE_URL'),
    student: requireEnv('STUDENT_SERVICE_URL'),
    academic: requireEnv('ACADEMIC_SERVICE_URL'),
    finance: requireEnv('FINANCE_SERVICE_URL'),
    notification: requireEnv('NOTIFICATION_SERVICE_URL'),
    analytics: requireEnv('ANALYTICS_SERVICE_URL'),
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  },
}
