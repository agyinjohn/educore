import { EmergencyBroadcastModel } from '../models/EmergencyBroadcast'
import { DeliveryStatusModel } from '../models/DeliveryStatus'
import { BroadcastType, IEmergencyBroadcast, DeliveryStatus, NotificationChannel } from '../types'

/**
 * Phase 4 — Emergency Broadcast Service
 * COMM-005: Emergency broadcast channel with mandatory read receipt
 */

export class EmergencyBroadcastService {
  /**
   * COMM-005: Send emergency broadcast
   * Only SCHOOL_ADMIN can send these
   */
  async sendEmergencyBroadcast(
    schoolId: string,
    data: {
      title: string
      body: string
      priority: BroadcastType
      channels: NotificationChannel[]
    },
    userId: string
  ): Promise<IEmergencyBroadcast> {
    const broadcast = await EmergencyBroadcastModel.create({
      school_id: schoolId,
      title: data.title,
      body: data.body,
      priority: data.priority || BroadcastType.EMERGENCY,
      channels: data.channels,
      requiresReadReceipt: true,
      createdBy: userId,
    })

    // TODO: Send to all parents/staff immediately via push notification
    // Create delivery records with requiresReadReceipt = true
    // If not read within 1 hour, send SMS/email reminder

    return broadcast
  }

  /**
   * COMM-005: Get emergency broadcast history
   */
  async getEmergencyBroadcasts(schoolId: string, limit = 20) {
    return EmergencyBroadcastModel.find({ school_id: schoolId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * COMM-005: Confirm read receipt for emergency broadcast
   */
  async confirmReadReceipt(broadcastId: string, schoolId: string, userId: string) {
    const broadcast = await EmergencyBroadcastModel.findOne({
      _id: broadcastId,
      school_id: schoolId,
    })

    if (!broadcast) {
      throw new Error('Broadcast not found')
    }

    // Add user to confirmedReadBy array
    if (!broadcast.confirmedReadBy) {
      broadcast.confirmedReadBy = []
    }

    if (!broadcast.confirmedReadBy.includes(userId)) {
      broadcast.confirmedReadBy.push(userId)
      await broadcast.save()
    }

    return broadcast
  }

  /**
   * Get unconfirmed read receipts
   */
  async getUnconfirmedReceipts(broadcastId: string, schoolId: string) {
    const broadcast = await EmergencyBroadcastModel.findOne({
      _id: broadcastId,
      school_id: schoolId,
    })

    if (!broadcast) {
      throw new Error('Broadcast not found')
    }

    const confirmedCount = broadcast.confirmedReadBy?.length || 0

    // TODO: Get total recipient count from user service
    const totalRecipients = 0

    return {
      broadcastId,
      confirmed: confirmedCount,
      pending: totalRecipients - confirmedCount,
      confirmedBy: broadcast.confirmedReadBy || [],
    }
  }
}

export const emergencyBroadcastService = new EmergencyBroadcastService()
