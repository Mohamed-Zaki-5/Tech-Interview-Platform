/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * 
 * If user is not authenticated, redirects to /login
 * If user is loading, shows loading state
 * If user is authenticated, renders the page
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white text-lg font-medium">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />
  }

  // User is authenticated, render the page
  return children
}
