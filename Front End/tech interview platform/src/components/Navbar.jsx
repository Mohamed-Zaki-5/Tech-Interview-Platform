/**
 * Navbar Component
 * Shared navigation for the platform
 */

import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navLinkClass = ({ isActive }) =>
  [
    'text-sm font-medium transition',
    isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600',
  ].join(' ')

const mobileNavLinkClass = ({ isActive }) =>
  [
    'block rounded-xl px-3 py-2 text-base font-medium transition',
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-600',
  ].join(' ')

export default function Navbar() {
  const { isAuthenticated, logout, currentUser } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = async () => {
    try {
      await logout()
      closeMenu()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/tracks', label: 'Tracks' },
    { to: '/about', label: 'About' },
  ]

  const authenticatedLinks = [
    { to: '/', label: 'Home' },
    { to: '/tracks', label: 'Tracks' },
    { to: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 shadow-lg shadow-indigo-500/25">
            <span className="text-lg font-black text-white">TI</span>
          </div>
          <div className="text-base font-black tracking-tight text-slate-900">Tech Interview Platform</div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {(isAuthenticated ? authenticatedLinks : publicLinks).map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={closeMenu}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Profile
              </Link>
              <button type="button" onClick={handleLogout} className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-indigo-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Sign In
              </Link>
              <Link to="/register" className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-indigo-600">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm md:hidden"
        >
          <span className="text-lg">☰</span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {(isAuthenticated ? authenticatedLinks : publicLinks).map((item) => (
              <NavLink key={item.to} to={item.to} className={mobileNavLinkClass} onClick={closeMenu}>
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className={mobileNavLinkClass} onClick={closeMenu}>Profile</NavLink>
                <button type="button" onClick={handleLogout} className="mt-1 rounded-xl bg-slate-900 px-3 py-2.5 text-left text-base font-semibold text-white">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={mobileNavLinkClass} onClick={closeMenu}>Sign In</NavLink>
                <NavLink to="/register" className={mobileNavLinkClass} onClick={closeMenu}>Get Started</NavLink>
              </>
            )}

            {isAuthenticated && currentUser && (
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Signed in as {currentUser.name || currentUser.email}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
