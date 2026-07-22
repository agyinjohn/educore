import { Schema, model, Document } from 'mongoose'

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export interface ITimetableSlot extends Document {
  school_id: string
  class_id: string
  subject_id: string
  teacher_id?: string
  room_id?: string
  dayOfWeek: DayOfWeek
  period: number
  startTime: string
  endTime: string
  academicYear: string
  term: string
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TimetableSlotSchema = new Schema<ITimetableSlot>(
  {
    school_id: { type: String, required: true, index: true },
    class_id: { type: String, required: true, index: true },
    subject_id: { type: String, required: true },
    teacher_id: { type: String },
    room_id: { type: String },
    dayOfWeek: {
      type: String,
      enum: Object.values(DayOfWeek),
      required: true,
    },
    period: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    academicYear: { type: String, required: true },
    term: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// Prevent double-booking for teacher/room
TimetableSlotSchema.index({ teacher_id: 1, dayOfWeek: 1, period: 1, academicYear: 1, term: 1 })
TimetableSlotSchema.index({ room_id: 1, dayOfWeek: 1, period: 1, academicYear: 1, term: 1 })
TimetableSlotSchema.index({ class_id: 1, academicYear: 1, term: 1 })

export const TimetableSlot = model<ITimetableSlot>('TimetableSlot', TimetableSlotSchema)
