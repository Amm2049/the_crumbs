'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOut, ChevronDown, Settings, Menu, BellRing } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import StockAlertBell from '@/components/admin/StockAlertBell'
import Image from 'next/image'
import { useAdmin } from '@/context/AdminContext'
import { usePusher } from '@/hooks/usePusher'

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'

    // Play Dual-Tone bell sound
    osc.frequency.setValueAtTime(587.33, ctx.currentTime)
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12)

    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch (error) {
    console.error('Audio chime error:', error)
  }
}

export default function AdminNavbar() {
  const { data: session } = useSession()
  const user = session?.user
  const [menuOpen, setMenuOpen] = useState(false)
  const { toggleSidebar } = useAdmin()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  // Realtime Noti and Sound
  const { client } = usePusher()
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'amber') {
    setToast({ message, type })
    // Auto-dismiss toast in 5 seconds
    setTimeout(() => setToast(null), 5000)
  }

  useEffect(() => {
    if (!client) return
    const channel = client.subscribe('private-admin')

    // 1. New Order Alert
    channel.bind('new-order', (data) => {
      playChime()
      showToast(`🎉 New order received! Total: $${Number(data.total).toFixed(2)} by ${data.customerName}`, 'amber')
    })

    // 2. Order Cancelled Alert
    channel.bind('order-cancelled', (data) => {
      playChime()
      showToast(`❌ Order #${data.id.slice(0, 8)} was cancelled by ${data.customerName}`, 'red')
    })

    // 3. Low stock warning
    channel.bind('low-stock', (data) => {
      showToast(`⚠️ Low Stock Alert: "${data.name}" has only ${data.stock} items left!`, 'amber')
    })

    return () => {
      channel.unbind_all()
      client.unsubscribe('private-admin')
    }
  }, [client])

  return (
    <>
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
          <StockAlertBell />

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
                  alt={user.name || 'Admin'}
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
                        alt={user.name || 'Admin'}
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
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[9999] flex max-w-sm items-center gap-3.5 rounded-2xl border p-4 animate-bounce ${
          toast.type === 'red'
            ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30 shadow-lg shadow-red-500/5'
            : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-amber-400/20 shadow-[0_10px_35px_rgba(245,158,11,0.35)] dark:shadow-[0_10px_35px_rgba(245,158,11,0.15)]'
        }`}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
            toast.type === 'red'
              ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
              : 'bg-white/25 text-white'
          }`}>
            <BellRing size={16} className="animate-wiggle" />
          </div>
          <p className="text-xs font-black tracking-wide leading-relaxed">{toast.message}</p>
        </div>
      )}
    </>
  )
}
