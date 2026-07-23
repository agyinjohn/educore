import mongoose, { Schema } from 'mongoose'
import { IEmergencyBroadcast, BroadcastType, NotificationChannel } from '../types'

const emergencyBroadcastSchema = new Schema<IEmergencyBroadcast>(
  {
    school_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    priority: {
      type: String,
      enum: Object.values(BroadcastType),
      default: BroadcastType.EMERGENCY,
    },
    channels: {
      type: [String],
      enum: Object.values(NotificationChannel),
      required: true,
    },
    requiresReadReceipt: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    confirmedReadBy: [String],
  },
  { timestamps: true }
)

emergencyBroadcastSchema.index({ school_id: 1, priority: 1, createdAt: -1 })

export const EmergencyBroadcastModel = mongoose.model<IEmergencyBroadcast>(
  'EmergencyBroadcast',
  emergencyBroadcastSchema
)
