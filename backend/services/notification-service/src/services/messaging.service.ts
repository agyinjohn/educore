import { MessageThreadModel } from '../models/MessageThread'
import { ParentMessageModel } from '../models/ParentMessage'
import { IParentMessage, SendMessagePayload } from '../types'

/**
 * Phase 4 — Messaging Service
 * Handles two-way parent-teacher messaging and moderation
 */

export class MessagingService {
  /**
   * COMM-010/011: Create or get message thread for parent-teacher communication
   */
  async getOrCreateThread(schoolId: string, parentId: string, teacherId: string, studentId: string) {
    let thread = await MessageThreadModel.findOne({
      school_id: schoolId,
      parentId,
      teacherId,
      studentId,
    })

    if (!thread) {
      thread = await MessageThreadModel.create({
        school_id: schoolId,
        parentId,
        teacherId,
        studentId,
        isActive: true,
      })
    }

    return thread
  }

  /**
   * COMM-010: Parent sends message to teacher
   */
  async sendMessage(
    schoolId: string,
    threadId: string,
    senderId: string,
    senderRole: 'parent' | 'teacher' | 'admin',
    payload: SendMessagePayload
  ): Promise<IParentMessage> {
    // Verify thread exists
    const thread = await MessageThreadModel.findOne({
      _id: threadId,
      school_id: schoolId,
    })

    if (!thread) {
      throw new Error('Message thread not found')
    }

    // COMM-014: Verify sender is authorized for this thread
    if (senderRole === 'parent' && thread.parentId !== senderId) {
      throw new Error('Unauthorized: You are not the parent in this thread')
    }

    if (senderRole === 'teacher' && thread.teacherId !== senderId) {
      throw new Error('Unauthorized: You are not the teacher in this thread')
    }

    // Create message
    const message = await ParentMessageModel.create({
      school_id: schoolId,
      threadId,
      parentId: thread.parentId,
      teacherId: thread.teacherId,
      studentId: thread.studentId,
      message: payload.message,
      attachments: payload.attachments || [],
      senderRole,
      isModerated: false, // Will be moderated asynchronously
    })

    // Update thread's last message time
    thread.lastMessageAt = new Date()
    await thread.save()

    return message
  }

  /**
   * COMM-012: Get messages in a thread
   */
  async getThreadMessages(schoolId: string, threadId: string, limit = 50, offset = 0) {
    const messages = await ParentMessageModel.find({
      school_id: schoolId,
      threadId,
      isArchived: false,
    })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()

    return messages
  }

  /**
   * Get all threads for a parent
   */
  async getParentThreads(schoolId: string, parentId: string) {
    return MessageThreadModel.find({
      school_id: schoolId,
      parentId,
      isActive: true,
    })
      .sort({ lastMessageAt: -1 })
      .lean()
  }

  /**
   * Get all threads for a teacher
   */
  async getTeacherThreads(schoolId: string, teacherId: string) {
    return MessageThreadModel.find({
      school_id: schoolId,
      teacherId,
      isActive: true,
    })
      .sort({ lastMessageAt: -1 })
      .lean()
  }

  /**
   * COMM-013: Internal staff messaging (future enhancement)
   * This could use a separate StaffMessageThread model
   */
  async sendStaffMessage(
    schoolId: string,
    senderId: string,
    recipientId: string,
    message: string,
    attachments?: string[]
  ) {
    // TODO: Implement staff messaging
    // For now, just a placeholder
    console.log(`[messaging] Staff message from ${senderId} to ${recipientId}`)
  }

  /**
   * COMM-014: Moderate messages (content filter)
   * Async process to check for inappropriate content
   */
  async moderateMessage(messageId: string, schoolId: string) {
    const message = await ParentMessageModel.findOne({
      _id: messageId,
      school_id: schoolId,
    })

    if (!message) {
      throw new Error('Message not found')
    }

    // TODO: Implement content filtering
    // - Check for flagged keywords
    // - Check for URLs (if not allowed)
    // - Validate attachments

    // For now, just mark as moderated
    message.isModerated = true
    await message.save()

    return message
  }

  /**
   * COMM-012: Archive a thread
   */
  async archiveThread(schoolId: string, threadId: string) {
    const thread = await MessageThreadModel.findOneAndUpdate(
      { _id: threadId, school_id: schoolId },
      { isActive: false },
      { new: true }
    )

    if (!thread) {
      throw new Error('Thread not found')
    }

    // Archive all messages in thread
    await ParentMessageModel.updateMany(
      { threadId },
      { isArchived: true }
    )

    return thread
  }

  /**
   * Search messages in a thread
   */
  async searchMessages(schoolId: string, threadId: string, query: string) {
    return ParentMessageModel.find({
      school_id: schoolId,
      threadId,
      message: { $regex: query, $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .lean()
  }

  /**
   * Get unread thread count for parent
   */
  async getUnreadThreadCount(schoolId: string, parentId: string) {
    // TODO: Implement read receipt tracking
    // For now, just count active threads
    const count = await MessageThreadModel.countDocuments({
      school_id: schoolId,
      parentId,
      isActive: true,
    })

    return count
  }
}

export const messagingService = new MessagingService()
