import { Request, Response } from 'express'
import { messagingService } from '../services/messaging.service'

/**
 * Phase 4 — Messaging Controller
 * COMM-010 to COMM-014: Parent-teacher messaging, moderation
 */

export class MessagingController {
  /**
   * POST /messages/threads
   * Get or create a message thread for parent-teacher communication
   */
  async getOrCreateThread(req: Request, res: Response) {
    try {
      const { schoolId, parentId, teacherId, studentId } = req.body

      if (!schoolId || !parentId || !teacherId || !studentId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId, parentId, teacherId, and studentId are required',
        })
      }

      const thread = await messagingService.getOrCreateThread(
        schoolId,
        parentId,
        teacherId,
        studentId
      )

      res.status(201).json({
        success: true,
        data: thread,
      })
    } catch (error: any) {
      console.error('[messaging-controller] getOrCreateThread error:', error.message)
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /messages/:threadId
   * COMM-010/011: Send a message in a thread
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const { threadId } = req.params
      const { schoolId, message, attachments } = req.body
      const userId = (req as any).userId
      const userRole = (req as any).userRole

      if (!schoolId || !message) {
        return res.status(400).json({
          success: false,
          message: 'schoolId and message are required',
        })
      }

      // Determine sender role
      let senderRole: 'parent' | 'teacher' | 'admin' = 'parent'
      if (userRole === 'TEACHER' || userRole === 'ACADEMIC_HEAD') {
        senderRole = 'teacher'
      } else if (userRole === 'SCHOOL_ADMIN') {
        senderRole = 'admin'
      }

      const newMessage = await messagingService.sendMessage(
        schoolId,
        threadId,
        userId,
        senderRole,
        { threadId, message, attachments }
      )

      res.status(201).json({
        success: true,
        data: newMessage,
      })
    } catch (error: any) {
      console.error('[messaging-controller] sendMessage error:', error.message)
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /messages/:threadId
   * COMM-012: Get messages in a thread
   */
  async getThreadMessages(req: Request, res: Response) {
    try {
      const { threadId } = req.params
      const { schoolId, limit = '50', offset = '0' } = req.query

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId query parameter is required',
        })
      }

      const messages = await messagingService.getThreadMessages(
        schoolId as string,
        threadId,
        parseInt(limit as string, 10),
        parseInt(offset as string, 10)
      )

      res.json({
        success: true,
        data: messages,
      })
    } catch (error: any) {
      console.error('[messaging-controller] getThreadMessages error:', error.message)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /messages/threads/parent/:parentId
   * Get all message threads for a parent
   */
  async getParentThreads(req: Request, res: Response) {
    try {
      const { parentId } = req.params
      const { schoolId } = req.query

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId query parameter is required',
        })
      }

      // Security: can only view own threads
      const userId = (req as any).userId
      if (userId !== parentId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Cannot view other users threads',
        })
      }

      const threads = await messagingService.getParentThreads(schoolId as string, parentId)

      res.json({
        success: true,
        data: threads,
      })
    } catch (error: any) {
      console.error('[messaging-controller] getParentThreads error:', error.message)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /messages/threads/teacher/:teacherId
   * Get all message threads for a teacher
   */
  async getTeacherThreads(req: Request, res: Response) {
    try {
      const { teacherId } = req.params
      const { schoolId } = req.query

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId query parameter is required',
        })
      }

      // Security: can only view own threads
      const userId = (req as any).userId
      if (userId !== teacherId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Cannot view other users threads',
        })
      }

      const threads = await messagingService.getTeacherThreads(schoolId as string, teacherId)

      res.json({
        success: true,
        data: threads,
      })
    } catch (error: any) {
      console.error('[messaging-controller] getTeacherThreads error:', error.message)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /messages/:threadId/archive
   * COMM-012: Archive a thread
   */
  async archiveThread(req: Request, res: Response) {
    try {
      const { threadId } = req.params
      const { schoolId } = req.body

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId is required',
        })
      }

      const thread = await messagingService.archiveThread(schoolId, threadId)

      res.json({
        success: true,
        data: thread,
        message: 'Thread archived successfully',
      })
    } catch (error: any) {
      console.error('[messaging-controller] archiveThread error:', error.message)
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /messages/:threadId/search
   * Search messages in a thread
   */
  async searchMessages(req: Request, res: Response) {
    try {
      const { threadId } = req.params
      const { schoolId, q } = req.query

      if (!schoolId || !q) {
        return res.status(400).json({
          success: false,
          message: 'schoolId and q (query) parameters are required',
        })
      }

      const messages = await messagingService.searchMessages(
        schoolId as string,
        threadId,
        q as string
      )

      res.json({
        success: true,
        data: messages,
      })
    } catch (error: any) {
      console.error('[messaging-controller] searchMessages error:', error.message)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
}

export const messagingController = new MessagingController()
