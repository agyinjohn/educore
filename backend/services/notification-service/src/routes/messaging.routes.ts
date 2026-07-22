import { Router } from 'express'
import { messagingController } from '../controllers/messaging.controller'
import { authenticate, tenantIsolation } from '../middleware/authenticate'

const router = Router()

/**
 * Phase 4 — Messaging Routes (Parent-Teacher Communication)
 * All routes require authentication
 */

// COMM-010: Get or create message thread
router.post(
  '/threads',
  authenticate,
  tenantIsolation,
  (req, res) => messagingController.getOrCreateThread(req, res)
)

// COMM-010/011: Send message in thread
router.post(
  '/:threadId',
  authenticate,
  tenantIsolation,
  (req, res) => messagingController.sendMessage(req, res)
)

// COMM-012: Get messages in thread
router.get(
  '/:threadId',
  authenticate,
  tenantIsolation,
  (req, res) => messagingController.getThreadMessages(req, res)
)

// Get all threads for parent
router.get(
  '/threads/parent/:parentId',
  authenticate,
  tenantIsolation,
  (req, res) => messagingController.getParentThreads(req, res)
)

// Get all threads for teacher
router.get(
  '/threads/teacher/:teacherId',
  authenticate,
  tenantIsolation,
  (req, res) => messagingController.getTeacherThreads(req, res)
)

// COMM-012: Archive thread
router.post(
  '/:threadId/archive',
  authenticate,
  tenantIsolation,
  (req, res) => messagingController.archiveThread(req, res)
)

// Search messages in thread
router.get(
  '/:threadId/search',
  authenticate,
  tenantIsolation,
  (req, res) => messagingController.searchMessages(req, res)
)

export default router
