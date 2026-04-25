'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, User, Mail, Hash, ShoppingBag, MessageSquare, Loader2, Check, ChevronDown } from 'lucide-react'

// Reuse the status config from the table for consistency
const STATUS_CONFIG = {
  PENDING:    { bg: 'bg-yellow-50 dark:bg-yellow-900/20',  border: 'border-yellow-100 dark:border-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400',  dot: 'bg-yellow-400',  hoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30',  label: 'Pending'    },
  PROCESSING: { bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-100 dark:border-blue-900/30',   text: 'text-blue-700 dark:text-blue-400',    dot: 'bg-blue-400',    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',    label: 'Processing' },
  READY:      { bg: 'bg-indigo-50 dark:bg-indigo-900/20',  border: 'border-indigo-100 dark:border-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400',  dot: 'bg-indigo-400',  hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30',  label: 'Ready'      },
  DELIVERED:  { bg: 'bg-green-50 dark:bg-green-900/20',   border: 'border-green-100 dark:border-green-900/30',  text: 'text-green-700 dark:text-green-400',   dot: 'bg-green-500',   hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/30',   label: 'Delivered'  },
  CANCELLED:  { bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-100 dark:border-red-900/30',    text: 'text-red-700 dark:text-red-400',     dot: 'bg-red-400',     hoverBg: 'hover:bg-red-50 dark:hover:bg-red-900/30',     label: 'Cancelled'  },
}

export default function OrderModal({ isOpen, onClose, order, onStatusChange, isUpdatingStatus }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted || !order) return null

  const cfg = STATUS_CONFIG[order.status] ?? { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-700', dot: 'bg-gray-400', label: order.status }

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A0E08]/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl animate-fade-up overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-amber-50 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-50 dark:border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-500">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--bakery-text)]">Order Details</h2>
              <div className="flex items-center gap-2">
                <Hash size={12} className="text-amber-500 opacity-50" />
                <span className="font-mono text-[10px] font-black uppercase text-[var(--bakery-text-muted)]">
                  {order.id}
                </span>
              </div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="rounded-full p-2 text-[#B09080] dark:text-[#8A6D5E] transition-colors hover:bg-amber-50 dark:hover:bg-zinc-800 hover:text-amber-700 dark:hover:text-amber-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-8">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Customer Info */}
            <div className="space-y-4 rounded-2xl border border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 p-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bakery-text-muted)]">Customer</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-zinc-700 text-[10px] font-black text-amber-700 dark:text-amber-400 shadow-sm ring-1 ring-amber-50 dark:ring-zinc-600">
                    {order.user?.name?.charAt(0) || <User size={12} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--bakery-text)]">{order.user?.name || 'Guest'}</p>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--bakery-text-muted)]">
                      <Mail size={10} className="opacity-50" />
                      {order.user?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="space-y-4 rounded-2xl border border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 p-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bakery-text-muted)]">Order Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--bakery-text-muted)]">
                    <Calendar size={12} className="opacity-50" />
                    <span className="text-[11px] font-bold">Placed on</span>
                  </div>
                  <span className="text-xs font-black text-[var(--bakery-text)]">
                    {new Intl.DateTimeFormat('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(new Date(order.createdAt))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[var(--bakery-text-muted)]">Status</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="space-y-3 rounded-2xl border border-amber-100 dark:border-zinc-700 bg-amber-50/10 dark:bg-zinc-800/30 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500">
                <MessageSquare size={12} />
                <span>Customer Notes</span>
              </div>
              <p className="text-sm italic text-[var(--bakery-text)] leading-relaxed">
                "{order.notes}"
              </p>
            </div>
          )}

          {/* Items List */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bakery-text-muted)]">Order Items</h3>
            <div className="overflow-hidden rounded-2xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <table className="w-full text-left">
                <thead className="bg-amber-50/40 dark:bg-zinc-800/50 text-[9px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50 dark:divide-zinc-800">
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-amber-50 dark:bg-zinc-800 shadow-inner">
                            {item.product?.images?.[0] ? (
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-amber-200 dark:text-zinc-700">
                                <ShoppingBag size={16} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-black text-[var(--bakery-text)]">{item.product?.name}</p>
                            <p className="text-[10px] font-bold text-[var(--bakery-text-muted)]">
                              {item.product?.category?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-black text-[var(--bakery-text)]">× {item.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold text-[var(--bakery-text-muted)]">${Number(item.price).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                          ${(item.quantity * item.price).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer with Total */}
        <div className="flex items-center justify-between border-t border-amber-50 dark:border-zinc-800 bg-amber-50/30 dark:bg-zinc-800/30 px-6 py-5">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bakery-text-muted)]">Total Amount</span>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400">${Number(order.total).toFixed(2)}</span>
          </div>
          
          <button 
            type="button" 
            onClick={onClose}
            className="rounded-xl border-2 border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-2.5 text-xs font-black text-amber-700 dark:text-amber-400 transition-all hover:bg-amber-50 dark:hover:bg-zinc-700 active:scale-95 shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
