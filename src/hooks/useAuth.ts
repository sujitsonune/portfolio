'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/lib/auth-service'
import type { AdminUser } from '@/types'

export interface AuthState {
  user: AdminUser | null
  loading: boolean
  isAuthenticated: boolean
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: AdminUser }>
  signOut: () => Promise<{ success: boolean; message: string }>
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  hasPermission: (permission: keyof AdminUser['permissions']) => boolean
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const result = await authService.signIn(email, password)
    setLoading(false)
    return result
  }

  const signOut = async () => {
    setLoading(true)
    const result = await authService.signOut()
    setLoading(false)
    return result
  }

  const sendPasswordReset = async (email: string) => {
    return authService.sendPasswordReset(email)
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    return authService.changePassword(currentPassword, newPassword)
  }

  const hasPermission = (permission: keyof AdminUser['permissions']): boolean => {
    return authService.hasPermission(permission)
  }

  return {
    user,
    loading,
    isAuthenticated: user !== null && user.isActive,
    signIn,
    signOut,
    sendPasswordReset,
    changePassword,
    hasPermission
  }
}