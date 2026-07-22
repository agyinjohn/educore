import { Schema, model, Document, Types } from 'mongoose'

export interface ILoginAuditLog extends Document {
  userId: Types.ObjectId
  ipAddress: string
  userAgent: string
  success: boolean
  createdAt: Date
}

const LoginAuditLogSchema = new Schema<ILoginAuditLog>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    success:   { type: Boolean, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const LoginAuditLog = model<ILoginAuditLog>('LoginAuditLog', LoginAuditLogSchema)
