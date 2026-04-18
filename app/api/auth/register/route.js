/**
 * app/api/auth/register/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * User Registration Endpoint
 *
 * POST /api/auth/register  → Create a new customer account
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { NextResponse } from 'next/server'
 * import bcrypt from 'bcryptjs'
 * import db from '@/lib/db'
 *
 * export async function POST(request) {
 *   // STEP 1 — Parse body
 *   //   const { name, email, password } = await request.json()
 *
 *   // STEP 2 — Validate inputs (manual validation — no Zod)
 *   //   - name: required, non-empty
 *   //   - email: required, valid email format (use regex or simple .includes('@'))
 *   //   - password: required, minimum 8 characters
 *   //   Return 400 with field-specific error messages if invalid
 *
 *   // STEP 3 — Check for existing user
 *   //   db.user.findUnique({ where: { email } })
 *   //   If user exists → return 409 Conflict: 'Email already in use'
 *
 *   // STEP 4 — Hash password
 *   //   const hashedPassword = await bcrypt.hash(password, 10)
 *   //   (10 salt rounds is the industry standard — balances security and speed)
 *
 *   // STEP 5 — Create user
 *   //   db.user.create({ data: { name, email, password: hashedPassword, role: 'CUSTOMER' } })
 *
 *   // STEP 6 — Return success (don't return the password!)
 *   //   return NextResponse.json({ message: 'Account created' }, { status: 201 })
 * }
 */
