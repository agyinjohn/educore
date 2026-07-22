import { Request, Response, NextFunction } from 'express';

// This service has no JWT verification of its own — it trusts the gateway,
// which authenticates the caller and injects x-school-id before proxying
// here. The controllers read x-tenant-id, so bridge the gateway's header to
// what they expect.
export function resolveTenant(req: Request, res: Response, next: NextFunction): void {
  const schoolId = req.headers['x-school-id'] as string | undefined;
  if (!schoolId) {
    res.status(400).json({ success: false, error: 'x-school-id header is required' });
    return;
  }
  req.headers['x-tenant-id'] = schoolId;
  next();
}
