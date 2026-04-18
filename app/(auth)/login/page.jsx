/**
 * app/(auth)/login/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Login Page  →  URL: /login
 *
 * A public page. Authenticated users are redirected away by middleware.js.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * STEP 1 — Imports
 *   import { useForm } from 'react-hook-form'
 *   import { signIn } from 'next-auth/react'  ← client-side signIn
 *   import { useRouter } from 'next/navigation'
 *   import Link from 'next/link'
 *   (+ any shadcn/ui components: Button, Input, Label, Card, etc.)
 *
 *   Make this a Client Component: 'use client'
 *
 * STEP 2 — Form setup with React Hook Form
 *   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
 *
 * STEP 3 — Submit handler
 *   const onSubmit = async (data) => {
 *     const result = await signIn('credentials', {
 *       email: data.email,
 *       password: data.password,
 *       redirect: false,  // handle redirect manually
 *     })
 *     if (result?.error) {
 *       // Show error message: 'Invalid email or password'
 *     } else {
 *       router.push('/')   // redirect to home on success
 *       router.refresh()   // refresh server components
 *     }
 *   }
 *
 * STEP 4 — UI Structure
 *   - Centered card layout
 *   - "The Crumbs" logo/title at top
 *   - Email input field (with validation: required, valid email)
 *   - Password input field (with validation: required, min 8 chars)
 *   - Submit button (show loading state when isSubmitting)
 *   - Error messages under each field using errors.fieldName?.message
 *   - Link to /register: "Don't have an account? Sign up"
 */
