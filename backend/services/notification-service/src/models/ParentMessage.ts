import mongoose, { Schema } from 'mongoose'
import { IParentMessage } from '../types'

const parentMessageSchema = new Schema<IParentMessage>(
  {
    school_id: { type: String, required: true, index: true },
    threadId: { type: String, required: true, index: true },
    parentId: { type: String, required: true },
    teacherId: { type: String, required: true },
    studentId: { type: String, required: true },
    senderRole: {
      type: String,
      enum: ['parent', 'teacher', 'admin'],
      required: true,
    },
    message: { type: String, required: true },
    attachments: [String],
    isModerated: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
)

parentMessageSchema.index({ school_id: 1, threadId: 1, createdAt: -1 })
parentMessageSchema.index({ school_id: 1, parentId: 1 })
parentMessageSchema.index({ school_id: 1, teacherId: 1 })

export const ParentMessageModel = mongoose.model<IParentMessage>(
  'ParentMessage',
  parentMessageSchema
)
