import { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { Role } from '@educore/shared'

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  EMAIL_TAKEN: { status: 409, message: 'Email already in use' },
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid email or password' },
  ACCOUNT_LOCKED: { status: 423, message: 'Account locked. Try again later' },
  ACCOUNT_INACTIVE: { status: 403, message: 'Account is inactive' },
  MFA_REQUIRED: { status: 401, message: 'MFA code required' },
  INVALID_MFA_CODE: { status: 401, message: 'Invalid MFA code' },
  INVALID_REFRESH_TOKEN: { status: 401, message: 'Invalid or expired refresh token' },
  INVALID_OR_EXPIRED_TOKEN: { status: 400, message: 'Invalid or expired reset token' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
}

function handleError(res: Response, err: unknown): void {
  const message = err instanceof Error ? err.message : 'UNKNOWN'
  const mapped = ERROR_MAP[message]
  if (mapped) {
    res.status(mapped.status).json({ success: false, message: mapped.message })
  } else {
    console.error('[AuthController]', err)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const user = await authService.register(req.body)
    res.status(201).json({ success: true, data: user })
  } catch (err) {
    handleError(res, err)
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || ''
    const ua = req.headers['user-agent'] || ''
    const { accessToken, refreshToken, user } = await authService.login(
      req.body.email,
      req.body.password,
      req.body.totpCode,
      ip,
      ua
    )

    // Refresh token in HTTP-only cookie (AUTH-004)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({ success: true, data: { accessToken, user } })
  } catch (err) {
    handleError(res, err)
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken
    if (!rawToken) {
      res.status(401).json({ success: false, message: 'Refresh token missing' })
      return
    }
    const tokens = await authService.refreshAccessToken(rawToken)

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({ success: true, data: { accessToken: tokens.accessToken } })
  } catch (err) {
    handleError(res, err)
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken
    const accessToken = req.headers.authorization?.slice(7)
    if (rawToken) await authService.logout(rawToken, accessToken)
    res.clearCookie('refreshToken')
    res.json({ success: true, message: 'Logged out' })
  } catch (err) {
    handleError(res, err)
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.headers['x-user-id'] as string
    const accessToken = req.headers.authorization?.slice(7) ?? ''
    await authService.changePassword(userId, req.body.currentPassword, req.body.newPassword, accessToken)
    res.json({ success: true, message: 'Password changed successfully' })
  } catch (err) {
    handleError(res, err)
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const token = await authService.forgotPassword(req.body.email)
    // Always return 200 to prevent user enumeration
    res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent',
      ...(token ? { debug_token: token } : {}),
    })
  } catch (err) {
    handleError(res, err)
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    await authService.resetPassword(req.body.token, req.body.password)
    res.json({ success: true, message: 'Password reset successful' })
  } catch (err) {
    handleError(res, err)
  }
}

export async function setupMfa(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.headers['x-user-id'] as string
    const result = await authService.setupMfa(userId)
    res.json({ success: true, data: result })
  } catch (err) {
    handleError(res, err)
  }
}

export async function verifyMfa(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.headers['x-user-id'] as string
    await authService.verifyAndEnableMfa(userId, req.body.secret, req.body.totpCode)
    res.json({ success: true, message: 'MFA enabled' })
  } catch (err) {
    handleError(res, err)
  }
}

// ─── User Management (requires authenticate + requireRole middleware) ──────────
export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = (req as any).user?.schoolId
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'No school associated with this account' })
      return
    }
    const users = await authService.listUsers(schoolId)
    res.json({ success: true, data: users })
  } catch (err) {
    handleError(res, err)
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = (req as any).user?.schoolId
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'No school associated with this account' })
      return
    }
    const user = await authService.updateUserRoleOrStatus(schoolId, req.params.id, {
      role: req.body.role,
      isActive: req.body.isActive,
    })
    res.json({ success: true, data: user })
  } catch (err) {
    handleError(res, err)
  }
}
