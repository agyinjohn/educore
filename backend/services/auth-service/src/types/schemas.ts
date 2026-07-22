import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a digit')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character')

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().length(6).optional(),
})

export const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: passwordSchema,
  role: z.enum([
    'SUPER_ADMIN', 'SCHOOL_OWNER', 'SCHOOL_ADMIN', 'ACADEMIC_HEAD',
    'TEACHER', 'ACCOUNTANT', 'HR_MANAGER', 'LIBRARIAN',
    'TRANSPORT_COORDINATOR', 'STUDENT', 'PARENT', 'WARDEN',
  ]),
  schoolId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid school ID').optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
})
