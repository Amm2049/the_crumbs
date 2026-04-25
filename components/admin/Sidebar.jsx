'use client'

import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Package, ShoppingBag, Tag, Users, LogOut, ExternalLink, X } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'
import Link from 'next/link'
import Image from 'next/image'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
]

function isActive(pathname, href) {
  if (href === '/admin/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Sidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, setSidebarOpen } = useAdmin()

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-[#1A0E08]/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar aside */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] flex w-64 flex-col border-r border-amber-100 dark:border-zinc-800 bg-[var(--bakery-bg)] transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo & Close Button (Mobile only) */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-amber-100 dark:border-zinc-800 px-5">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2">
            <Image
              src="/the_crumbs_logo.png"
              alt="The Crumbs"
              width={320}
              height={92}
              className="h-10 w-auto"
            />
            <div className="leading-tight">
              <p className="whitespace-nowrap text-sm font-extrabold tracking-tight text-[var(--bakery-text)]">
                The Crumbs
              </p>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600">
                Admin
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-2 text-[var(--bakery-text-muted)] hover:bg-amber-50 dark:hover:bg-zinc-800 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--bakery-text-muted)] opacity-60">
            Menu
          </p>
          {navItems.map((item) => {
            const active = isActive(pathname, item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all
                  ${active
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                    : 'text-[var(--bakery-text-muted)] hover:bg-amber-100/70 dark:hover:bg-zinc-800 hover:text-amber-800 dark:hover:text-amber-400'}
                `}
              >
                <Icon size={17} className={active ? 'text-white' : 'text-amber-700 dark:text-amber-500'} />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-amber-100 dark:border-zinc-800 px-3 py-4 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-amber-700 dark:text-amber-500 transition-colors hover:bg-amber-100/70 dark:hover:bg-zinc-800"
          >
            <ExternalLink size={17} />
            <span>View Storefront</span>
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
