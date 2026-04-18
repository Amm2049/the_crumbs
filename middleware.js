/**
 * middleware.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js Middleware — Route Protection
 *
 * This file runs on EVERY request before it hits the page/API route.
 * It uses the Auth.js `auth` function to get the current session and
 * decides whether to allow or redirect the request.
 *
 * ROUTE PROTECTION RULES:
 *   /admin/*   → Must be logged in AND have role === 'ADMIN'
 *                If not logged in → redirect to /login
 *                If logged in but not admin → redirect to / (home)
 *   /cart      → Must be logged in (role: CUSTOMER or ADMIN)
 *   /orders    → Must be logged in
 *   /login     → If already logged in, redirect to / (no reason to see login)
 *   /register  → If already logged in, redirect to /
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * STEP 1 — Import auth from your auth config
 *   import { auth } from '@/lib/auth'
 *   import { NextResponse } from 'next/server'
 *
 * STEP 2 — Export the middleware function
 *   export default auth((req) => {
 *     const { nextUrl, auth: session } = req
 *     const isLoggedIn = !!session
 *     const isAdmin = session?.user?.role === 'ADMIN'
 *     const path = nextUrl.pathname
 *
 *     // Protect /admin routes
 *     if (path.startsWith('/admin')) {
 *       if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
 *       if (!isAdmin) return NextResponse.redirect(new URL('/', nextUrl))
 *     }
 *
 *     // Protect /cart and /orders
 *     if (path === '/cart' || path.startsWith('/orders')) {
 *       if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
 *     }
 *
 *     // Redirect logged-in users away from login/register
 *     if ((path === '/login' || path === '/register') && isLoggedIn) {
 *       return NextResponse.redirect(new URL('/', nextUrl))
 *     }
 *   })
 *
 * STEP 3 — Export the config matcher
 *   Tells Next.js WHICH paths to run this middleware on.
 *   Without this, middleware runs on EVERY request including static files.
 *
 *   export const config = {
 *     matcher: ['/admin/:path*', '/cart', '/orders/:path*', '/login', '/register'],
 *   }
 */
