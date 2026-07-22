import { z } from 'zod'

export const createSchoolSchema = z.object({
  name:          z.string().min(2).max(100).trim(),
  subdomain:     z.string().min(2).max(50).toLowerCase().trim()
                   .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  country:       z.string().length(2).default('GH'),
  timezone:      z.string().default('Africa/Accra'),
  currency:      z.string().length(3).default('GHS'),
  address:       z.string().optional(),
  phone:         z.string().optional(),
  email:         z.string().email().optional(),
  website:       z.string().url().optional(),
  primaryColor:  z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#2563EB'),
  gradingScale:  z.enum(['percentage', 'gpa', 'letter', 'custom']).default('percentage'),
  termStructure: z.enum(['trimester', 'semester', 'quarter']).default('trimester'),
})

export const updateSchoolSchema = createSchoolSchema.partial().omit({ subdomain: true })

export const academicYearSchema = z.object({
  year:      z.string().regex(/^\d{4}\/\d{4}$/, 'Format must be YYYY/YYYY'),
  startDate: z.string().datetime(),
  endDate:   z.string().datetime(),
  terms: z.array(z.object({
    name:      z.string().min(1),
    startDate: z.string().datetime(),
    endDate:   z.string().datetime(),
  })).min(1),
})

export const campusSchema = z.object({
  name:    z.string().min(2).trim(),
  address: z.string().min(5).trim(),
  phone:   z.string().optional(),
})

export const suspendTenantSchema = z.object({
  reason: z.string().min(5).max(500),
})
