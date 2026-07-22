import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'

export interface AuthPayload {
  userId: string
  email: string
  role: string
  school_id: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid authorization header' })
  }

  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' })
    }

    next()
  }
}

export const tenantIsolation = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User not authenticated' })
  }

  // Attach school_id for automatic tenant filtering in queries
  req.user.school_id = req.user.school_id || req.query.school_id as string
  if (!req.user.school_id) {
    return res.status(400).json({ success: false, message: 'school_id is required' })
  }

  next()
}
