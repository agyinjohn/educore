import { Request, Response, NextFunction } from 'express'

// This service has no JWT verification of its own — it trusts the gateway,
// which authenticates the caller and injects x-school-id before proxying
// here. Without this, req.tenantId is always undefined and every controller
// crashes on `new Types.ObjectId(undefined)`.
export function resolveTenant(req: Request, res: Response, next: NextFunction): void {
  const tenantId = req.headers['x-school-id'] as string | undefined
  if (!tenantId) {
    res.status(400).json({ success: false, error: 'x-school-id header is required' })
    return
  }
  ;(req as any).tenantId = tenantId
  next()
}
