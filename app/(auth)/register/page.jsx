/**
 * app/(auth)/register/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Register Page  →  URL: /register
 *
 * A public page. Authenticated users are redirected away by middleware.js.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 'use client'
 *
 * STEP 1 — Imports
 *   import { useForm } from 'react-hook-form'
 *   import { useRouter } from 'next/navigation'
 *   import Link from 'next/link'
 *
 * STEP 2 — Form setup
 *   const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
 *   (use watch('password') to get the password value for the confirm-password validation)
 *
 * STEP 3 — Submit handler
 *   const onSubmit = async (data) => {
 *     // POST to /api/auth/register with { name, email, password }
 *     const res = await fetch('/api/auth/register', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
 *     })
 *     if (!res.ok) {
 *       const { error } = await res.json()
 *       // Show error
 *     } else {
 *       // Auto-login after successful registration using signIn('credentials', ...)
 *       // Then redirect to '/'
 *     }
 *   }
 *
 * STEP 4 — Form Fields + Validations
 *   - Name: required
 *   - Email: required, pattern: valid email regex
 *   - Password: required, minLength: 8
 *   - Confirm Password: required, validate: (val) => val === watch('password') || 'Passwords do not match'
 *
 * STEP 5 — UI Structure
 *   - Same centered card style as login page
 *   - Link to /login: "Already have an account? Sign in"
 */

export default function RegisterPage() {
  return <div>Register Page — implement me!</div>
}
