import { Schema, model, Document, Types } from 'mongoose'
import { Role } from '@educore/shared'

export interface IUser extends Document {
  _id: Types.ObjectId
  schoolId?: string
  email: string
  passwordHash: string
  role: Role
  mfaEnabled: boolean
  mfaSecret?: string
  loginAttempts: number
  lockedUntil?: Date
  isActive: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    schoolId:      { type: String, index: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:  { type: String, required: true },
    role:          { type: String, enum: Object.values(Role), required: true },
    mfaEnabled:    { type: Boolean, default: false },
    mfaSecret:     { type: String },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil:   { type: Date },
    isActive:      { type: Boolean, default: true },
    deletedAt:     { type: Date },
  },
  { timestamps: true }
)

UserSchema.index({ email: 1 })
UserSchema.index({ schoolId: 1 })

export const User = model<IUser>('User', UserSchema)
