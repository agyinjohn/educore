import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import Redis from 'ioredis'
import { config } from '../config'
import { JwtPayload } from '@educore/shared'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or malformed authorization header' })
    return
  }

  const token = authHeader.slice(7)

  // Check token blacklist (covers logout and password change)
  const blacklisted = await redis.get(`blacklist:${token}`)
  if (blacklisted) {
    res.status(401).json({ success: false, message: 'Token has been revoked' })
    return
  }

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload
    req.user = payload
    req.headers['x-user-id'] = payload.sub
    req.headers['x-user-role'] = payload.role
    req.headers['x-school-id'] = payload.schoolId ?? ''
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired' })
      return
    }
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}
