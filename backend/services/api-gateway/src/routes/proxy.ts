import { Router } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { config } from '../config'
import { authenticate } from '../middleware/authenticate'
import { authorize, requireRole, enforceTenantScope } from '../middleware/authorize'
import { authLimiter, generalLimiter } from '../middleware/rateLimiter'
import { Role, Resource, Action } from '@educore/shared'

const router = Router()

// ─── Auth Service (public + strict rate limit) ────────────────────────────────
router.use(
  '/auth',
  authLimiter,
  createProxyMiddleware({
    target: config.services.auth,
    changeOrigin: true,
    on: {
      error: (err, req, res: any) => {
        res.status(502).json({ success: false, error: 'Auth service unavailable' })
      },
    },
  })
)

// ─── Tenant Service ───────────────────────────────────────────────────────────
router.use(
  '/tenants',
  generalLimiter,
  authenticate,
  requireRole(Role.SUPER_ADMIN, Role.SCHOOL_OWNER, Role.SCHOOL_ADMIN),
  authorize(Resource.TENANT, Action.VIEW),
  createProxyMiddleware({ target: config.services.tenant, changeOrigin: true })
)

// ─── Student Service ──────────────────────────────────────────────────────────
router.use(
  '/students',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  authorize(Resource.STUDENT, Action.VIEW),
  createProxyMiddleware({ target: config.services.student, changeOrigin: true })
)

// ─── Academic Service ─────────────────────────────────────────────────────────
router.use(
  '/academic',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  authorize(Resource.CLASS, Action.VIEW),
  createProxyMiddleware({ target: config.services.academic, changeOrigin: true })
)

// ─── Finance Service ──────────────────────────────────────────────────────────
router.use(
  '/finance',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  authorize(Resource.FEE, Action.VIEW),
  createProxyMiddleware({ target: config.services.finance, changeOrigin: true })
)

// ─── Notification Service ─────────────────────────────────────────────────────
// COMM-001 to COMM-029: Bulk notifications, messaging, emergency broadcasts
router.use(
  '/notifications',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  createProxyMiddleware({ target: config.services.notification, changeOrigin: true })
)

// ─── Messaging Service ────────────────────────────────────────────────────────
// COMM-010 to COMM-014: Parent-teacher two-way messaging
router.use(
  '/messages',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  createProxyMiddleware({ target: config.services.notification, changeOrigin: true })
)

// ─── Emergency Broadcasts ─────────────────────────────────────────────────────
// COMM-005: Emergency alerts with mandatory read receipts
router.use(
  '/broadcasts',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  createProxyMiddleware({ target: config.services.notification, changeOrigin: true })
)

export default router
