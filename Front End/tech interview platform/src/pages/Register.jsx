/**
 * Register Page
 * Client-side UI + validation only
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { registerSchema } from '../schemas/auth/registerSchema'

export default function Register() {
  const [submitMessage, setSubmitMessage] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register: registerUser } = useAuth()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      termsAccepted: false,
    },
  })

  const onSubmit = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password)
      reset({ ...data, password: '', confirmPassword: '', termsAccepted: false })
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
            <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-900">Create account</h1>
            <p className="mt-3 text-base text-slate-600">
              You can explore and practice before signing in. Account creation unlocks saved progress and full platform features.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.06)] sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...registerField('name')}
                  disabled={isSubmitting}
                  className={`w-full rounded-2xl border px-4 py-3 text-slate-800 transition focus:outline-none ${
                    errors.name ? 'border-rose-500 bg-rose-50 focus:border-rose-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-500'
                  }`}
                />
                {errors.name && <p className="text-sm font-medium text-rose-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...registerField('email')}
                  disabled={isSubmitting}
                  className={`w-full rounded-2xl border px-4 py-3 text-slate-800 transition focus:outline-none ${
                    errors.email ? 'border-rose-500 bg-rose-50 focus:border-rose-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-500'
                  }`}
                />
                {errors.email && <p className="text-sm font-medium text-rose-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...registerField('password')}
                  disabled={isSubmitting}
                  className={`w-full rounded-2xl border px-4 py-3 text-slate-800 transition focus:outline-none ${
                    errors.password ? 'border-rose-500 bg-rose-50 focus:border-rose-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-500'
                  }`}
                />
                {errors.password && <p className="text-sm font-medium text-rose-600">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerField('confirmPassword')}
                  disabled={isSubmitting}
                  className={`w-full rounded-2xl border px-4 py-3 text-slate-800 transition focus:outline-none ${
                    errors.confirmPassword ? 'border-rose-500 bg-rose-50 focus:border-rose-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-500'
                  }`}
                />
                {errors.confirmPassword && <p className="text-sm font-medium text-rose-600">{errors.confirmPassword.message}</p>}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <label htmlFor="termsAccepted" className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                  <input
                    id="termsAccepted"
                    type="checkbox"
                    {...registerField('termsAccepted')}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    I agree to the Terms & Conditions and understand that account creation unlocks saved progress and full platform features.
                  </span>
                </label>
                {errors.termsAccepted && <p className="mt-2 text-sm font-medium text-rose-600">{errors.termsAccepted.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
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
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 transition hover:text-indigo-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
