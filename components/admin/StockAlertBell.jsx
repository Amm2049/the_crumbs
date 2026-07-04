'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Image as ImageIcon } from 'lucide-react'

function stockTier(stock) {
  if (stock === 0) return { color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-900/30', dot: 'bg-red-500', pulse: true }
  if (stock <= 3) return { color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 ring-orange-200 dark:ring-orange-900/30', dot: 'bg-orange-500', pulse: false }
  return { color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 ring-yellow-200 dark:ring-yellow-900/30', dot: 'bg-yellow-500', pulse: false }
}

export default function StockAlertBell() {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard/low-stock')
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data?.products) ? data.products : [])
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const count = products.length

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[var(--bakery-text-muted)] shadow-sm transition-all hover:bg-amber-50 dark:hover:bg-zinc-800 hover:text-amber-700 dark:hover:text-amber-400"
        title="Stock Alerts"
      >
        <AlertTriangle size={17} />

        {/* Badge */}
        {!loading && count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow-sm shadow-red-500/30">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown popover */}
      {open && (
        <>
          {/* Click-away overlay */}
          <div className="fixed inset-0 z-[-1]" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-80 animate-fade-up rounded-2xl border border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl shadow-amber-900/10 z-50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-50 dark:border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500" />
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[var(--bakery-text)]">
                  Stock Alerts
                </p>
              </div>
              {count > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[9px] font-black text-white">
                  {count}
                </span>
              )}
            </div>

            {/* Body */}
            <div className="max-h-72 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
                </div>
              ) : count === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">All stocked up! 🎉</p>
                  <p className="mt-1 text-[11px] text-[var(--bakery-text-muted)]">No products below threshold.</p>
                </div>
              ) : (
                <ul className="divide-y divide-amber-50 dark:divide-zinc-800">
                  {products.map((p) => {
                    const tier = stockTier(p.stock)
                    const imageUrl = p.images?.[0]

                    return (
                      <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-amber-50/30 dark:hover:bg-zinc-800/30">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Thumbnail */}
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-amber-100 dark:border-zinc-700 bg-amber-50 dark:bg-zinc-800">
                            {imageUrl ? (
                              <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${imageUrl}')` }} />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-amber-200">
                                <ImageIcon size={12} />
                              </div>
                            )}
                          </div>

                          {/* Name + category */}
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[var(--bakery-text)]">{p.name}</p>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--bakery-text-muted)]">
                              {p.category?.name || 'Uncategorized'}
                            </p>
                          </div>
                        </div>

                        {/* Stock badge */}
                        <span className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ring-1 ${tier.color}`}>
                          <span className="relative flex h-1.5 w-1.5">
                            {tier.pulse && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />}
                            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${tier.dot}`} />
                          </span>
                          {p.stock} left
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {count > 0 && (
              <div className="border-t border-amber-50 dark:border-zinc-800 px-4 py-2.5">
                <a
                  href="/admin/products"
                  className="block text-center text-[10px] font-black uppercase tracking-[0.15em] text-amber-600 dark:text-amber-500 transition-colors hover:text-amber-700 dark:hover:text-amber-400"
                >
                  View All Products →
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
