import { Request, Response } from 'express'
import { notificationService } from '../services/notification.service'
import { SendNotificationPayload } from '../types'

/**
 * Phase 4 — Notification Controller
 * COMM-001 to COMM-006: Bulk notifications, templates, scheduled messages
 */

export class NotificationController {
  /**
   * POST /notifications/bulk
   * COMM-001: Send bulk SMS/email/push notifications
   * RBAC: SCHOOL_ADMIN only
   */
  async sendBulkNotification(req: Request, res: Response) {
    try {
      const { schoolId } = req.body
      const userId = (req as any).userId
      const payload: SendNotificationPayload = req.body

      // Validation
      if (!schoolId || !payload.title || !payload.body || !payload.channels?.length) {
        return res.status(400).json({
          success: false,
          message: 'schoolId, title, body, and channels are required',
        })
      }

      const message = await notificationService.sendBulkNotification(schoolId, payload, userId)

      res.status(201).json({
        success: true,
        data: message,
        message: 'Notification queued for sending',
      })
    } catch (error: any) {
      console.error('[notification-controller] sendBulkNotification error:', error.message)
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /notifications/templates
   * COMM-002: List message templates
   */
  async getTemplates(req: Request, res: Response) {
    try {
      const { schoolId } = req.query

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId query parameter is required',
        })
      }

      const templates = await notificationService.getTemplates(schoolId as string)

      res.json({
        success: true,
        data: templates,
      })
    } catch (error: any) {
      console.error('[notification-controller] getTemplates error:', error.message)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /notifications/templates
   * COMM-002: Create a reusable template
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const { schoolId, name, description, title, body, channels, variables } = req.body
      const userId = (req as any).userId

      if (!schoolId || !name || !title || !body || !channels?.length) {
        return res.status(400).json({
          success: false,
          message: 'schoolId, name, title, body, and channels are required',
        })
      }

      const template = await notificationService.createTemplate(
        schoolId,
        { name, description, title, body, channels, variables },
        userId
      )

      res.status(201).json({
        success: true,
        data: template,
      })
    } catch (error: any) {
      console.error('[notification-controller] createTemplate error:', error.message)
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /notifications/:messageId/delivery-status
   * COMM-004: Track delivery status
   */
  async getDeliveryStatus(req: Request, res: Response) {
    try {
      const { messageId } = req.params
      const { schoolId } = req.query

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId query parameter is required',
        })
      }

      const deliveries = await notificationService.getDeliveryStatus(
        messageId,
        schoolId as string
      )

      const stats = await notificationService.getDeliveryStats(messageId, schoolId as string)

      res.json({
        success: true,
        data: {
          deliveries,
          stats: stats.reduce(
            (acc, s) => {
              acc[s._id] = s.count
              return acc
            },
            {} as Record<string, number>
          ),
        },
      })
    } catch (error: any) {
      console.error('[notification-controller] getDeliveryStatus error:', error.message)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /notifications/:messageId/read
   * Mark a notification as read
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { messageId } = req.params
      const { schoolId } = req.body
      const userId = (req as any).userId

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId is required',
        })
      }

      const result = await notificationService.markAsRead(userId, messageId, schoolId)

      res.json({
        success: true,
        data: result,
      })
    } catch (error: any) {
      console.error('[notification-controller] markAsRead error:', error.message)
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /notifications/recipient/:recipientId
   * COMM-024: Get all notifications for a parent
   */
  async getNotificationsForRecipient(req: Request, res: Response) {
    try {
      const { recipientId } = req.params
      const { schoolId, limit = '20' } = req.query

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId query parameter is required',
        })
      }

      // Security: Can only view own notifications unless admin
      const userId = (req as any).userId
      const userRole = (req as any).userRole
      if (userId !== recipientId && userRole !== 'SCHOOL_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Cannot view other users notifications',
        })
      }

      const notifications = await notificationService.getNotificationsForRecipient(
        recipientId,
        schoolId as string,
        parseInt(limit as string, 10)
      )

      res.json({
        success: true,
        data: notifications,
      })
    } catch (error: any) {
      console.error('[notification-controller] getNotificationsForRecipient error:', error.message)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /notifications/:messageId/publish
   * Publish a draft or scheduled message immediately
   */
  async publishMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params
      const { schoolId } = req.body

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId is required',
        })
      }

      const message = await notificationService.publishMessage(messageId, schoolId)

      res.json({
        success: true,
        data: message,
        message: 'Message published successfully',
      })
    } catch (error: any) {
      console.error('[notification-controller] publishMessage error:', error.message)
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }
}

export const notificationController = new NotificationController()
