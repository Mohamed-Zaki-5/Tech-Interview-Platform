/**
 * Authentication Context
 * Manages global authentication state
 * 
 * TEMPORARY/MOCK AUTHENTICATION:
 * This context uses mock/temporary authentication for development purposes.
 * It will be replaced with real backend integration in a future phase.
 * 
 * DO NOT use this for production. All auth state here is temporary.
 */

import { createContext, useState, useCallback, useEffect } from 'react'
import { mockAuthService } from './authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Initialize auth state on component mount
   * In a real app, this would check if a valid token exists
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        // TODO: Replace with real backend call to verify existing session
        // For now, we just complete the loading state
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (err) {
        console.error('Auth initialization error:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  /**
   * Login handler
   * In a real app, this would send credentials to backend and receive token
   * 
   * TEMPORARY: Uses mock service for development
   */
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true)
      setError(null)

      // TODO: Replace with real API call
      // const response = await axios.post('/api/auth/login', { email, password })
      // Store token: localStorage.setItem('authToken', response.data.token)
      
      const user = await mockAuthService.login(email, password)
      
      setCurrentUser(user)
      setIsAuthenticated(true)
      return user
    } catch (err) {
      setError(err.message)
      setIsAuthenticated(false)
      setCurrentUser(null)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Register handler
   * In a real app, this would send registration data to backend
   * 
   * TEMPORARY: Uses mock service for development
   */
  const register = useCallback(async (name, email, password) => {
    try {
      setIsLoading(true)
      setError(null)

      // TODO: Replace with real API call
      // const response = await axios.post('/api/auth/register', { name, email, password })
      // Store token: localStorage.setItem('authToken', response.data.token)
      
      const user = await mockAuthService.register(name, email, password)
      
      setCurrentUser(user)
      setIsAuthenticated(true)
      return user
    } catch (err) {
      setError(err.message)
      setIsAuthenticated(false)
      setCurrentUser(null)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Logout handler
   * In a real app, this would invalidate the token on backend
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)

      // TODO: Replace with real API call to invalidate token
      // await axios.post('/api/auth/logout')
      // localStorage.removeItem('authToken')
      
      await mockAuthService.logout()

      setCurrentUser(null)
      setIsAuthenticated(false)
      setError(null)
    } catch (err) {
      console.error('Logout error:', err)
      // Even if logout fails on backend, clear local state
      setCurrentUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Get current user
   * In a real app, this would fetch user data from backend
   */
  const getCurrentUser = useCallback(async () => {
    try {
      if (!isAuthenticated) return null

      // TODO: Replace with real API call
      // const response = await axios.get('/api/auth/me')
      // return response.data
      
      const user = await mockAuthService.getCurrentUser()
      setCurrentUser(user)
      return user
    } catch (err) {
      console.error('Get current user error:', err)
      setError(err.message)
      return null
    }
  }, [isAuthenticated])

  const value = {
    // State
    currentUser,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    getCurrentUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
