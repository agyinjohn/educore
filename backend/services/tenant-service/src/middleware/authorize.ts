import { Request, Response, NextFunction } from 'express'
import { Role, Resource, Action, hasPermission } from '@educore/shared'

export function authorize(resource: Resource, action: Action) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.headers['x-user-role'] as Role
    if (!role) {
      res.status(401).json({ success: false, message: 'Unauthenticated' })
      return
    }

    if (!hasPermission(role, resource, action)) {
      res.status(403).json({ success: false, message: 'Forbidden — insufficient permissions' })
      return
    }

    next()
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.headers['x-user-role'] as Role
    if (!role || !roles.includes(role)) {
      res.status(403).json({ success: false, message: 'Forbidden — role not permitted' })
      return
    }
    next()
  }
}
