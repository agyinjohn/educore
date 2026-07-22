import rateLimit from 'express-rate-limit'
import { config } from '../config'
import { Request, Response } from 'express'

const rateLimitHandler = (_req: Request, res: Response): void => {
  res.status(429).json({ success: false, message: 'Too many requests, please try again later' })
}

// General API rate limit
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
})

// Strict limit for auth endpoints — prevents brute force (AUTH-005)
export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
})
