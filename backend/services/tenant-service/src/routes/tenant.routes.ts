import { Router } from 'express'
import * as controller from '../controllers/tenant.controller'
import { validate } from '../middleware/validate'
import { authorize, requireRole } from '../middleware/authorize'
import { Role, Resource, Action } from '@educore/shared'
import {
  createSchoolSchema,
  updateSchoolSchema,
  academicYearSchema,
  campusSchema,
  suspendTenantSchema,
} from '../types/schemas'

const router = Router()

// Super Admin — list all schools
router.get('/', requireRole(Role.SUPER_ADMIN), controller.listSchools)

// Public — resolve school by subdomain (used by frontend on load)
router.get('/subdomain/:subdomain', controller.getSchoolBySubdomain)

// Get school by ID
router.get('/:id', authorize(Resource.TENANT, Action.VIEW), controller.getSchool)

// Create school — School Owner or Super Admin
router.post(
  '/',
  requireRole(Role.SUPER_ADMIN, Role.SCHOOL_OWNER),
  validate(createSchoolSchema),
  controller.createSchool
)

// Update school config
router.patch(
  '/:id',
  authorize(Resource.TENANT, Action.EDIT),
  validate(updateSchoolSchema),
  controller.updateSchool
)

// Add academic year
router.post(
  '/:id/academic-years',
  requireRole(Role.SUPER_ADMIN, Role.SCHOOL_OWNER, Role.SCHOOL_ADMIN),
  validate(academicYearSchema),
  controller.addAcademicYear
)

// Add campus
router.post(
  '/:id/campuses',
  requireRole(Role.SUPER_ADMIN, Role.SCHOOL_OWNER, Role.SCHOOL_ADMIN),
  validate(campusSchema),
  controller.addCampus
)

// Suspend school — Super Admin only
router.patch(
  '/:id/suspend',
  requireRole(Role.SUPER_ADMIN),
  validate(suspendTenantSchema),
  controller.suspendSchool
)

// Delete school — Super Admin only
router.delete('/:id', requireRole(Role.SUPER_ADMIN), controller.deleteSchool)

export default router
