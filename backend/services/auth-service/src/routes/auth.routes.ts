import { Router } from 'express'
import * as controller from '../controllers/auth.controller'
import { validate } from '../middleware/validate'
import { authenticate, requireRole } from '../middleware/authenticate'
import { Role } from '@educore/shared'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateUserSchema,
} from '../types/schemas'

const router = Router()

router.post('/register', validate(registerSchema), controller.register)
router.post('/login', validate(loginSchema), controller.login)
router.post('/refresh', controller.refresh)
router.post('/logout', controller.logout)
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword)
router.post('/change-password', validate(changePasswordSchema), controller.changePassword)
router.post('/mfa/setup', controller.setupMfa)
router.post('/mfa/verify', controller.verifyMfa)

// User management — school-scoped, admin only
router.get(
  '/users',
  authenticate,
  requireRole(Role.SCHOOL_OWNER, Role.SCHOOL_ADMIN),
  controller.listUsers
)
router.patch(
  '/users/:id',
  authenticate,
  requireRole(Role.SCHOOL_OWNER, Role.SCHOOL_ADMIN),
  validate(updateUserSchema),
  controller.updateUser
)

export default router
