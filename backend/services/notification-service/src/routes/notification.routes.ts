import { Router } from 'express'
import { notificationController } from '../controllers/notification.controller'
import { authenticate, authorize, tenantIsolation } from '../middleware/authenticate'

const router = Router()

/**
 * Phase 4 — Notification Routes
 * All routes require authentication
 */

// COMM-001: Send bulk notification (SCHOOL_ADMIN only)
router.post(
  '/bulk',
  authenticate,
  tenantIsolation,
  authorize(['SCHOOL_ADMIN']),
  (req, res) => notificationController.sendBulkNotification(req, res)
)

// COMM-002: Get templates
router.get(
  '/templates',
  authenticate,
  tenantIsolation,
  (req, res) => notificationController.getTemplates(req, res)
)

// COMM-002: Create template
router.post(
  '/templates',
  authenticate,
  tenantIsolation,
  authorize(['SCHOOL_ADMIN']),
  (req, res) => notificationController.createTemplate(req, res)
)

// COMM-004: Get delivery status
router.get(
  '/:messageId/delivery-status',
  authenticate,
  tenantIsolation,
  (req, res) => notificationController.getDeliveryStatus(req, res)
)

// Mark notification as read
router.post(
  '/:messageId/read',
  authenticate,
  tenantIsolation,
  (req, res) => notificationController.markAsRead(req, res)
)

// COMM-024: Get notifications for recipient
router.get(
  '/recipient/:recipientId',
  authenticate,
  tenantIsolation,
  (req, res) => notificationController.getNotificationsForRecipient(req, res)
)

// Publish a draft/scheduled message
router.post(
  '/:messageId/publish',
  authenticate,
  tenantIsolation,
  authorize(['SCHOOL_ADMIN']),
  (req, res) => notificationController.publishMessage(req, res)
)

export default router
