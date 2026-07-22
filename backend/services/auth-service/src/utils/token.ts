import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { config } from '../config'
import { JwtPayload, Role } from '@educore/shared'

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as jwt.SignOptions)
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions)
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, config.jwt.refreshSecret) as { sub: string }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function getRefreshTokenExpiry(): Date {
  const ms = 7 * 24 * 60 * 60 * 1000 // 7 days
  return new Date(Date.now() + ms)
}
