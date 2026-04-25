'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOut, ChevronDown, User as UserIcon, Settings, Menu } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import Image from 'next/image'
import { useAdmin } from '@/context/AdminContext'

export default function AdminNavbar() {
  const { data: session } = useSession()
  const user = session?.user
  const [menuOpen, setMenuOpen] = useState(false)
  const { toggleSidebar } = useAdmin()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-amber-100 dark:border-zinc-800 bg-[var(--bakery-bg)]/95 px-4 sm:px-6 backdrop-blur-sm">
      {/* Left: Hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-xl border border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-[var(--bakery-text-muted)] shadow-sm lg:hidden hover:bg-amber-50 dark:hover:bg-zinc-800"
        >
          <Menu size={20} />
        </button>
        <div className="hidden xs:flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Right: account info + sign-out */}
      <div className="relative flex items-center gap-3">
        {/* Account pill */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-1.5 pr-3 py-1.5 text-sm font-semibold text-[var(--bakery-text)] shadow-sm transition-all hover:bg-amber-50 dark:hover:bg-zinc-800 hover:shadow-md"
        >
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-500 text-[11px] font-black text-white">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "Admin"}
                width={32}
                height={32}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <span className="hidden sm:block max-w-[140px] truncate">{user?.name ?? 'Admin'}</span>
          <ChevronDown size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 animate-fade-up rounded-2xl border border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 shadow-xl shadow-amber-900/10">
            {/* Account info */}
            <div className="mb-2 rounded-xl bg-amber-50/70 dark:bg-zinc-800/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-500 text-sm font-black text-white">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Admin"}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--bakery-text)]">{user?.name ?? 'Admin User'}</p>
                  <p className="truncate text-xs text-[var(--bakery-text-muted)] font-medium">{user?.email ?? ''}</p>
                  <span className="mt-1 inline-block rounded-full bg-amber-200 dark:bg-amber-900/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-400">
                    Admin
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                href="/admin/profile"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-[var(--bakery-text-muted)] transition-colors hover:bg-amber-50 dark:hover:bg-zinc-800"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  <Settings size={14} />
                </div>
                Account Settings
              </Link>

              {/* Sign out */}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                  <LogOut size={14} />
                </div>
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Click-away overlay */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setMenuOpen(false)}
          />
        )}
        
        <div className="ml-1 border-l border-amber-100 dark:border-zinc-800 pl-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
