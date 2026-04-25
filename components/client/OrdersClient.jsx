'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import Pagination from '@/components/shared/Pagination'
// REMOVED: import { apiGet } from '@/lib/api-client' - this is server-only!

async function fetchJson(path) {
  const res = await fetch(path, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const payload = await res.json()
      if (payload?.error) message = payload.error
    } catch { /* ignore */ }
    throw new Error(message)
  }

  return res.json()
}

const statusClasses = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  READY: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400',
  DELIVERED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export default function OrdersClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  const currentPage = Number(searchParams.get('page')) || 1
  const itemsPerPage = 5

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true)
      setError('')
      try {
        const result = await fetchJson('/api/orders')
        // API now returns { data, total, page, totalPages }
        const list = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
        setOrders(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [])

  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  
  const paginatedOrders = useMemo(() => {
    return orders.slice(startIndex, startIndex + itemsPerPage)
  }, [orders, startIndex])

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/orders?${params.toString()}`, { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-amber-100 dark:bg-zinc-800" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 w-full animate-pulse rounded-2xl bg-amber-50 dark:bg-zinc-800/50" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-14 text-center">
        <p className="text-red-600 font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-bold text-amber-600 underline">Try again</button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-[var(--bakery-text)]">My Orders</h1>
        <p className="mt-3 text-[var(--bakery-text-muted)]">You have not placed any orders yet.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/products" className="mb-2 flex w-fit items-center gap-1 text-sm font-bold uppercase tracking-widest text-amber-600/60 transition-colors hover:text-amber-700">
        <ChevronLeft size={16} />
        Continue Shopping
      </Link>
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-[var(--bakery-text)]">My Orders</h1>
        <p className="text-sm font-medium text-[var(--bakery-text-muted)]">Manage and track your recent bakery treats.</p>
      </div>

      <div className="space-y-4">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) => (
            <article 
              key={order.id} 
              className="group relative rounded-2xl border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-amber-900/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[var(--bakery-text)]">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs font-medium text-[var(--bakery-text-muted)]">Placed on {formatDate(order.createdAt)}</p>
                </div>

                <span
                  className={[
                    'rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider',
                    statusClasses[order.status] || 'bg-gray-100 text-gray-700',
                  ].join(' ')}
                >
                  {order.status}
                </span>
              </div>

              <ul className="mt-4 space-y-2 border-y border-amber-50 dark:border-zinc-800/50 py-3 text-sm text-[var(--bakery-text)]">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between">
                    <span className="font-medium">{item.product?.name || 'Product'}</span>
                    <span className="text-xs font-bold text-amber-700">x{item.quantity}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-amber-600/60">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--bakery-text-muted)]">Total Amount</p>
                  <p className="text-xl font-black text-[var(--bakery-text)]">${Number(order.total ?? 0).toFixed(2)}</p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-amber-100 dark:border-zinc-800 bg-amber-50/30 dark:bg-zinc-900/30 py-12 text-center">
            <p className="text-sm font-medium text-[var(--bakery-text-muted)]">No orders found on this page.</p>
            <button 
              onClick={() => handlePageChange(1)}
              className="mt-2 text-xs font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 underline underline-offset-4"
            >
              Back to first page
            </button>
          </div>
        )}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={orders.length}
        startIndex={startIndex}
        label="orders"
      />
    </div>
  )
}
