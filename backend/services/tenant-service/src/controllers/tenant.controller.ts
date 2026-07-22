import { Request, Response } from 'express'
import * as tenantService from '../services/tenant.service'
import { eventBus } from '../config/eventBus'

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  SUBDOMAIN_TAKEN: { status: 409, message: 'Subdomain already in use' },
  SCHOOL_NOT_FOUND: { status: 404, message: 'School not found' },
}

function handleError(res: Response, err: unknown): void {
  const message = err instanceof Error ? err.message : 'UNKNOWN'
  const mapped = ERROR_MAP[message]
  if (mapped) {
    res.status(mapped.status).json({ success: false, message: mapped.message })
  } else {
    console.error('[TenantController]', err)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function createSchool(req: Request, res: Response): Promise<void> {
  try {
    const ownerId = req.headers['x-user-id'] as string
    const school = await tenantService.createSchool({ ...req.body, ownerId }, eventBus)
    res.status(201).json({ success: true, data: school })
  } catch (err) { handleError(res, err) }
}

export async function getSchool(req: Request, res: Response): Promise<void> {
  try {
    const school = await tenantService.getSchoolById(req.params.id)
    res.json({ success: true, data: school })
  } catch (err) { handleError(res, err) }
}

export async function getSchoolBySubdomain(req: Request, res: Response): Promise<void> {
  try {
    const school = await tenantService.getSchoolBySubdomain(req.params.subdomain)
    res.json({ success: true, data: school })
  } catch (err) { handleError(res, err) }
}

export async function updateSchool(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.params.id || req.headers['x-school-id'] as string
    const school = await tenantService.updateSchool(schoolId, req.body)
    res.json({ success: true, data: school })
  } catch (err) { handleError(res, err) }
}

export async function addAcademicYear(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.params.id || req.headers['x-school-id'] as string
    const school = await tenantService.addAcademicYear(schoolId, req.body)
    res.json({ success: true, data: school })
  } catch (err) { handleError(res, err) }
}

export async function addCampus(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = req.params.id || req.headers['x-school-id'] as string
    const school = await tenantService.addCampus(schoolId, req.body)
    res.json({ success: true, data: school })
  } catch (err) { handleError(res, err) }
}

export async function suspendSchool(req: Request, res: Response): Promise<void> {
  try {
    const school = await tenantService.suspendSchool(req.params.id, eventBus)
    res.json({ success: true, data: school })
  } catch (err) { handleError(res, err) }
}

export async function deleteSchool(req: Request, res: Response): Promise<void> {
  try {
    await tenantService.deleteSchool(req.params.id)
    res.json({ success: true, message: 'School deleted' })
  } catch (err) { handleError(res, err) }
}

export async function listSchools(req: Request, res: Response): Promise<void> {
  try {
    const { status, page, limit } = req.query
    const result = await tenantService.listSchools({
      status: status as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    })
    res.json({ success: true, ...result })
  } catch (err) { handleError(res, err) }
}
