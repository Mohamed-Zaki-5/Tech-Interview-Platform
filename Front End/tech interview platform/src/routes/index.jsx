/**
 * Routes Configuration
 * Defines all application routes (public and protected)
 */

import { createBrowserRouter } from 'react-router-dom'

// Page imports
import Home from '../pages/Home'
import TracksPage from '../pages/Tracks'
import About from '../pages/About'
import TrackDetail from '../pages/TrackDetail'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Profile from '../pages/Profile'
import Assessment from '../pages/Assessment'
import Practice from '../pages/Practice'
import Questions from '../pages/Questions'
import Evaluation from '../pages/Evaluation'
import NotFound from '../pages/NotFound'
import PublicLayout from '../layouts/PublicLayout'
import ProtectedLayout from '../layouts/ProtectedLayout'

// Auth imports
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'

export const routes = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/tracks',
        element: <TracksPage />,
      },
      {
        path: '/tracks/:trackId',
        element: <TrackDetail />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/practice/:trackId',
        element: <Practice />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/questions',
        element: <Questions />,
      },
      {
        path: '/assessment',
        element: <Assessment />,
      },
      {
        path: '/evaluation/:trackId',
        element: <Evaluation />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]

export const router = createBrowserRouter(routes)
