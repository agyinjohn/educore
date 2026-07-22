import { Request, Response, NextFunction } from 'express'
import { config } from '../config'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Gateway Error]', err.message)

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    // Never expose stack traces in production
    ...(config.isProduction ? {} : { stack: err.stack }),
  })
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Route not found' })
}
