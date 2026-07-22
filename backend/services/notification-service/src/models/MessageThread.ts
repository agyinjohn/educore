import mongoose, { Schema, Document } from 'mongoose'
import { IMessageThread } from '../types'

interface IMessageThreadDoc extends IMessageThread, Document {}

const messageThreadSchema = new Schema<IMessageThreadDoc>(
  {
    school_id: { type: String, required: true, index: true },
    parentId: { type: String, required: true },
    teacherId: { type: String, required: true },
    studentId: { type: String, required: true },
    subject: String,
    isActive: { type: Boolean, default: true },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

messageThreadSchema.index({ school_id: 1, parentId: 1, isActive: 1 })
messageThreadSchema.index({ school_id: 1, teacherId: 1, isActive: 1 })
messageThreadSchema.index({ school_id: 1, lastMessageAt: -1 })

export const MessageThreadModel = mongoose.model<IMessageThreadDoc>(
  'MessageThread',
  messageThreadSchema
)
