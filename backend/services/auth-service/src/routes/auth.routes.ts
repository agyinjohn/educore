import { Router } from 'express'
import * as controller from '../controllers/auth.controller'
import { validate } from '../middleware/validate'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
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

export default router
