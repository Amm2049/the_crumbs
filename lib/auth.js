/**
 * lib/auth.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth.js v5 (NextAuth) configuration.
 * This file sets up authentication with the Credentials provider only (v1).
 * It exports: handlers, auth, signIn, signOut
 *
 * The `auth` export is used in:
 *   - Server components   → to get the current session on the server
 *   - API routes          → to protect routes
 *   - middleware.js       → to protect entire route segments
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * STEP 1 — Imports
 *   import NextAuth from 'next-auth'
 *   import CredentialsProvider from 'next-auth/providers/credentials'
 *   import bcrypt from 'bcryptjs'
 *   import db from '@/lib/db'
 *
 * STEP 2 — Configure NextAuth
 *   Call NextAuth({ ... }) with the following options:
 *
 *   providers: [
 *     CredentialsProvider({
 *       name: 'Credentials',
 *       credentials: {
 *         email: { label: 'Email', type: 'email' },
 *         password: { label: 'Password', type: 'password' },
 *       },
 *       async authorize(credentials) {
 *         // 1. Find user by email in DB using Prisma
 *         //    Import from '@/lib/generated/prisma'
 *         // 2. If user not found, return null (Auth.js will throw CredentialsSignin error)
 *         // 3. Compare credentials.password with user.password using bcrypt.compare()
 *         // 4. If passwords don't match, return null
 *         // 5. Return the user object: { id, name, email, role }
 *         //    (only return safe fields — NOT the password)
 *       },
 *     }),
 *   ],
 *
 *   session: {
 *     strategy: 'jwt', // Store session as JWT cookie, not in DB
 *   },
 *
 *   callbacks: {
 *     // jwt() runs when a JWT is created or updated
 *     // Attach user.id and user.role to the token so they persist in the cookie
 *     async jwt({ token, user }) {
 *       if (user) {
 *         token.id = user.id
 *         token.role = user.role
 *       }
 *       return token
 *     },
 *
 *     // session() runs when session is accessed on the client or server
 *     // Expose token.id and token.role on session.user
 *     async session({ session, token }) {
 *       session.user.id = token.id
 *       session.user.role = token.role
 *       return session
 *     },
 *   },
 *
 *   pages: {
 *     signIn: '/login',    // Redirect here for login
 *     error: '/login',     // Redirect here on auth errors
 *   },
 *
 * STEP 3 — Export
 *   export const { handlers, auth, signIn, signOut } = NextAuth({ ... })
 */
