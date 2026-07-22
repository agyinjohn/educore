import request from 'supertest'
import express from 'express'
import authRoutes from '../../routes/auth.routes'
import { User } from '../../models/User'
import * as authService from '../../services/auth.service'

// Mock the database and service layer
jest.mock('../../models/User')
jest.mock('../../services/auth.service')
jest.mock('../../config/db')
jest.mock('../../config/redis')

describe('Auth Routes', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use('/api/v1/auth', authRoutes)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /register', () => {
    it('should successfully register a new user', async () => {
      const registerData = {
        email: 'newuser@test.com',
        password: 'SecurePass123!',
        passwordConfirm: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
      }

      jest.spyOn(authService, 'register').mockResolvedValue({
        success: true,
        user: {
          _id: 'user-123',
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
        },
      } as any)

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData)

      expect(response.status).toBeIn([200, 201])
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('user')
    })

    it('should fail with invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        passwordConfirm: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
      }

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
    })

    it('should fail with mismatched passwords', async () => {
      const mismatchData = {
        email: 'user@test.com',
        password: 'SecurePass123!',
        passwordConfirm: 'DifferentPass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
      }

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(mismatchData)

      expect(response.status).toBe(400)
    })

    it('should fail with duplicate email', async () => {
      const registerData = {
        email: 'existing@test.com',
        password: 'SecurePass123!',
        passwordConfirm: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
      }

      jest.spyOn(authService, 'register').mockRejectedValue({
        message: 'User already exists',
      })

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData)

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: 'user@test.com',
        password: 'SecurePass123!',
      }

      jest.spyOn(authService, 'login').mockResolvedValue({
        success: true,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: {
          _id: 'user-123',
          email: loginData.email,
          role: 'student',
        },
      } as any)

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('user')
    })

    it('should fail with invalid email', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
      }

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)

      expect(response.status).toBe(400)
    })

    it('should fail with non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'SecurePass123!',
      }

      jest.spyOn(authService, 'login').mockRejectedValue({
        message: 'Invalid credentials',
      })

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should fail with wrong password', async () => {
      const loginData = {
        email: 'user@test.com',
        password: 'WrongPassword123!',
      }

      jest.spyOn(authService, 'login').mockRejectedValue({
        message: 'Invalid credentials',
      })

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /refresh', () => {
    it('should successfully refresh access token', async () => {
      jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue({
        success: true,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      } as any)

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refreshToken=refresh-token-123')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
    })

    it('should fail without refresh token', async () => {
      jest.spyOn(authService, 'refreshAccessToken').mockRejectedValue({
        message: 'No refresh token',
      })

      const response = await request(app)
        .post('/api/v1/auth/refresh')

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /logout', () => {
    it('should successfully logout', async () => {
      jest.spyOn(authService, 'logout').mockResolvedValue({
        success: true,
      } as any)

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer access-token-123')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
    })
  })

  describe('POST /forgot-password', () => {
    it('should send password reset email', async () => {
      const forgotData = {
        email: 'user@test.com',
      }

      jest.spyOn(authService, 'forgotPassword').mockResolvedValue({
        success: true,
        message: 'Reset email sent',
      } as any)

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send(forgotData)

      expect(response.status).toBe(200)
    })

    it('should fail with invalid email', async () => {
      const forgotData = {
        email: 'invalid-email',
      }

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send(forgotData)

      expect(response.status).toBe(400)
    })
  })

  describe('POST /reset-password', () => {
    it('should successfully reset password', async () => {
      const resetData = {
        token: 'reset-token-123',
        password: 'NewPassword123!',
        passwordConfirm: 'NewPassword123!',
      }

      jest.spyOn(authService, 'resetPassword').mockResolvedValue({
        success: true,
        message: 'Password reset successfully',
      } as any)

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send(resetData)

      expect(response.status).toBe(200)
    })

    it('should fail with invalid token', async () => {
      const resetData = {
        token: 'invalid-token',
        password: 'NewPassword123!',
        passwordConfirm: 'NewPassword123!',
      }

      jest.spyOn(authService, 'resetPassword').mockRejectedValue({
        message: 'Invalid or expired token',
      })

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send(resetData)

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /change-password', () => {
    it('should successfully change password', async () => {
      const changeData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        passwordConfirm: 'NewPassword123!',
      }

      jest.spyOn(authService, 'changePassword').mockResolvedValue({
        success: true,
        message: 'Password changed successfully',
      } as any)

      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', 'Bearer access-token-123')
        .send(changeData)

      expect(response.status).toBe(200)
    })

    it('should fail with wrong current password', async () => {
      const changeData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
        passwordConfirm: 'NewPassword123!',
      }

      jest.spyOn(authService, 'changePassword').mockRejectedValue({
        message: 'Current password is incorrect',
      })

      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', 'Bearer access-token-123')
        .send(changeData)

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /mfa/setup', () => {
    it('should generate MFA setup QR code', async () => {
      jest.spyOn(authService, 'setupMfa').mockResolvedValue({
        success: true,
        qrCode: 'data:image/png;base64,...',
        secret: 'JBSWY3DPEBLW64TMMQ======',
      } as any)

      const response = await request(app)
        .post('/api/v1/auth/mfa/setup')
        .set('Authorization', 'Bearer access-token-123')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('qrCode')
    })
  })

  describe('POST /mfa/verify', () => {
    it('should verify MFA token', async () => {
      const verifyData = {
        token: '123456',
      }

      jest.spyOn(authService, 'verifyAndEnableMfa').mockResolvedValue({
        success: true,
        message: 'MFA enabled',
      } as any)

      const response = await request(app)
        .post('/api/v1/auth/mfa/verify')
        .set('Authorization', 'Bearer access-token-123')
        .send(verifyData)

      expect(response.status).toBe(200)
    })

    it('should fail with invalid MFA token', async () => {
      const verifyData = {
        token: '000000',
      }

      jest.spyOn(authService, 'verifyAndEnableMfa').mockRejectedValue({
        message: 'Invalid MFA token',
      })

      const response = await request(app)
        .post('/api/v1/auth/mfa/verify')
        .set('Authorization', 'Bearer access-token-123')
        .send(verifyData)

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })
})

// Helper matcher for status code ranges
expect.extend({
  toBeIn(received: number, expected: number[]) {
    const pass = expected.includes(received)
    return {
      pass,
      message: () => `expected ${received} to be in ${expected}`,
    }
  },
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeIn(expected: number[]): R
    }
  }
}
