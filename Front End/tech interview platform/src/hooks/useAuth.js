/**
 * useAuth Hook
 * Custom hook to access authentication context
 * 
 * Usage:
 * const { currentUser, isAuthenticated, login, logout } = useAuth()
 */

import { useContext } from 'react'
import { AuthContext } from '../features/auth/authContext'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
