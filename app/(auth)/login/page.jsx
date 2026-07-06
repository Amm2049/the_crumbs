'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [authError, setAuthError] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Trigger entrance animation
  useEffect(() => {
    let active = true
    setTimeout(() => {
      if (active) setIsMounted(true)
    }, 0)
    return () => { active = false }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    await signIn('google', { callbackUrl: '/' })
    // Note: page redirects after this, setIsGoogleLoading(false) not needed
  }

  const onSubmit = async (data) => {
    setAuthError('')

    // We attempt to sign in using the backend
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setAuthError('Oops! Invalid email or password. Please try again.')
      } else {
        // Redirect to admin dashboard if the user is an admin
        // We use window.location because router.push doesn't always trigger a full session refresh
        window.location.assign(data.email === 'admin@thecrumbs.com' ? '/admin/dashboard' : '/')
      }
    } catch (error) {
      setAuthError('Something went wrong. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] relative overflow-hidden p-6 transition-colors duration-1000">

      {/* Playful Floating Background Elements (Warmer Colors) */}
      <div className={`absolute top-10 left-10 w-28 h-28 bg-amber-300 dark:bg-amber-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-50 dark:opacity-20 animate-blob transition-all duration-1000 ${isMounted ? 'scale-100' : 'scale-50 opacity-0'}`}></div>
      <div className={`absolute top-0 right-20 w-32 h-32 bg-yellow-200 dark:bg-yellow-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-60 dark:opacity-20 animate-blob animation-delay-2000 transition-all duration-1000 delay-200 ${isMounted ? 'scale-100' : 'scale-50 opacity-0'}`}></div>
      <div className={`absolute -bottom-8 left-40 w-28 h-28 bg-orange-200 dark:bg-orange-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-50 dark:opacity-20 animate-blob animation-delay-4000 transition-all duration-1000 delay-300 ${isMounted ? 'scale-100' : 'scale-50 opacity-0'}`}></div>

      {/* Main Login Card - Entrance Animation */}
      <div
        className={`w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-[0_8px_30px_rgb(251,191,36,0.15)] dark:shadow-none p-10 relative z-10 border border-white/50 dark:border-zinc-800 backdrop-blur-sm transform transition-all duration-700 ease-out ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
      >

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[var(--bakery-text)] tracking-tight mb-2">Welcome Back!</h1>
          <p className="text-[var(--bakery-text-muted)] font-medium text-sm">Sign in to your sweet account.</p>
        </div>

        {authError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
            {authError}
          </div>
        )}



        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="bakery-label">Email ✨</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`bakery-input ${errors.email ? 'bakery-input-error' : ''}`}
              {...register('email', {
                required: 'We need your email to log you in.',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "This email doesn't look quite right."
                }
              })}
            />
            {errors.email && <p className="mt-2 text-sm text-red-500 px-2 font-medium">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="bakery-label">Password 🔐</label>
            <input
              type="password"
              placeholder="••••••••"
              className={`bakery-input ${errors.password ? 'bakery-input-error' : ''}`}
              {...register('password', {
                required: 'Please enter your password.'
              })}
            />
            {errors.password && <p className="mt-2 text-sm text-red-500 px-2 font-medium">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bakery-btn-primary mt-4"
          >
            {isSubmitting ? 'Baking...' : 'Log In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs text-[var(--bakery-text-muted)] font-medium">or sign in with gmail</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>
        {/* Google Sign-In Button */}
        <button
          id="google-signin-btn"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[var(--bakery-text)] font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <span className="w-5 h-5 border-2 border-zinc-300 border-t-amber-500 rounded-full animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>



        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--bakery-text-muted)] font-medium">
            New here?{' '}
            <Link href="/register" className="text-amber-600 dark:text-amber-500 font-bold hover:text-amber-700 dark:hover:text-amber-400 hover:underline underline-offset-4 transition-colors">
              Join the bakery
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
