/**
 * Mock Authentication Service
 * 
 * TEMPORARY DEVELOPMENT ONLY
 * This service simulates authentication for development and testing.
 * It stores user data only in memory (not persisted).
 * 
 * TO REPLACE WITH REAL BACKEND:
 * 1. Remove this file (or keep as fallback)
 * 2. Update authContext.jsx to use real API endpoints
 * 3. Uncomment the TODO sections in authContext.jsx
 * 4. Use axios or fetch to call real backend endpoints
 * 5. Handle real tokens (JWT, session cookies, etc.)
 * 6. The interface (login, register, logout, getCurrentUser) will remain the same
 */

// In-memory store (NOT persisted - resets on page refresh)
let mockAuthStore = {
  currentUser: null,
  users: [
    // Pre-populated test user (only for development)
    {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      // Password is NOT stored in real apps
      password: 'Test@123',
    },
  ],
}

/**
 * Simulate API delay
 */
const simulateDelay = (ms = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Login - simulates API login call
 * Returns user object (without password)
 */
export async function mockLogin(email, password) {
  await simulateDelay()

  const user = mockAuthStore.users.find(
    (u) => u.email === email && u.password === password
  )

  if (!user) {
    throw new Error('Invalid email or password')
  }

  // Simulate token generation (not a real JWT)
  const mockToken = `mock-token-${Date.now()}`
  mockAuthStore.currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    // Token is NOT stored in context, but would be stored on backend session
    _mockToken: mockToken,
  }

  return mockAuthStore.currentUser
}

/**
 * Register - simulates API registration call
 * Returns user object (without password)
 */
export async function mockRegister(name, email, password) {
  await simulateDelay()

  // Check if user already exists
  if (mockAuthStore.users.some((u) => u.email === email)) {
    throw new Error('Email already registered')
  }

  // Create new user
  const newUser = {
    id: String(mockAuthStore.users.length + 1),
    name,
    email,
    password, // This should NEVER be stored in real apps
  }

  mockAuthStore.users.push(newUser)
  mockAuthStore.currentUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    _mockToken: `mock-token-${Date.now()}`,
  }

  return mockAuthStore.currentUser
}

/**
 * Logout - simulates API logout call
 */
export async function mockLogout() {
  await simulateDelay()
  mockAuthStore.currentUser = null
  // In real app, token would be invalidated on backend
}

/**
 * Get Current User - simulates API call to fetch current user
 */
export async function mockGetCurrentUser() {
  await simulateDelay()

  if (!mockAuthStore.currentUser) {
    throw new Error('No authenticated user')
  }

  return mockAuthStore.currentUser
}

/**
 * Export as object for easier replacement
 */
export const mockAuthService = {
  login: mockLogin,
  register: mockRegister,
  logout: mockLogout,
  getCurrentUser: mockGetCurrentUser,
}
