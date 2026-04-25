'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setAuthError('')
    
    try {
      // 1. Register the user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setAuthError(errorData.error || 'Oops! Something went wrong.')
        return
      }

      // 2. Auto-login on success
      const loginResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (loginResult?.error) {
        setAuthError('Account created, but auto-login failed. Please sign in.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setAuthError('Connection error. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] relative overflow-hidden p-6 transition-colors duration-1000">

      {/* Playful Floating Background Elements (Different arrangement for register) */}
      <div className={`absolute top-20 right-10 w-32 h-32 bg-amber-200 dark:bg-amber-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-60 dark:opacity-20 animate-blob transition-all duration-1000 ${isMounted ? 'scale-100' : 'scale-50 opacity-0'}`}></div>
      <div className={`absolute bottom-10 left-20 w-36 h-36 bg-pink-200 dark:bg-rose-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-50 dark:opacity-20 animate-blob animation-delay-2000 transition-all duration-1000 delay-200 ${isMounted ? 'scale-100' : 'scale-50 opacity-0'}`}></div>
      <div className={`absolute top-40 left-1/4 w-24 h-24 bg-orange-200 dark:bg-orange-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-50 animate-blob animation-delay-4000 transition-all duration-1000 delay-300 ${isMounted ? 'scale-100' : 'scale-50 opacity-0'}`}></div>

      {/* Main Register Card - Entrance Animation */}
      <div 
        className={`w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-[0_8px_30px_rgb(251,191,36,0.15)] dark:shadow-none p-10 relative z-10 border border-white/50 dark:border-zinc-800 backdrop-blur-sm transform transition-all duration-700 ease-out ${
          isMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[var(--bakery-text)] tracking-tight mb-2">Join us! 🎉</h1>
          <p className="text-[var(--bakery-text-muted)] font-medium text-sm">Create an account for fresh treats.</p>
        </div>

        {authError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="bakery-label">Full Name 🧑‍🍳</label>
            <input
              type="text"
              placeholder="Baker Bob"
              className={`bakery-input ${errors.name ? 'bakery-input-error' : ''}`}
              {...register('name', { required: 'Please tell us your name.' })}
            />
            {errors.name && <p className="mt-2 text-sm text-red-500 px-2 font-medium">{errors.name.message}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="bakery-label">Email ✨</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`bakery-input ${errors.email ? 'bakery-input-error' : ''}`}
              {...register('email', {
                required: 'We need your email to create your account.',
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
                required: 'Please enter a password.',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters.'
                }
              })}
            />
            {errors.password && <p className="mt-2 text-sm text-red-500 px-2 font-medium">{errors.password.message}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="bakery-label">Confirm Password 🔑</label>
            <input
              type="password"
              placeholder="••••••••"
              className={`bakery-input ${errors.confirmPassword ? 'bakery-input-error' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password.',
                validate: (value) => 
                  value === password || 'Vada oops! Passwords do not match.'
              })}
            />
            {errors.confirmPassword && <p className="mt-2 text-sm text-red-500 px-2 font-medium">{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bakery-btn-primary mt-6"
          >
            {isSubmitting ? 'Mixing dough...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--bakery-text-muted)] font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-600 dark:text-amber-500 font-bold hover:text-amber-700 dark:hover:text-amber-400 hover:underline underline-offset-4 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
