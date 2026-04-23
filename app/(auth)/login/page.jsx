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

  // Trigger entrance animation
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

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
        window.location.href = data.email === 'admin@thecrumbs.com' ? '/admin/dashboard' : '/'
      }
    } catch (error) {
      setAuthError('Something went wrong. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFdf2] relative overflow-hidden p-6 transition-colors duration-1000">

      {/* Playful Floating Background Elements (Warmer Colors) */}
      <div className={`absolute top-10 left-10 w-28 h-28 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob transition-all duration-1000 ${isMounted ? 'scale-100' : 'scale-50 opacity-0'}`}></div>
      <div className={`absolute top-0 right-20 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000 transition-all duration-1000 delay-200 ${isMounted ? 'scale-100' : 'scale-50 opacity-0'}`}></div>
      <div className={`absolute -bottom-8 left-40 w-28 h-28 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000 transition-all duration-1000 delay-300 ${isMounted ? 'scale-100' : 'scale-50 opacity-0'}`}></div>

      {/* Main Login Card - Entrance Animation */}
      <div
        className={`w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(251,191,36,0.15)] p-10 relative z-10 border border-white/50 backdrop-blur-sm transform transition-all duration-700 ease-out ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
      >

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#5C3A21] tracking-tight mb-2">Welcome Back!</h1>
          <p className="text-[#8A6D5E] font-medium text-sm">Sign in to your sweet account.</p>
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

        <div className="mt-8 text-center">
          <p className="text-sm text-[#8A6D5E] font-medium">
            New here?{' '}
            <Link href="/register" className="text-amber-600 font-bold hover:text-amber-700 hover:underline underline-offset-4 transition-colors">
              Join the bakery
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
