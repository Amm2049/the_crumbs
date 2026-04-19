/**
 * proxy.js  (Next.js 16 — replaces middleware.js)
 * ─────────────────────────────────────────────────────────────────────────────
 * Route protection middleware.
 * Imports ONLY from auth.config.js (Edge-safe — no Prisma, no bcrypt).
 */

import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session
  const isAdmin = session?.user?.role === 'ADMIN'
  const path = nextUrl.pathname

  if (path.startsWith('/admin')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
    if (!isAdmin) return NextResponse.redirect(new URL('/', nextUrl))
  }

  if (path === '/cart' || path.startsWith('/orders')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if ((path === '/login' || path === '/register') && isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }
})

export const config = {
  matcher: ['/admin/:path*', '/cart', '/orders/:path*', '/login', '/register'],
}
