import { School } from '../models/School'
import { EventBus, ServiceEvent } from '@educore/shared'

// ─── Provision new school (TENANT-001) ────────────────────────────────────────
export async function createSchool(data: {
  name: string
  subdomain: string
  ownerId: string
  country: string
  timezone: string
  currency: string
  primaryColor: string
  gradingScale: 'percentage' | 'gpa' | 'letter' | 'custom'
  termStructure: 'trimester' | 'semester' | 'quarter'
  address?: string
  phone?: string
  email?: string
  website?: string
}, eventBus: EventBus) {
  const existing = await School.findOne({ subdomain: data.subdomain })
  if (existing) throw new Error('SUBDOMAIN_TAKEN')

  const school = await School.create(data)

  await eventBus.publish(
    ServiceEvent.TENANT_CREATED,
    { schoolId: school._id.toString(), name: school.name, subdomain: school.subdomain, ownerId: school.ownerId },
    'tenant-service'
  )

  return school
}

// ─── Get school by ID ─────────────────────────────────────────────────────────
export async function getSchoolById(schoolId: string) {
  const school = await School.findOne({ _id: schoolId, deletedAt: null })
  if (!school) throw new Error('SCHOOL_NOT_FOUND')
  return school
}

// ─── Get school by subdomain (TENANT-002) ─────────────────────────────────────
export async function getSchoolBySubdomain(subdomain: string) {
  const school = await School.findOne({ subdomain, deletedAt: null, status: 'active' })
  if (!school) throw new Error('SCHOOL_NOT_FOUND')
  return school
}

// ─── Update school config (TENANT-010 to TENANT-015) ─────────────────────────
export async function updateSchool(schoolId: string, data: Partial<{
  name: string
  logo: string
  primaryColor: string
  address: string
  phone: string
  email: string
  website: string
  gradingScale: string
  termStructure: string
  activeModules: string[]
}>) {
  const school = await School.findOneAndUpdate(
    { _id: schoolId, deletedAt: null },
    { $set: data },
    { new: true }
  )
  if (!school) throw new Error('SCHOOL_NOT_FOUND')
  return school
}

// ─── Add academic year (TENANT-010) ──────────────────────────────────────────
export async function addAcademicYear(schoolId: string, data: {
  year: string
  startDate: string
  endDate: string
  terms: { name: string; startDate: string; endDate: string }[]
}) {
  // Mark all existing years as not current
  await School.updateOne(
    { _id: schoolId },
    { $set: { 'academicYears.$[].isCurrent': false } }
  )

  const school = await School.findOneAndUpdate(
    { _id: schoolId, deletedAt: null },
    { $push: { academicYears: { ...data, isCurrent: true } } },
    { new: true }
  )
  if (!school) throw new Error('SCHOOL_NOT_FOUND')
  return school
}

// ─── Add campus (TENANT-015) ──────────────────────────────────────────────────
export async function addCampus(schoolId: string, data: { name: string; address: string; phone?: string }) {
  const school = await School.findOneAndUpdate(
    { _id: schoolId, deletedAt: null },
    { $push: { campuses: data } },
    { new: true }
  )
  if (!school) throw new Error('SCHOOL_NOT_FOUND')
  return school
}

// ─── Suspend tenant (TENANT-004) — Super Admin only ──────────────────────────
export async function suspendSchool(schoolId: string, eventBus: EventBus) {
  const school = await School.findOneAndUpdate(
    { _id: schoolId, deletedAt: null },
    { status: 'suspended' },
    { new: true }
  )
  if (!school) throw new Error('SCHOOL_NOT_FOUND')

  await eventBus.publish(
    ServiceEvent.TENANT_SUSPENDED,
    { schoolId: school._id.toString(), name: school.name },
    'tenant-service'
  )

  return school
}

// ─── Soft delete tenant (TENANT-004) — 90-day retention ──────────────────────
export async function deleteSchool(schoolId: string) {
  const school = await School.findOneAndUpdate(
    { _id: schoolId, deletedAt: null },
    { status: 'deleted', deletedAt: new Date() },
    { new: true }
  )
  if (!school) throw new Error('SCHOOL_NOT_FOUND')
  return school
}

// ─── List all tenants (TENANT-006) — Super Admin only ────────────────────────
export async function listSchools(filters: { status?: string; page?: number; limit?: number }) {
  const { status, page = 1, limit = 20 } = filters
  const query: Record<string, unknown> = { deletedAt: null }
  if (status) query.status = status

  const [schools, total] = await Promise.all([
    School.find(query).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
    School.countDocuments(query),
  ])

  return { schools, total, page, limit }
}
