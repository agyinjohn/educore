import { Request, Response } from 'express'
import { emergencyBroadcastService } from '../services/emergency.service'
import { BroadcastType } from '../types'

/**
 * Phase 4 — Emergency Broadcast Controller
 * COMM-005: Emergency broadcasts with mandatory read receipt
 */

export class EmergencyBroadcastController {
  /**
   * POST /broadcasts/emergency
   * COMM-005: Send an emergency broadcast
   * RBAC: SCHOOL_ADMIN only
   */
  async sendEmergencyBroadcast(req: Request, res: Response) {
    try {
      const { schoolId, title, body, priority, channels } = req.body
      const userId = (req as any).userId

      if (!schoolId || !title || !body || !channels?.length) {
        return res.status(400).json({
          success: false,
          message: 'schoolId, title, body, and channels are required',
        })
      }

      // Validate priority
      if (priority && !Object.values(BroadcastType).includes(priority)) {
        return res.status(400).json({
          success: false,
          message: `Invalid priority. Must be one of: ${Object.values(BroadcastType).join(', ')}`,
        })
      }

      const broadcast = await emergencyBroadcastService.sendEmergencyBroadcast(
        schoolId,
        { title, body, priority: priority || BroadcastType.EMERGENCY, channels },
        userId
      )

      res.status(201).json({
        success: true,
        data: broadcast,
        message: 'Emergency broadcast sent with read receipt tracking',
      })
    } catch (error: any) {
      console.error('[emergency-controller] sendEmergencyBroadcast error:', error.message)
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /broadcasts/emergency
   * Get emergency broadcast history
   */
  async getEmergencyBroadcasts(req: Request, res: Response) {
    try {
      const { schoolId, limit = '20' } = req.query

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId query parameter is required',
        })
      }

      const broadcasts = await emergencyBroadcastService.getEmergencyBroadcasts(
        schoolId as string,
        parseInt(limit as string, 10)
      )

      res.json({
        success: true,
        data: broadcasts,
      })
    } catch (error: any) {
      console.error('[emergency-controller] getEmergencyBroadcasts error:', error.message)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /broadcasts/:broadcastId/confirm-read
   * COMM-005: Confirm that user has read emergency broadcast
   */
  async confirmReadReceipt(req: Request, res: Response) {
    try {
      const { broadcastId } = req.params
      const { schoolId } = req.body
      const userId = (req as any).userId

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId is required',
        })
      }

      const broadcast = await emergencyBroadcastService.confirmReadReceipt(
        broadcastId,
        schoolId,
        userId
      )

      res.json({
        success: true,
        data: broadcast,
        message: 'Read receipt confirmed',
      })
    } catch (error: any) {
      console.error('[emergency-controller] confirmReadReceipt error:', error.message)
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /broadcasts/:broadcastId/receipts
   * Get read receipt status for an emergency broadcast
   */
  async getReadReceipts(req: Request, res: Response) {
    try {
      const { broadcastId } = req.params
      const { schoolId } = req.query

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId query parameter is required',
        })
      }

      const receipts = await emergencyBroadcastService.getUnconfirmedReceipts(
        broadcastId,
        schoolId as string
      )

      res.json({
        success: true,
        data: receipts,
      })
    } catch (error: any) {
      console.error('[emergency-controller] getReadReceipts error:', error.message)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
}

export const emergencyBroadcastController = new EmergencyBroadcastController()
