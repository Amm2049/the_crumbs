/**
 * components/admin/Sidebar.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin Sidebar Navigation  (Client Component)
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 'use client'
 *
 * import Link from 'next/link'
 * import { usePathname } from 'next/navigation'
 * import { LayoutDashboard, Package, ShoppingBag, Tag, Users } from 'lucide-react'
 *
 * const navItems = [
 *   { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
 *   { href: '/admin/products',  label: 'Products',  icon: Package },
 *   { href: '/admin/orders',    label: 'Orders',    icon: ShoppingBag },
 *   { href: '/admin/categories',label: 'Categories',icon: Tag },
 *   { href: '/admin/customers', label: 'Customers', icon: Users },
 * ]
 *
 * export default function Sidebar() {
 *   const pathname = usePathname()
 *
 *   // Highlight the active nav item by comparing pathname with item.href
 *   // Use pathname.startsWith(item.href) for nested routes
 *
 *   return (
 *     <aside className="w-64 h-screen ...">
 *       <div>The Crumbs logo</div>
 *       <nav>
 *         {navItems.map(item => (
 *           <Link
 *             key={item.href}
 *             href={item.href}
 *             className={`... ${pathname.startsWith(item.href) ? 'active styles' : ''}`}
 *           >
 *             <item.icon size={20} />
 *             {item.label}
 *           </Link>
 *         ))}
 *       </nav>
 *     </aside>
 *   )
 * }
 */
