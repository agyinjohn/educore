import { z } from 'zod'

// Class Schemas
export const createClassSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    section: z.string().optional(),
    academicYear: z.string().min(1),
    teacher_id: z.string().optional(),
    capacity: z.number().int().optional(),
    gradeLevel: z.string().optional(),
  }),
})

export const updateClassSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    teacher_id: z.string().optional(),
    capacity: z.number().int().optional(),
  }),
})

// Attendance Schemas
export const markAttendanceSchema = z.object({
  body: z.object({
    student_id: z.string(),
    class_id: z.string(),
    subject_id: z.string().optional(),
    date: z.coerce.date(),
    period: z.number().int(),
    status: z.enum(['present', 'absent', 'late', 'excused']),
    note: z.string().optional(),
  }),
})

// Grade Schemas
export const recordGradeSchema = z.object({
  body: z.object({
    student_id: z.string(),
    subject_id: z.string(),
    assessment_id: z.string().optional(),
    score: z.number().min(0),
    maxScore: z.number().optional(),
    term: z.string(),
    feedback: z.string().optional(),
  }),
})

export const publishGradesSchema = z.object({
  body: z.object({
    term: z.string(),
    academicYear: z.string(),
  }),
})
