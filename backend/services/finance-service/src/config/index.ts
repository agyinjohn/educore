import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export const config = {
  port: parseInt(process.env.PORT || '4005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  db: {
    url: process.env.MONGO_URI || 'mongodb://localhost:27017/educore',
  },

  redis: {
    url: process.env.REDIS_URI || 'redis://localhost:6379',
  },

  jwt: {
    accessSecret: requireEnv('JWT_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  },

  stripe: {
    apiKey: process.env.STRIPE_API_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  services: {
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    studentServiceUrl: process.env.STUDENT_SERVICE_URL || 'http://localhost:4003',
    tenantServiceUrl: process.env.TENANT_SERVICE_URL || 'http://localhost:4002',
  },
}
