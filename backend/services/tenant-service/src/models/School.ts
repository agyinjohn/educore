import { Schema, model, Document } from 'mongoose'

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise'
export type TenantStatus = 'active' | 'suspended' | 'deleted'
export type GradingScale = 'percentage' | 'gpa' | 'letter' | 'custom'
export type TermStructure = 'trimester' | 'semester' | 'quarter'

export interface ICampus {
  name: string
  address: string
  phone?: string
}

export interface IAcademicYear {
  year: string
  startDate: Date
  endDate: Date
  terms: { name: string; startDate: Date; endDate: Date }[]
  isCurrent: boolean
}

export interface ISchool extends Document {
  name: string
  subdomain: string
  customDomain?: string
  logo?: string
  primaryColor: string
  subscriptionTier: SubscriptionTier
  status: TenantStatus
  ownerId: string
  gradingScale: GradingScale
  termStructure: TermStructure
  academicYears: IAcademicYear[]
  campuses: ICampus[]
  activeModules: string[]
  address?: string
  phone?: string
  email?: string
  website?: string
  country: string
  timezone: string
  currency: string
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const CampusSchema = new Schema<ICampus>({
  name:    { type: String, required: true },
  address: { type: String, required: true },
  phone:   { type: String },
}, { _id: true })

const AcademicYearSchema = new Schema<IAcademicYear>({
  year:      { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  terms: [{
    name:      { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
  }],
  isCurrent: { type: Boolean, default: false },
}, { _id: true })

const SchoolSchema = new Schema<ISchool>(
  {
    name:             { type: String, required: true, trim: true },
    subdomain:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    customDomain:     { type: String, lowercase: true, trim: true },
    logo:             { type: String },
    primaryColor:     { type: String, default: '#2563EB' },
    subscriptionTier: { type: String, enum: ['free', 'basic', 'pro', 'enterprise'], default: 'free' },
    status:           { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
    ownerId:          { type: String, required: true, index: true },
    gradingScale:     { type: String, enum: ['percentage', 'gpa', 'letter', 'custom'], default: 'percentage' },
    termStructure:    { type: String, enum: ['trimester', 'semester', 'quarter'], default: 'trimester' },
    academicYears:    [AcademicYearSchema],
    campuses:         [CampusSchema],
    activeModules:    { type: [String], default: ['students', 'academic', 'finance', 'communication'] },
    address:          { type: String },
    phone:            { type: String },
    email:            { type: String, lowercase: true },
    website:          { type: String },
    country:          { type: String, required: true, default: 'GH' },
    timezone:         { type: String, default: 'Africa/Accra' },
    currency:         { type: String, default: 'GHS' },
    deletedAt:        { type: Date },
  },
  { timestamps: true }
)

SchoolSchema.index({ subdomain: 1 })
SchoolSchema.index({ status: 1 })
SchoolSchema.index({ ownerId: 1 })

export const School = model<ISchool>('School', SchoolSchema)
