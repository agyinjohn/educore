import { Router } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { config } from '../config'
import { authenticate } from '../middleware/authenticate'
import { authorize, requireRole, enforceTenantScope } from '../middleware/authorize'
import { authLimiter, generalLimiter } from '../middleware/rateLimiter'
import { Role, Resource, Action } from '@educore/shared'

const router = Router()

// Each downstream service mounts its routes at its own '/api/v1/<name>' path
// (see each service's src/index.ts). Express strips the gateway mount prefix
// ('/api/v1' + the router.use path below) before the proxy ever sees req.url,
// so pathRewrite must restore it — otherwise every proxied request 404s
// against the target service.
function prefixed(target: string, prefix: string) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => `${prefix}${path}`,
  })
}

// ─── Auth Service (public + strict rate limit) ────────────────────────────────
router.use(
  '/auth',
  authLimiter,
  createProxyMiddleware({
    target: config.services.auth,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/auth${path}`,
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
  prefixed(config.services.tenant, '/api/v1/tenants')
)

// ─── Student Service ──────────────────────────────────────────────────────────
router.use(
  '/students',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  authorize(Resource.STUDENT, Action.VIEW),
  prefixed(config.services.student, '/api/v1/students')
)

// ─── Academic Service ─────────────────────────────────────────────────────────
router.use(
  '/academic',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  authorize(Resource.CLASS, Action.VIEW),
  prefixed(config.services.academic, '/api/v1/academic')
)

// ─── Finance Service ──────────────────────────────────────────────────────────
router.use(
  '/finance',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  authorize(Resource.FEE, Action.VIEW),
  prefixed(config.services.finance, '/api/v1/finance')
)

// ─── Analytics Service ─────────────────────────────────────────────────────────
router.use(
  '/analytics',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  prefixed(config.services.analytics, '/api/v1/analytics')
)

// ─── Notification Service ─────────────────────────────────────────────────────
// COMM-001 to COMM-029: Bulk notifications, messaging, emergency broadcasts
router.use(
  '/notifications',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  prefixed(config.services.notification, '/api/v1/notifications')
)

// ─── Messaging Service ────────────────────────────────────────────────────────
// COMM-010 to COMM-014: Parent-teacher two-way messaging
router.use(
  '/messages',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  prefixed(config.services.notification, '/api/v1/messages')
)

// ─── Emergency Broadcasts ─────────────────────────────────────────────────────
// COMM-005: Emergency alerts with mandatory read receipts
router.use(
  '/broadcasts',
  generalLimiter,
  authenticate,
  enforceTenantScope,
  prefixed(config.services.notification, '/api/v1/broadcasts')
)

export default router
