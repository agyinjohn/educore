import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'

export interface AuthPayload {
  userId: string
  email: string
  role: string
  school_id: string
  iat: number
  exp: number
}

declare global {
  namespace Express {
    interface Request {
      userId?: string
      userRole?: string
      schoolId?: string
      user?: AuthPayload
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Missing or invalid authorization header',
    })
  }

  const token = authHeader.slice(7)

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload
    req.userId = decoded.userId
    req.userRole = decoded.role
    req.schoolId = decoded.school_id
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}

/**
 * Authorize middleware - check if user has required role
 * Usage: app.post('/route', authenticate, authorize(['SCHOOL_ADMIN']), controller)
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      })
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`,
      })
    }

    next()
  }
}

/**
 * Tenant isolation middleware - ensure schoolId is consistent
 */
export const tenantIsolation = (req: Request, res: Response, next: NextFunction) => {
  const bodySchoolId = req.body?.schoolId
  const querySchoolId = req.query?.schoolId

  const providedSchoolId = bodySchoolId || querySchoolId
  const userSchoolId = req.schoolId

  if (providedSchoolId && providedSchoolId !== userSchoolId) {
    return res.status(403).json({
      success: false,
      message: 'Tenant isolation violation - cannot access data from different school',
    })
  }

  // Automatically inject schoolId for consistency
  if (req.body) {
    req.body.schoolId = userSchoolId
  }

  next()
}
