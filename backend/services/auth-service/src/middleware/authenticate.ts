import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { JwtPayload, Role } from '@educore/shared'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

// Verifies the bearer token itself rather than trusting gateway-injected
// headers — this service issues and manages user credentials/roles, so it
// should not rely solely on upstream trust for its own sensitive endpoints.
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or malformed authorization header' })
    return
  }

  try {
    const payload = jwt.verify(authHeader.slice(7), config.jwt.accessSecret) as JwtPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden — insufficient permissions' })
      return
    }
    next()
  }
}
