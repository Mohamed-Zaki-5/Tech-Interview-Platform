/**
 * Login Page
 * Client-side UI + validation only
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { loginSchema } from '../schemas/auth/loginSchema'

export default function Login() {
  const [submitMessage, setSubmitMessage] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      rememberMe: true,
    },
  })

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      reset({ ...data, password: '', rememberMe: data.rememberMe })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setSubmitMessage(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-5 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 shadow-lg shadow-indigo-500/25">
                <span className="text-xl font-black text-white">TI</span>
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-900">Welcome back</h1>
            <p className="mt-3 text-base text-slate-600">
              Explore and practice before signing in. Create an account later to save progress and unlock full platform features.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.06)] sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  disabled={isSubmitting}
                  className={`w-full rounded-2xl border px-4 py-3 text-slate-800 transition focus:outline-none ${
                    errors.email
                      ? 'border-rose-500 bg-rose-50 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-500'
                  }`}
                />
                {errors.email && <p className="text-sm font-medium text-rose-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <button type="button" className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700">
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isSubmitting}
                  className={`w-full rounded-2xl border px-4 py-3 text-slate-800 transition focus:outline-none ${
                    errors.password
                      ? 'border-rose-500 bg-rose-50 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-500'
                  }`}
                />
                {errors.password && <p className="text-sm font-medium text-rose-600">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...register('rememberMe')}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Checking...' : 'Sign In'}
              </button>
            </form>

            {submitMessage && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {submitMessage}
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">or</span>
              </div>
            </div>

            <p className="text-center text-sm text-slate-600">
              Need an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 transition hover:text-indigo-700">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
