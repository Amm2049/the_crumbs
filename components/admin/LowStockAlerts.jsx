'use client'

import { useState } from 'react'
import { AlertTriangle, ChevronDown, Pencil, Package, Image as ImageIcon } from 'lucide-react'

function stockTier(stock) {
  if (stock === 0) return { label: 'Out of stock', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-900/30', dot: 'bg-red-500', pulse: true }
  if (stock <= 3) return { label: 'Critical', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 ring-orange-200 dark:ring-orange-900/30', dot: 'bg-orange-500', pulse: false }
  return { label: 'Low', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 ring-yellow-200 dark:ring-yellow-900/30', dot: 'bg-yellow-500', pulse: false }
}

export default function LowStockAlerts({ products = [] }) {
  const [collapsed, setCollapsed] = useState(false)

  if (products.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-green-100 dark:border-green-900/30 bg-green-50/60 dark:bg-green-900/10 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
          <Package size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-green-800 dark:text-green-300">All products are well-stocked! 🎉</p>
          <p className="text-xs text-green-600 dark:text-green-500">No items below the low-stock threshold.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-amber-900/5">
      {/* Header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition-colors hover:bg-amber-50/40 dark:hover:bg-zinc-800/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-[var(--bakery-text)]">Low Stock Alerts</p>
            <p className="text-xs text-[var(--bakery-text-muted)]">
              {products.length} product{products.length !== 1 ? 's' : ''} need{products.length === 1 ? 's' : ''} restocking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
            {products.length}
          </span>
          <ChevronDown size={16} className={`text-[var(--bakery-text-muted)] transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </div>
      </button>

      {/* Product list */}
      {!collapsed && (
        <div className="border-t border-amber-50 dark:border-zinc-800">
          <ul className="divide-y divide-amber-50 dark:divide-zinc-800">
            {products.map((p) => {
              const tier = stockTier(p.stock)
              const imageUrl = p.images?.[0]

              return (
                <li key={p.id} className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-amber-50/20 dark:hover:bg-zinc-800/30">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-amber-100 dark:border-zinc-700 bg-amber-50 dark:bg-zinc-800">
                      {imageUrl ? (
                        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${imageUrl}')` }} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-amber-200">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>

                    {/* Name + category */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--bakery-text)]">{p.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--bakery-text-muted)]">
                        {p.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>

                  {/* Stock badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${tier.color}`}>
                      <span className="relative flex h-1.5 w-1.5">
                        {tier.pulse && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />}
                        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${tier.dot}`} />
                      </span>
                      {p.stock} left
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
