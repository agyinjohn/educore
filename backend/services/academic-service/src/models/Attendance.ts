import { Schema, model, Document } from 'mongoose'

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export interface IAttendance extends Document {
  school_id: string
  student_id: string
  class_id: string
  subject_id?: string
  date: Date
  period: number
  status: AttendanceStatus
  note?: string
  recordedBy?: string
  recordedAt: Date
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    school_id: { type: String, required: true, index: true },
    student_id: { type: String, required: true, index: true },
    class_id: { type: String, required: true, index: true },
    subject_id: { type: String },
    date: { type: Date, required: true, index: true },
    period: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
    },
    note: { type: String },
    recordedBy: { type: String },
    recordedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// Compound index to prevent duplicate attendance records
AttendanceSchema.index({ school_id: 1, student_id: 1, class_id: 1, date: 1, period: 1 }, { unique: true, sparse: true })
AttendanceSchema.index({ school_id: 1, class_id: 1, date: 1 })
AttendanceSchema.index({ student_id: 1, date: 1 })

export const Attendance = model<IAttendance>('Attendance', AttendanceSchema)
