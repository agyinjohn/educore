import { apiClient } from '../api-client'

// ─── Types matching backend response exactly ──────────────────────────────────
export interface User {
  id: string
  email: string
  role: string
  schoolId?: string
  // Extended profile fields (stored separately, not in auth-service)
  firstName?: string
  lastName?: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  role: string
  schoolId?: string
}

export interface RegisterResponse {
  id: string
  email: string
  role: string
  schoolId?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

const TOKEN_KEY = 'auth_token'
const TOKEN_EXPIRY_KEY = 'token_expiry'
// Access token TTL in ms — matches backend 15m
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000

class AuthService {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<{ success: boolean; data: LoginResponse }>(
      '/auth/login',
      { email: request.email, password: request.password }
    )
    const { data } = response.data
    this.setToken(data.accessToken)
    return data
  }

  // Register just creates the account — does NOT auto-login
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<{ success: boolean; data: RegisterResponse }>(
      '/auth/register',
      request
    )
    return response.data.data
  }

  // Refresh token lives in an httpOnly cookie (set by the backend on login) —
  // withCredentials on the axios instance sends it automatically.
  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ success: boolean; data: { accessToken: string } }>(
      '/auth/refresh',
      {}
    )
    const { accessToken } = response.data.data
    this.setToken(accessToken)
    return accessToken
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {})
    } finally {
      this.clearToken()
    }
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', request)
  }

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/reset-password', request)
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/change-password', request)
  }

  // ─── Token Management ───────────────────────────────────────────────────────
  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + ACCESS_TOKEN_TTL_MS).toString())
    apiClient.setAuthToken(token)
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }

  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
    if (!expiry) return true
    return Date.now() > parseInt(expiry, 10)
  }

  clearToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    apiClient.clearAuthToken()
  }
}

export const authService = new AuthService()
