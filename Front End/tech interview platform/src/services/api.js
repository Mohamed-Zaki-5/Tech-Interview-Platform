/**
 * Centralized Axios Instance
 * 
 * This module creates and exports a configured Axios instance for all API calls.
 * 
 * Features:
 * - Centralized base URL configuration (via environment variables)
 * - Request/response interceptors (ready for future token handling)
 * - Error handling standardization
 * - Easy to extend with authentication headers, retry logic, etc.
 * 
 * Usage in services:
 * import { api } from './api'
 * 
 * const response = await api.get('/endpoint')
 * const response = await api.post('/endpoint', data)
 */

import axios from 'axios'

/**
 * Create Axios instance with base URL from environment variable
 * 
 * VITE_API_BASE_URL: Backend API base URL (e.g., http://localhost:5000)
 * Falls back to empty string for development without backend
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor
 * Runs before every request
 * 
 * Future enhancements:
 * - Add authorization token to headers
 * - Add request logging
 * - Add request transformation
 */
api.interceptors.request.use(
  (config) => {
    // TODO: Add token to headers when real authentication is implemented
    // const token = localStorage.getItem('authToken')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }

    // TODO: Add request logging in development
    if (import.meta.env.DEV) {
      console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor
 * Runs after every response
 * 
 * Future enhancements:
 * - Handle token refresh on 401
 * - Standardize error responses
 * - Add response logging
 * - Handle specific error codes (401, 403, 404, 500, etc.)
 */
api.interceptors.response.use(
  (response) => {
    // TODO: Add response logging in development
    if (import.meta.env.DEV) {
      console.debug(
        `[API Response] ${response.status} ${response.config.url}`,
        response.data
      )
    }

    return response
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data

      if (status === 401) {
        // TODO: Handle token refresh or redirect to login
        // window.location.href = '/login'
        console.error('[API Error] Unauthorized - 401')
      } else if (status === 403) {
        console.error('[API Error] Forbidden - 403')
      } else if (status === 404) {
        console.error('[API Error] Not Found - 404')
      } else if (status >= 500) {
        console.error('[API Error] Server Error -', status)
      }

      return Promise.reject({
        status,
        message: data.message || error.message,
        data,
      })
    } else if (error.request) {
      // Request made but no response received
      console.error('[API Error] No response received', error.request)
      return Promise.reject({
        message: 'No response from server',
        error,
      })
    } else {
      // Error in request setup
      console.error('[API Error] Request setup error', error.message)
      return Promise.reject({
        message: error.message,
        error,
      })
    }
  }
)

export { api }
