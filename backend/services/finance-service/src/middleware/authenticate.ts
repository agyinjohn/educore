import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { JwtPayload } from '@educore/shared'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

// Every controller in this service reads schoolId straight from the
// request body/query/params and trusts it — nothing here previously
// verified the caller was actually authenticated, let alone that they
// belonged to the school they claimed. This decodes the bearer token
// (config.jwt.accessSecret was already required by config/index.ts but
// unused — the auth check it implies was never wired up) and rejects any
// request whose claimed schoolId doesn't match the token's.
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

// Every finance route takes schoolId from the client (body, query, or a
// :schoolId path param) rather than deriving it server-side — enforce
// that whatever schoolId is claimed actually matches the caller's own,
// and auto-fill it in the body when omitted so existing controller code
// keeps working unchanged.
export function tenantIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const userSchoolId = req.user?.schoolId
  if (!userSchoolId) {
    res.status(403).json({ success: false, message: 'No school associated with this account' })
    return
  }

  const claimed = (req.body && req.body.schoolId) || req.query?.schoolId || req.params?.schoolId
  if (claimed && claimed !== userSchoolId) {
    res.status(403).json({ success: false, message: 'Tenant isolation violation — cannot access data from a different school' })
    return
  }

  if (req.body && req.body.schoolId === undefined) {
    req.body.schoolId = userSchoolId
  }

  next()
}
