import mongoose, { Schema } from 'mongoose'
import { IDeliveryStatus, DeliveryStatus, NotificationChannel } from '../types'

const deliveryStatusSchema = new Schema<IDeliveryStatus>(
  {
    school_id: { type: String, required: true, index: true },
    messageId: { type: String, required: true, index: true },
    recipientId: { type: String, required: true },
    recipientEmail: String,
    recipientPhone: String,
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DeliveryStatus),
      default: DeliveryStatus.PENDING,
    },
    externalId: String, // Twilio SID, SendGrid message ID, etc.
    attempts: { type: Number, default: 0 },
    error: String,
    readAt: Date,
    deliveredAt: Date,
    sentAt: Date,
  },
  { timestamps: true }
)

deliveryStatusSchema.index({ school_id: 1, messageId: 1, status: 1 })
deliveryStatusSchema.index({ school_id: 1, recipientId: 1, createdAt: -1 })
deliveryStatusSchema.index({ school_id: 1, status: 1 })

export const DeliveryStatusModel = mongoose.model<IDeliveryStatus>(
  'DeliveryStatus',
  deliveryStatusSchema
)
