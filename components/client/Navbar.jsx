/**
 * components/client/Navbar.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Storefront Navigation Bar  (Client Component)
 *
 * Sticky top navbar visible on all client pages.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 'use client'
 *
 * import Link from 'next/link'
 * import { useSession, signOut } from 'next-auth/react'
 * import { ShoppingCart, User, LogOut } from 'lucide-react'
 * import useSWR from 'swr'
 *
 * export default function Navbar() {
 *   const { data: session } = useSession()
 *
 *   // Fetch cart to show item count badge
 *   // Only fetch if user is logged in
 *   const { data: cartItems } = useSWR(
 *     session ? '/api/cart' : null,
 *     (url) => fetch(url).then(r => r.json())
 *   )
 *   const cartCount = cartItems?.length ?? 0
 *
 *   return (
 *     <nav className="sticky top-0 z-50 border-b bg-background ...">
 *       <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
 *
 *         {/* Logo *\/}
 *         <Link href="/">The Crumbs 🥐</Link>
 *
 *         {/* Main Links *\/}
 *         <div className="flex gap-6">
 *           <Link href="/">Home</Link>
 *           <Link href="/products">Shop</Link>
 *         </div>
 *
 *         {/* Right Side *\/}
 *         <div className="flex items-center gap-4">
 *           {session ? (
 *             <>
 *               <Link href="/cart" className="relative">
 *                 <ShoppingCart size={22} />
 *                 {cartCount > 0 && (
 *                   <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
 *                     {cartCount}
 *                   </span>
 *                 )}
 *               </Link>
 *               <Link href="/orders"><User size={22} /></Link>
 *               <button onClick={() => signOut()}>Sign Out</button>
 *             </>
 *           ) : (
 *             <>
 *               <Link href="/login">Sign In</Link>
 *               <Link href="/register">Sign Up</Link>
 *             </>
 *           )}
 *         </div>
 *       </div>
 *     </nav>
 *   )
 * }
 */
