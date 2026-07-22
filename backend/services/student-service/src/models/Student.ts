import { Schema, model, Document } from 'mongoose'

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  GRADUATED = 'graduated',
  WITHDRAWN = 'withdrawn',
}

export interface IGuardian {
  name: string
  relationship: string
  phone?: string
  email?: string
}

export interface IStudent extends Document {
  school_id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth: Date
  gender?: string
  class_id?: string
  admissionNumber?: string
  enrolmentDate: Date
  status: StudentStatus
  guardians: IGuardian[]
  address?: string
  city?: string
  state?: string
  postalCode?: string
  medicalInfo?: string
  photo?: string
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const GuardianSchema = new Schema<IGuardian>(
  {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String },
    email: { type: String, lowercase: true },
  },
  { _id: true }
)

const StudentSchema = new Schema<IStudent>(
  {
    school_id: { type: String, required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, sparse: true },
    phone: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['M', 'F', 'Other'] },
    class_id: { type: String, index: true },
    admissionNumber: { type: String, unique: true, sparse: true },
    enrolmentDate: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: Object.values(StudentStatus),
      default: StudentStatus.ACTIVE,
      index: true,
    },
    guardians: [GuardianSchema],
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    medicalInfo: { type: String },
    photo: { type: String },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// Compound index for efficient filtering
StudentSchema.index({ school_id: 1, status: 1 })
StudentSchema.index({ school_id: 1, class_id: 1 })
StudentSchema.index({ admissionNumber: 1, school_id: 1 })

export const Student = model<IStudent>('Student', StudentSchema)
