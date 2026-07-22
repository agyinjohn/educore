import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  port: parseInt(process.env.PORT || '4004', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/educore',
  redisUri: process.env.REDIS_URI || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
}
