import { Router } from 'express'
import { emergencyBroadcastController } from '../controllers/emergency.controller'
import { authenticate, authorize, tenantIsolation } from '../middleware/authenticate'

const router = Router()

/**
 * Phase 4 — Emergency Broadcast Routes
 * COMM-005: Emergency broadcasts with mandatory read receipt
 */

// COMM-005: Send emergency broadcast (SCHOOL_ADMIN only)
router.post(
  '/emergency',
  authenticate,
  tenantIsolation,
  authorize(['SCHOOL_ADMIN']),
  (req, res) => emergencyBroadcastController.sendEmergencyBroadcast(req, res)
)

// Get emergency broadcast history
router.get(
  '/emergency',
  authenticate,
  tenantIsolation,
  (req, res) => emergencyBroadcastController.getEmergencyBroadcasts(req, res)
)

// COMM-005: Confirm read receipt
router.post(
  '/:broadcastId/confirm-read',
  authenticate,
  tenantIsolation,
  (req, res) => emergencyBroadcastController.confirmReadReceipt(req, res)
)

// Get read receipt status
router.get(
  '/:broadcastId/receipts',
  authenticate,
  tenantIsolation,
  (req, res) => emergencyBroadcastController.getReadReceipts(req, res)
)

export default router
