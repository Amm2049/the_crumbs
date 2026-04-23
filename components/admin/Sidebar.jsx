'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Tag, Users } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
]

function isActive(pathname, href) {
  if (href === '/admin/dashboard') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-amber-100 bg-[#FFFDF2] md:min-h-screen md:w-64 md:border-r">
      <div className="border-b border-amber-100 px-4 py-4 md:border-b-0">
        <div className="inline-flex items-center gap-1">
          <Image src="/the-crumbs-logo.png" alt="The Crumbs" width={320} height={92} className="h-12 w-auto" />
          <div className="leading-tight">
            <p className="whitespace-nowrap text-base font-extrabold tracking-tight text-[#5C3A21]">The Crumbs</p>
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8A6D5E]">Admin</span>
          </div>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-3 py-3 md:flex-col md:gap-1 md:px-4 md:py-4">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                active
                  ? 'bg-amber-200/70 text-[#5C3A21]'
                  : 'text-[#6B4C3B] hover:bg-amber-100/70 hover:text-amber-700',
              ].join(' ')}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <div className="mt-4 border-t border-amber-100 pt-4">
          <Link
            href="/"
            className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100/70"
          >
            <ShoppingBag size={18} />
            <span>View Storefront</span>
          </Link>
        </div>
      </nav>
    </aside>
  )
}
