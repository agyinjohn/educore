import { z } from 'zod'

// Student Schemas
export const createStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    dateOfBirth: z.coerce.date(),
    gender: z.enum(['M', 'F', 'Other']).optional(),
    admissionNumber: z.string().optional(),
    guardians: z.array(
      z.object({
        name: z.string(),
        relationship: z.string(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      })
    ).optional(),
  }),
})

export const updateStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    class_id: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended', 'graduated', 'withdrawn']).optional(),
  }),
})

export const listStudentsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().optional(),
    class_id: z.string().optional(),
    status: z.string().optional(),
  }),
})
