'use client'

import { useMemo, useState, useRef, useEffect, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { ChevronLeft, ChevronRight, ChevronDown, Check, Loader2, Calendar, ShoppingBag, User, Hash } from 'lucide-react'
import OrderModal from './OrderModal'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-100 dark:border-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-400', hoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30', label: 'Pending' },
  PROCESSING: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-400', hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/30', label: 'Processing' },
  READY: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-400', hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30', label: 'Ready' },
  DELIVERED: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-100 dark:border-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/30', label: 'Delivered' },
  CANCELLED: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-400', hoverBg: 'hover:bg-red-50 dark:hover:bg-red-900/30', label: 'Cancelled' },
}
const ALL_STATUSES = Object.keys(STATUS_CONFIG)

// ─── Skeleton Row ────────────────────────────────────────────────────────────
function SkeletonRow({ compact }) {
  return (
    <tr className="animate-pulse border-b border-amber-50/50 dark:border-zinc-800/50">
      <td className="px-6 py-4"><div className="h-4 w-20 rounded-lg bg-amber-50 dark:bg-zinc-800" /></td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-amber-50" />
          <div className="space-y-1.5">
            <div className="h-3 w-24 rounded-lg bg-amber-50" />
            <div className="h-2 w-32 rounded-lg bg-amber-50/60" />
          </div>
        </div>
      </td>
      {!compact && <td className="px-6 py-4"><div className="h-4 w-16 rounded-lg bg-amber-50" /></td>}
      <td className="px-6 py-4"><div className="mx-auto h-4 w-8 rounded-lg bg-amber-50" /></td>
      <td className="px-6 py-4"><div className="h-4 w-12 rounded-lg bg-amber-50" /></td>
      <td className="px-6 py-4"><div className="mx-auto h-7 w-20 rounded-full bg-amber-50 dark:bg-zinc-800" /></td>
      <td className="px-6 py-4"><div className="mx-auto h-8 w-24 rounded-xl bg-amber-50 dark:bg-zinc-800" /></td>
    </tr>
  )
}

// ─── Status badge (read-only pill) ───────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label ?? status}
    </span>
  )
}

// ─── Custom status status dropdown ───────────────────────────────────────────
function StatusDropdown({ orderId, currentStatus, onStatusChange, isUpdating, onOpenChange }) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const ref = useRef(null)
  const cfg = STATUS_CONFIG[currentStatus] ?? { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-700', dot: 'bg-gray-400', label: currentStatus }

  useEffect(() => {
    if (!open) return
    
    // Check if we should open upwards
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      // Only open up if there's significantly more space above AND not enough space below
      setOpenUp(spaceBelow < 300 && spaceAbove > spaceBelow)
    }

    onOpenChange?.(open)

    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    const scrollHandler = () => setOpen(false)
    window.addEventListener('scroll', scrollHandler, true)
    return () => {
      document.removeEventListener('mousedown', handler)
      window.removeEventListener('scroll', scrollHandler, true)
    }
  }, [open, onOpenChange])

  const handleSelect = (status) => {
    setOpen(false)
    if (status !== currentStatus) onStatusChange(orderId, status)
  }

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => setOpen((v) => !v)}
        className={`
          inline-flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-xs font-bold
          transition-all active:scale-95
          disabled:cursor-not-allowed disabled:opacity-60
          ${cfg.bg} ${cfg.border} ${cfg.text}
          ${open ? 'ring-2 ring-amber-100' : ''}
        `}
      >
        {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />}
        <span>{cfg.label}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`
          absolute right-0 z-[100] w-44 animate-fade-up overflow-hidden rounded-2xl border border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl shadow-amber-900/20
          ${openUp ? 'bottom-full mb-2' : 'top-full mt-1.5'}
        `}>
          <div className="p-1.5 space-y-0.5">
            {ALL_STATUSES.map((status) => {
              const c = STATUS_CONFIG[status]
              const isSelected = status === currentStatus
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleSelect(status)}
                  className={`
                    flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors
                    ${isSelected ? `${c.bg} ${c.text}` : `text-[var(--bakery-text-muted)] ${c.hoverBg}`}
                  `}
                >
                  <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                  <span className="flex-1 text-left">{c.label}</span>
                  {isSelected && <Check size={12} className="shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Pagination bar ──────────────────────────────────────────────────────────
function PaginationBar({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-amber-100 dark:border-zinc-800 px-5 py-3">
      <p className="text-xs font-semibold text-[var(--bakery-text-muted)]">
        Page <span className="text-[var(--bakery-text)]">{page}</span> of <span className="text-[var(--bakery-text)]">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 dark:border-zinc-700 text-[var(--bakery-text)] transition-colors hover:bg-amber-50 dark:hover:bg-zinc-800 disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors ${p === page ? 'bg-amber-500 text-white shadow-md' : 'border border-amber-200 dark:border-zinc-700 text-[var(--bakery-text)] hover:bg-amber-50 dark:hover:bg-zinc-800'
              }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 dark:border-zinc-700 text-[var(--bakery-text)] transition-colors hover:bg-amber-50 dark:hover:bg-zinc-800 disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Reusable Filter Dropdown ────────────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange, icon: Icon }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(opt => opt.value === value) || options[0]

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all active:scale-95
          ${open ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 ring-2 ring-amber-100 dark:ring-amber-900/30' : 'border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[var(--bakery-text-muted)] hover:border-amber-400 dark:hover:border-amber-500'}
        `}
      >
        <Icon size={14} className={open ? 'text-amber-600' : 'text-amber-400'} />
        <span>{selected.label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''} text-amber-500`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-[100] mt-1.5 w-48 animate-fade-up overflow-hidden rounded-2xl border border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl shadow-amber-900/20">
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`
                    flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors
                    ${isSelected ? 'bg-amber-500 text-white' : 'text-[var(--bakery-text)] hover:bg-amber-50 dark:hover:bg-zinc-800'}
                  `}
                >
                  <span className="flex-1 text-left">{opt.label}</span>
                  {isSelected && <Check size={12} className="shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OrdersTable({ orders = [], page = 1, totalPages = 1, total = 0, compact = false }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [isPending, startTransition] = useTransition()
  
  const [pendingOrderId, setPendingOrderId] = useState('')
  const [localStatus, setLocalStatus] = useState({})
  const [openDropdownId, setOpenDropdownId] = useState(null)
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Current filter values from URL
  const currentMonth = searchParams.get('month') || ''
  const currentYear = searchParams.get('year') || ''

  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
  ]

  const years = [
    { value: '', label: 'All Years' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
  ]

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.set('page', '1') // Reset to first page when filtering
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handlePageChange = (p) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }
  const normalizedOrders = useMemo(() => (Array.isArray(orders) ? orders : []), [orders])

  const handleStatusChange = async (orderId, newStatus) => {
    const prevStatus = localStatus[orderId] ?? normalizedOrders.find(o => o.id === orderId)?.status
    setPendingOrderId(orderId)
    setLocalStatus((prev) => ({ ...prev, [orderId]: newStatus }))

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      addToast(`Order updated ✓`, 'success')

      // Update selected order if modal is open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }))
      }

      router.refresh()
    } catch {
      setLocalStatus((prev) => ({ ...prev, [orderId]: prevStatus }))
      addToast('Error updating status.', 'error')
    } finally {
      setPendingOrderId('')
    }
  }

  const openOrderDetails = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-black text-[var(--bakery-text)]">Customer Orders</h2>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">({total} total)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Month"
              value={currentMonth}
              options={months}
              onChange={(val) => handleFilterChange('month', val)}
              icon={Calendar}
            />

            <FilterDropdown
              label="Year"
              value={currentYear}
              options={years}
              onChange={(val) => handleFilterChange('year', val)}
              icon={Hash}
            />
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-amber-900/5">
        <div className={`overflow-x-auto rounded-3xl ${normalizedOrders.length > 0 && normalizedOrders.length < 5 ? 'min-h-[420px]' : ''}`}>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-amber-50/40 dark:bg-zinc-800/50 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--bakery-text-muted)]">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                {!compact && <th className="px-6 py-4">Date</th>}
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 dark:divide-zinc-800">
              {isPending ? (
                Array.from({ length: compact ? 5 : 10 }).map((_, i) => <SkeletonRow key={i} compact={compact} />)
              ) : normalizedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center text-[var(--bakery-text-muted)] font-bold">No orders found.</td>
                </tr>
              ) : (
                normalizedOrders.map((order) => {
                  const currentStatus = localStatus[order.id] ?? order.status
                  const isUpdating = pendingOrderId === order.id
                  return (
                    <tr
                      key={order.id}
                      onClick={() => openOrderDetails({ ...order, status: currentStatus })}
                      className={`group cursor-pointer transition-colors hover:bg-amber-50/40 dark:hover:bg-zinc-800/30 ${openDropdownId === order.id ? 'relative z-50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Hash size={12} className="text-amber-500 opacity-50" />
                          <span className="font-mono text-[10px] font-black text-[var(--bakery-text)]">
                            {order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 dark:bg-zinc-800 text-[10px] font-black text-amber-700 dark:text-amber-400">
                            {order.user?.name?.charAt(0) || <User size={12} />}
                          </div>
                          <div>
                            <p className="font-black text-[var(--bakery-text)]">{order.user?.name || 'Guest'}</p>
                            <p className="text-[10px] font-bold text-[var(--bakery-text-muted)] lowercase">{order.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      {!compact && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[var(--bakery-text-muted)]">
                            <Calendar size={12} className="opacity-40" />
                            <span className="text-[11px] font-bold">
                              {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(order.createdAt))}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <ShoppingBag size={12} className="text-amber-500 opacity-40" />
                          <span className="text-xs font-black text-[var(--bakery-text)]">{order.items?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-amber-700 dark:text-amber-400">${Number(order.total).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={currentStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <StatusDropdown
                            orderId={order.id}
                            currentStatus={currentStatus}
                            onStatusChange={handleStatusChange}
                            isUpdating={isUpdating}
                            onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? order.id : null)}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {!compact && <PaginationBar page={page} totalPages={totalPages} onPageChange={handlePageChange} />}
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={pendingOrderId !== ''}
      />
    </div>
  )
}
