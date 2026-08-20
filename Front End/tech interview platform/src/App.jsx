import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './features/auth/authContext'
import { router } from './routes'

/**
 * Main App Component
 * Wraps the app with AuthProvider for authentication context
 * Renders the router provider which handles all routing
 */
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
