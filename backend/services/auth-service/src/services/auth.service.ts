import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import { config } from '../config'
import { User } from '../models/User'
import { RefreshToken } from '../models/RefreshToken'
import { LoginAuditLog } from '../models/LoginAuditLog'
import { PasswordResetToken } from '../models/PasswordResetToken'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateSecureToken,
  getRefreshTokenExpiry,
} from '../utils/token'
import { Role, ServiceEvent } from '@educore/shared'
import { eventBus } from '../config/eventBus'
import { blacklistToken } from '../utils/blacklist'

const BCRYPT_ROUNDS = 12 // AUTH-001

// ─── Register ─────────────────────────────────────────────────────────────────
export async function register(data: {
  email: string
  password: string
  role: Role
  schoolId?: string
}) {
  const existing = await User.findOne({ email: data.email })
  if (existing) throw new Error('EMAIL_TAKEN')

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)

  const user = await User.create({
    email: data.email,
    passwordHash,
    role: data.role,
    schoolId: data.schoolId ?? undefined,
  })

  const result = { id: user._id.toString(), email: user.email, role: user.role, schoolId: user.schoolId }

  // Emit event so other services (tenant, notification) can react
  await eventBus.publish(
    ServiceEvent.USER_CREATED,
    { userId: result.id, email: result.email, role: result.role, schoolId: result.schoolId },
    'auth-service'
  )

  return result
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(
  email: string,
  password: string,
  totpCode: string | undefined,
  ipAddress: string,
  userAgent: string
) {
  const user = await User.findOne({ email, deletedAt: null })

  // Always run bcrypt to prevent timing attacks even if user not found
  const dummyHash = '$2a$12$invalidhashusedtopreventimuserenumeration'
  const passwordHash = user?.passwordHash ?? dummyHash

  // AUTH-005: check lockout before verifying password
  if (user && user.lockedUntil && user.lockedUntil > new Date()) {
    throw new Error('ACCOUNT_LOCKED')
  }

  const passwordValid = await bcrypt.compare(password, passwordHash)

  if (!user || !passwordValid) {
    if (user) {
      const attempts = user.loginAttempts + 1
      const lockedUntil =
        attempts >= config.lockout.maxAttempts
          ? new Date(Date.now() + config.lockout.durationMs)
          : undefined

      await User.updateOne(
        { _id: user._id },
        { loginAttempts: attempts, ...(lockedUntil ? { lockedUntil } : {}) }
      )

      await LoginAuditLog.create({ userId: user._id, ipAddress, userAgent, success: false })
    }
    throw new Error('INVALID_CREDENTIALS')
  }

  if (!user.isActive) throw new Error('ACCOUNT_INACTIVE')

  // AUTH-003: enforce MFA for admin roles
  if (user.mfaEnabled) {
    if (!totpCode) throw new Error('MFA_REQUIRED')
    const valid = authenticator.verify({ token: totpCode, secret: user.mfaSecret! })
    if (!valid) throw new Error('INVALID_MFA_CODE')
  }

  // Reset failed attempts on success
  await User.updateOne({ _id: user._id }, { loginAttempts: 0, lockedUntil: undefined })
  await LoginAuditLog.create({ userId: user._id, ipAddress, userAgent, success: true })

  const userId = user._id.toString()

  const accessToken = signAccessToken({
    sub: userId,
    schoolId: user.schoolId ?? '',
    role: user.role as Role,
    email: user.email,
  })

  const refreshToken = signRefreshToken(userId)
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpiry(),
  })

  return { accessToken, refreshToken, user: { id: userId, email: user.email, role: user.role } }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
export async function refreshAccessToken(rawRefreshToken: string) {
  let payload: { sub: string }
  try {
    payload = verifyRefreshToken(rawRefreshToken)
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN')
  }

  const tokenHash = hashToken(rawRefreshToken)
  const stored = await RefreshToken.findOne({ tokenHash })

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new Error('INVALID_REFRESH_TOKEN')
  }

  const user = await User.findById(payload.sub)
  if (!user || !user.isActive) throw new Error('INVALID_REFRESH_TOKEN')

  // Rotate refresh token
  await RefreshToken.updateOne({ tokenHash }, { revokedAt: new Date() })

  const newRefreshToken = signRefreshToken(user._id.toString())
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: getRefreshTokenExpiry(),
  })

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    schoolId: user.schoolId ?? '',
    role: user.role as Role,
    email: user.email,
  })

  return { accessToken, refreshToken: newRefreshToken }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(rawRefreshToken: string, accessToken?: string) {
  const tokenHash = hashToken(rawRefreshToken)
  await RefreshToken.updateMany({ tokenHash, revokedAt: { $exists: false } }, { revokedAt: new Date() })

  // Blacklist the access token so it can't be used for remaining TTL
  if (accessToken) {
    await blacklistToken(accessToken, 15 * 60) // 15 min — matches JWT expiry
  }
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export async function forgotPassword(email: string) {
  const user = await User.findOne({ email, deletedAt: null })
  // Always return success to prevent user enumeration
  if (!user) return

  const rawToken = generateSecureToken()
  const expiresAt = new Date(Date.now() + config.passwordReset.expiresSec * 1000)

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash: hashToken(rawToken),
    expiresAt,
  })

  // TODO: emit event to notification-service to send reset email
  return process.env.NODE_ENV !== 'production' ? rawToken : undefined
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export async function resetPassword(rawToken: string, newPassword: string) {
  const tokenHash = hashToken(rawToken)
  const record = await PasswordResetToken.findOne({ tokenHash })

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new Error('INVALID_OR_EXPIRED_TOKEN')
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

  await Promise.all([
    User.updateOne({ _id: record.userId }, { passwordHash }),
    PasswordResetToken.updateOne({ tokenHash }, { usedAt: new Date() }),
    RefreshToken.updateMany(
      { userId: record.userId, revokedAt: { $exists: false } },
      { revokedAt: new Date() }
    ),
  ])
}

// ─── Change Password ───────────────────────────────────────────────────────────────
export async function changePassword(userId: string, currentPassword: string, newPassword: string, accessToken: string) {
  const user = await User.findById(userId)
  if (!user) throw new Error('USER_NOT_FOUND')

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) throw new Error('INVALID_CREDENTIALS')

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

  await Promise.all([
    User.updateOne({ _id: userId }, { passwordHash }),
    // Revoke all refresh tokens — force re-login on all devices
    RefreshToken.updateMany({ userId, revokedAt: { $exists: false } }, { revokedAt: new Date() }),
    // Blacklist current access token immediately
    blacklistToken(accessToken, 15 * 60),
  ])
}

// ─── MFA Setup ────────────────────────────────────────────────────────────────
export async function setupMfa(userId: string) {
  const user = await User.findById(userId)
  if (!user) throw new Error('USER_NOT_FOUND')

  const secret = authenticator.generateSecret()
  const otpAuthUrl = authenticator.keyuri(user.email, config.totp.issuer, secret)

  return { secret, otpAuthUrl }
}

export async function verifyAndEnableMfa(userId: string, secret: string, totpCode: string) {
  const valid = authenticator.verify({ token: totpCode, secret })
  if (!valid) throw new Error('INVALID_MFA_CODE')

  await User.updateOne({ _id: userId }, { mfaSecret: secret, mfaEnabled: true })
}

// ─── User Management (school-scoped) ───────────────────────────────────────────
export async function listUsers(schoolId: string) {
  return User.find({ schoolId, deletedAt: { $exists: false } })
    .select('email role isActive mfaEnabled createdAt')
    .sort({ createdAt: -1 })
}

export async function updateUserRoleOrStatus(
  schoolId: string,
  userId: string,
  updates: { role?: Role; isActive?: boolean }
) {
  const user = await User.findOne({ _id: userId, schoolId, deletedAt: { $exists: false } })
  if (!user) throw new Error('USER_NOT_FOUND')

  if (updates.role !== undefined) user.role = updates.role
  if (updates.isActive !== undefined) user.isActive = updates.isActive
  await user.save()

  if (updates.isActive === false) {
    // Force sign-out everywhere when an account is deactivated
    await RefreshToken.updateMany({ userId, revokedAt: { $exists: false } }, { revokedAt: new Date() })
  }

  return user
}
