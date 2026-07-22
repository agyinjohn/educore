import mongoose, { Schema, Document } from 'mongoose'
import { IMessageTemplate, NotificationChannel } from '../types'

interface IMessageTemplateDoc extends IMessageTemplate, Document {}

const messageTemplateSchema = new Schema<IMessageTemplateDoc>(
  {
    school_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: String,
    title: { type: String, required: true },
    body: { type: String, required: true },
    channels: {
      type: [String],
      enum: Object.values(NotificationChannel),
      required: true,
    },
    variables: [String],
    createdBy: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

messageTemplateSchema.index({ school_id: 1, isActive: 1 })
messageTemplateSchema.index({ school_id: 1, createdAt: -1 })

export const MessageTemplateModel = mongoose.model<IMessageTemplateDoc>(
  'MessageTemplate',
  messageTemplateSchema
)
