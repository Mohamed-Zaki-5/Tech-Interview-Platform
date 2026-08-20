/**
 * User Service
 * Handles all user-related API calls
 * 
 * This is a TEMPLATE/PLACEHOLDER for future backend integration.
 * 
 * When backend is ready:
 * 1. Uncomment the API calls below
 * 2. Update the endpoint paths as needed
 * 3. Add proper error handling
 * 4. Implement any additional methods needed
 */

import { api } from './api'

/**
 * Template for Get User Profile API call
 * 
 * When implemented:
 * GET /api/users/{userId}
 * Response: { user }
 * 
 * TODO: Uncomment and implement when backend is ready
 */
export async function getUserProfile(userId) {
  try {
    // PLACEHOLDER - No actual API call yet
    // const response = await api.get(`/users/${userId}`)
    // return response.data

    throw new Error('Get user profile API not implemented yet')
  } catch (error) {
    throw error
  }
}

/**
 * Template for Update User Profile API call
 * 
 * When implemented:
 * PUT /api/users/{userId}
 * Body: { name, email, ... }
 * Response: { user }
 * 
 * TODO: Uncomment and implement when backend is ready
 */
export async function updateUserProfile(userId, profileData) {
  try {
    // PLACEHOLDER - No actual API call yet
    // const response = await api.put(`/users/${userId}`, profileData)
    // return response.data

    throw new Error('Update user profile API not implemented yet')
  } catch (error) {
    throw error
  }
}

/**
 * Template for Change Password API call
 * 
 * When implemented:
 * POST /api/users/{userId}/change-password
 * Body: { currentPassword, newPassword }
 * Response: { success: true }
 * 
 * TODO: Uncomment and implement when backend is ready
 */
export async function changePassword(userId, currentPassword, newPassword) {
  try {
    // PLACEHOLDER - No actual API call yet
    // const response = await api.post(
    //   `/users/${userId}/change-password`,
    //   {
    //     currentPassword,
    //     newPassword,
    //   }
    // )
    // return response.data

    throw new Error('Change password API not implemented yet')
  } catch (error) {
    throw error
  }
}

/**
 * Template for Delete Account API call
 * 
 * When implemented:
 * DELETE /api/users/{userId}
 * Response: { success: true }
 * 
 * TODO: Uncomment and implement when backend is ready
 */
export async function deleteAccount(userId) {
  try {
    // PLACEHOLDER - No actual API call yet
    // const response = await api.delete(`/users/${userId}`)
    // return response.data

    throw new Error('Delete account API not implemented yet')
  } catch (error) {
    throw error
  }
}

/**
 * Export all user service methods as object for easier replacement
 */
export const userService = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
}
