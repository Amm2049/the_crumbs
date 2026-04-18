/**
 * components/client/Footer.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Storefront Footer — Simple Server Component
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import Link from 'next/link'
 *
 * export default function Footer() {
 *   return (
 *     <footer className="border-t py-8 mt-auto">
 *       <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-4">
 *         <div>
 *           <p className="font-bold">The Crumbs 🥐</p>
 *           <p className="text-sm text-muted-foreground">Fresh baked with love, every day.</p>
 *         </div>
 *         <div className="flex gap-6 text-sm">
 *           <Link href="/products">Shop</Link>
 *           <Link href="/orders">My Orders</Link>
 *           <Link href="/cart">Cart</Link>
 *         </div>
 *         <p className="text-xs text-muted-foreground">
 *           © {new Date().getFullYear()} The Crumbs. All rights reserved.
 *         </p>
 *       </div>
 *     </footer>
 *   )
 * }
 */
