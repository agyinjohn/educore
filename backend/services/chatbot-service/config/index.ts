import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const config = {
  port: parseInt(process.env.PORT || '4008', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/educore_analytics',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  services: {
    finance: process.env.FINANCE_SERVICE_URL || 'http://localhost:4005',
    academic: process.env.ACADEMIC_SERVICE_URL || 'http://localhost:4004',
    student: process.env.STUDENT_SERVICE_URL || 'http://localhost:4003',
    report: process.env.REPORT_SERVICE_URL || 'http://localhost:4007',
  },

  cache: {
    ttl: 3600, // 1 hour
  },
}
