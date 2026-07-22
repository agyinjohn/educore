import { Router } from 'express'
import * as controller from '../controllers/student.controller'
import { authenticate, authorize, tenantIsolation } from '../middleware/authenticate'
import { validate } from '../middleware/validate'
import {
  createStudentSchema,
  updateStudentSchema,
  listStudentsSchema,
} from '../types/schemas'

const router = Router()

// All routes require authentication and tenant isolation
router.use(authenticate)
router.use(tenantIsolation)

// Students CRUD
router.post(
  '/',
  authorize(['SCHOOL_ADMIN', 'TEACHER']),
  validate(createStudentSchema),
  controller.createStudent
)

router.get(
  '/',
  validate(listStudentsSchema),
  controller.listStudents
)

router.get('/:id', controller.getStudent)

router.put(
  '/:id',
  authorize(['SCHOOL_ADMIN']),
  validate(updateStudentSchema),
  controller.updateStudent
)

router.delete(
  '/:id',
  authorize(['SCHOOL_ADMIN']),
  controller.deleteStudent
)

// Bulk import
router.post(
  '/import/bulk',
  authorize(['SCHOOL_ADMIN']),
  controller.bulkImportStudents
)

export default router
