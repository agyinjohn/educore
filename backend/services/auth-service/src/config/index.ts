import dotenv from 'dotenv'
dotenv.config()

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export const config = {
  port: parseInt(process.env.PORT || '4001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  db: {
    url: requireEnv('MONGODB_URI'),
  },

  redis: {
    url: requireEnv('REDIS_URL'),
  },

  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  passwordReset: {
    expiresSec: parseInt(process.env.PASSWORD_RESET_EXPIRES_SEC || '1800', 10),
  },

  lockout: {
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    durationMs: parseInt(process.env.LOCKOUT_DURATION_MS || '1800000', 10),
  },

  totp: {
    issuer: process.env.TOTP_ISSUER || 'EduCore',
  },
}
