import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from './authenticate'
import { Role, Resource, Action, hasPermission } from '@educore/shared'

export function authorize(resource: Resource, action: Action) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' })
      return
    }

    const allowed = hasPermission(req.user.role as Role, resource, action)
    if (!allowed) {
      res.status(403).json({ success: false, message: 'Forbidden — insufficient permissions' })
      return
    }

    next()
  }
}

// Restrict route to specific roles only
export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' })
      return
    }

    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({ success: false, message: 'Forbidden — role not permitted' })
      return
    }

    next()
  }
}

// Enforce tenant isolation — non-super-admins can only access their own school data
export function enforceTenantScope(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthenticated' })
    return
  }

  if (req.user.role === Role.SUPER_ADMIN) {
    next()
    return
  }

  if (!req.user.schoolId) {
    res.status(403).json({ success: false, message: 'No school assigned to this account' })
    return
  }

  // Inject schoolId header so downstream services always filter by it
  req.headers['x-school-id'] = req.user.schoolId
  next()
}
