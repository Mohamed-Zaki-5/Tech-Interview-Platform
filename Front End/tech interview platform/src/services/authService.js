/**
 * Authentication Service
 * Handles all authentication-related API calls
 * 
 * This is a TEMPLATE/PLACEHOLDER for future backend integration.
 * Currently uses mock authentication from authContext.jsx
 * 
 * When backend is ready:
 * 1. Uncomment the API calls below
 * 2. Remove the mock auth service calls
 * 3. Update authContext.jsx to use these methods
 */

import { api } from './api'

/**
 * Template for Login API call
 * 
 * When implemented:
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { user, token }
 * 
 * TODO: Uncomment and implement when backend is ready
 */
export async function loginUser(email, password) {
  try {
    // PLACEHOLDER - No actual API call yet
    // const response = await api.post('/auth/login', {
    //   email,
    //   password,
    // })
    // return response.data

    throw new Error('Login API not implemented yet - use mock auth')
  } catch (error) {
    throw error
  }
}

/**
 * Template for Register API call
 * 
 * When implemented:
 * POST /api/auth/register
 * Body: { name, email, password }
 * Response: { user, token }
 * 
 * TODO: Uncomment and implement when backend is ready
 */
export async function registerUser(name, email, password) {
  try {
    // PLACEHOLDER - No actual API call yet
    // const response = await api.post('/auth/register', {
    //   name,
    //   email,
    //   password,
    // })
    // return response.data

    throw new Error('Register API not implemented yet - use mock auth')
  } catch (error) {
    throw error
  }
}

/**
 * Template for Logout API call
 * 
 * When implemented:
 * POST /api/auth/logout
 * Headers: Authorization: Bearer {token}
 * Response: { success: true }
 * 
 * TODO: Uncomment and implement when backend is ready
 */
export async function logoutUser() {
  try {
    // PLACEHOLDER - No actual API call yet
    // const response = await api.post('/auth/logout')
    // return response.data

    // For now, just return success (logout is handled in mock auth)
    return { success: true }
  } catch (error) {
    throw error
  }
}

/**
 * Template for Get Current User API call
 * 
 * When implemented:
 * GET /api/auth/me
 * Headers: Authorization: Bearer {token}
 * Response: { user }
 * 
 * TODO: Uncomment and implement when backend is ready
 */
export async function getCurrentUser() {
  try {
    // PLACEHOLDER - No actual API call yet
    // const response = await api.get('/auth/me')
    // return response.data

    throw new Error('Get current user API not implemented yet - use mock auth')
  } catch (error) {
    throw error
  }
}

/**
 * Template for Token Refresh API call
 * 
 * When implemented:
 * POST /api/auth/refresh
 * Body: { refreshToken }
 * Response: { token }
 * 
 * TODO: Implement when using JWT with refresh tokens
 */
export async function refreshToken(refreshToken) {
  try {
    // PLACEHOLDER - No actual API call yet
    // const response = await api.post('/auth/refresh', {
    //   refreshToken,
    // })
    // return response.data

    throw new Error('Token refresh API not implemented yet')
  } catch (error) {
    throw error
  }
}

/**
 * Export all auth service methods as object for easier replacement
 */
export const authService = {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  refreshToken,
}
