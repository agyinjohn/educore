import mongoose, { Schema, Document } from 'mongoose'
import { IMessage, MessageStatus, NotificationChannel, AudienceType } from '../types'

interface IMessageDoc extends IMessage, Document {}

const messageSchema = new Schema<IMessageDoc>(
  {
    school_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    channels: {
      type: [String],
      enum: Object.values(NotificationChannel),
      required: true,
    },
    audience: {
      type: {
        type: String,
        enum: Object.values(AudienceType),
        required: true,
      },
      classIds: [String],
      gradeIds: [String],
      roles: [String],
      userIds: [String],
    },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.DRAFT,
    },
    scheduledFor: Date,
    sendAt: Date,
    templateId: String,
    createdBy: { type: String, required: true },
    tags: [String],
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
)

// Indexes for efficient querying
messageSchema.index({ school_id: 1, status: 1 })
messageSchema.index({ school_id: 1, createdAt: -1 })
messageSchema.index({ school_id: 1, sendAt: 1 })

export const MessageModel = mongoose.model<IMessageDoc>('Message', messageSchema)
