import { MessageModel } from '../models/Message'
import { MessageTemplateModel } from '../models/MessageTemplate'
import { DeliveryStatusModel } from '../models/DeliveryStatus'
import {
  IMessage,
  MessageStatus,
  NotificationChannel,
  DeliveryStatus as DeliveryStatusEnum,
  SendNotificationPayload,
  AudienceType,
} from '../types'

/**
 * Phase 4 — Notification Service
 * Handles bulk notifications, templates, and delivery tracking
 */

export class NotificationService {
  /**
   * Send a bulk notification to an audience
   * COMM-001: Admins SHALL be able to send bulk SMS, email, and push notifications
   */
  async sendBulkNotification(
    schoolId: string,
    payload: SendNotificationPayload,
    userId: string
  ): Promise<IMessage> {
    // Validate required fields
    if (!payload.title || !payload.body || !payload.channels.length) {
      throw new Error('Title, body, and channels are required')
    }

    // Validate audience
    if (!payload.audience || !payload.audience.type) {
      throw new Error('Audience type is required')
    }

    // Create message record
    const message = await MessageModel.create({
      school_id: schoolId,
      title: payload.title,
      body: payload.body,
      channels: payload.channels,
      audience: payload.audience,
      status: payload.scheduledFor ? MessageStatus.SCHEDULED : MessageStatus.SENDING,
      scheduledFor: payload.scheduledFor,
      sendAt: payload.scheduledFor || new Date(),
      templateId: payload.templateId,
      createdBy: userId,
    })

    // If not scheduled, immediately queue for sending
    if (!payload.scheduledFor) {
      await this.sendMessage(message._id!.toString(), schoolId)
    }

    return message
  }

  /**
   * Actually send the message to recipients
   * This would integrate with email/SMS providers
   */
  async sendMessage(messageId: string, schoolId: string): Promise<void> {
    const message = await MessageModel.findOne({ _id: messageId, school_id: schoolId })
    if (!message) {
      throw new Error('Message not found')
    }

    try {
      // Update status to SENDING
      message.status = MessageStatus.SENDING
      await message.save()

      // Get recipient list based on audience
      const recipientIds = await this.getRecipientIds(message, schoolId)

      // Create delivery status records for each recipient & channel
      for (const recipientId of recipientIds) {
        for (const channel of message.channels) {
          await DeliveryStatusModel.create({
            school_id: schoolId,
            messageId: message._id,
            recipientId,
            channel,
            status: DeliveryStatusEnum.PENDING,
          })
        }
      }

      // TODO: Integrate with actual email/SMS providers
      // - SendGrid for email
      // - Twilio for SMS
      // - Firebase Cloud Messaging for push

      // For now, mark as sent
      message.status = MessageStatus.SENT
      await message.save()

      // Update delivery statuses to sent
      await DeliveryStatusModel.updateMany(
        { messageId: message._id },
        { status: DeliveryStatusEnum.SENT, sentAt: new Date() }
      )
    } catch (error) {
      message.status = MessageStatus.FAILED
      await message.save()
      throw error
    }
  }

  /**
   * Get recipient IDs based on audience filter
   * ACAD-013: Filter by class, grade, role
   */
  private async getRecipientIds(message: IMessage, schoolId: string): Promise<string[]> {
    const { type, classIds, gradeIds, roles, userIds } = message.audience

    // TODO: Query user service to get actual recipients based on filters
    // For now, return the specified userIds or empty array
    if (type === AudienceType.CUSTOM && userIds) {
      return userIds
    }

    // Placeholder for more complex audience resolution
    return userIds || []
  }

  /**
   * COMM-002: Get all message templates
   */
  async getTemplates(schoolId: string, isActive?: boolean) {
    const query: any = { school_id: schoolId }
    if (isActive !== undefined) {
      query.isActive = isActive
    }

    return MessageTemplateModel.find(query).sort({ createdAt: -1 }).lean()
  }

  /**
   * COMM-002: Create a reusable template
   */
  async createTemplate(
    schoolId: string,
    data: {
      name: string
      description?: string
      title: string
      body: string
      channels: NotificationChannel[]
      variables?: string[]
    },
    userId: string
  ) {
    const template = await MessageTemplateModel.create({
      school_id: schoolId,
      ...data,
      createdBy: userId,
      isActive: true,
    })

    return template
  }

  /**
   * COMM-004: Get delivery status for a message
   */
  async getDeliveryStatus(messageId: string, schoolId: string) {
    return DeliveryStatusModel.find({
      messageId,
      school_id: schoolId,
    })
      .sort({ createdAt: -1 })
      .lean()
  }

  /**
   * COMM-004: Get delivery stats per message
   */
  async getDeliveryStats(messageId: string, schoolId: string) {
    const stats = await DeliveryStatusModel.aggregate([
      { $match: { messageId, school_id: schoolId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    return stats
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(recipientId: string, messageId: string, schoolId: string) {
    return DeliveryStatusModel.findOneAndUpdate(
      {
        recipientId,
        messageId,
        school_id: schoolId,
      },
      {
        status: DeliveryStatusEnum.READ,
        readAt: new Date(),
      },
      { new: true }
    )
  }

  /**
   * Get all notifications for a recipient
   */
  async getNotificationsForRecipient(recipientId: string, schoolId: string, limit = 20) {
    const deliveries = await DeliveryStatusModel.find({
      recipientId,
      school_id: schoolId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    // Get associated messages
    const messageIds = [...new Set(deliveries.map((d) => d.messageId))]
    const messages = await MessageModel.find({
      _id: { $in: messageIds },
      school_id: schoolId,
    }).lean()

    return deliveries.map((delivery) => ({
      delivery,
      message: messages.find((m) => m._id?.toString() === delivery.messageId),
    }))
  }

  /**
   * Publish a message (mark as sent immediately)
   */
  async publishMessage(messageId: string, schoolId: string) {
    const message = await MessageModel.findOne({
      _id: messageId,
      school_id: schoolId,
    })

    if (!message) {
      throw new Error('Message not found')
    }

    if (message.status !== MessageStatus.DRAFT && message.status !== MessageStatus.SCHEDULED) {
      throw new Error('Only draft or scheduled messages can be published')
    }

    message.sendAt = new Date()
    message.status = MessageStatus.SENDING
    await message.save()

    // Send it
    await this.sendMessage(messageId, schoolId)

    return message
  }
}

export const notificationService = new NotificationService()
