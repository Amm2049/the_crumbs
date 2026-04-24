// use for check role, if not admin can't access admin page
// if not login can't access cart page

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session
  const isAdmin = session?.user?.role === 'ADMIN'
  const path = nextUrl.pathname


  //Frontend protection
  // Users cannot access admin page
  if (path.startsWith('/admin')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
    if (!isAdmin) return NextResponse.redirect(new URL('/', nextUrl))
  }

  //users cannot access cart and orders page if not logged in 
  if (path === '/cart' || path.startsWith('/orders')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
  }

  //Admins cannot access the shopping cart or frontend orders page
  if ((path === '/cart' || path.startsWith('/orders')) && isAdmin) {
    return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
  }

  //Prevent login and register if already logged in
  if ((path === '/login' || path === '/register') && isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }


  //Backend API protection
  if (path.startsWith('/api')) {

    const AdminOnlyRoute = path.startsWith('/api/categories') || path.startsWith('/api/products')
    const isWriteMethod = ['POST', 'PATCH', 'DELETE'].includes(req.method)

    // Categories and products - Only Admin can modify
    if (AdminOnlyRoute && isWriteMethod) {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
      }
    }

    // Cart - Only Customers (Admins shouldn't have a cart)
    if (path.startsWith('/api/cart') && (!isLoggedIn || isAdmin)) {
      const error = !isLoggedIn ? 'Unauthorized' : 'Forbidden - Admins do not have carts'
      return NextResponse.json({ error }, { status: !isLoggedIn ? 401 : 403 })
    }

    // Orders - Must be logged in
    if (path.startsWith('/api/orders') && !isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Orders - Only Admin can update status
    if (path.startsWith('/api/orders/') && req.method === 'PATCH' && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Admin APIs
    if (path.startsWith('/api/admin') && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }




  }

})

export const config = {
  matcher: ['/admin/:path*', '/cart', '/orders/:path*', '/login', '/register', '/api/:path*'],
}
