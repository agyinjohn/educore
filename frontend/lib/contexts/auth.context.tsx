'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService, User, LoginRequest, RegisterRequest } from '@/lib/services/auth.service'
import { apiClient } from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthContextType {
  user: User | null
  schoolId: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ─── JWT decode utility ───────────────────────────────────────────────────────
function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Derived from user — single source of truth
  const schoolId = user?.schoolId ?? null

  // Restore session from stored token on mount
  useEffect(() => {
    const init = async () => {
      try {
        const token = authService.getToken()
        if (!token) return

        if (authService.isTokenExpired()) {
          try {
            const newToken = await authService.refreshToken()
            const payload = parseJwt(newToken)
            if (payload) setUser({ id: payload.sub, email: payload.email, role: payload.role, schoolId: payload.schoolId || undefined })
          } catch {
            authService.clearToken()
          }
          return
        }

        const payload = parseJwt(token)
        if (payload) {
          apiClient.setAuthToken(token)
          setUser({ id: payload.sub, email: payload.email, role: payload.role, schoolId: payload.schoolId || undefined })
        }
      } catch {
        authService.clearToken()
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.login(credentials)
      setUser(response.user)
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please try again.'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Register creates the account then redirects to login — backend does not auto-login
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      await authService.register(data)
      router.push('/login?registered=true')
    } catch (err: any) {
      const msg = err?.message || 'Registration failed. Please try again.'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
      router.push('/login')
    } catch (err: any) {
      setError(err?.message || 'Logout failed.')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setError(null)
    try {
      await authService.changePassword({ currentPassword, newPassword })
      // Force re-login on all devices after password change
      authService.clearToken()
      setUser(null)
      router.push('/login')
    } catch (err: any) {
      setError(err?.message || 'Password change failed.')
      throw err
    }
  }, [router])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider value={{
      user,
      schoolId,
      isLoading,
      isAuthenticated: !!user,
      error,
      login,
      register,
      logout,
      changePassword,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export default AuthProvider
