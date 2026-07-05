'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import Pagination from '@/components/shared/Pagination'
import OrderDetailModal from '@/components/client/OrderDetailModal'
import { useSession } from 'next-auth/react'
import { usePusher } from '@/hooks/usePusher'

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
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const currentPage = Number(searchParams.get('page')) || 1
  const itemsPerPage = 5

  // Pusher 
  const { data: session } = useSession()
  const { client, connectionState } = usePusher()

  useEffect(() => {
    if (!client || !session?.user?.id) return

    const channelName = `private-user-${session.user.id}`
    const channel = client.subscribe(channelName)

    channel.bind('status-changed', (data) => {
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === data.orderId
            ? { ...o, status: data.status, updatedAt: data.updatedAt }
            : o
        )
      )
    })

    // Fallback: If pusher goes offline, fetch status every 15s
    let fallbackInterval = null
    if (connectionState === 'failed' || connectionState === 'unavailable') {
      console.info('Pusher offline, launching fallback polling.')
      fallbackInterval = setInterval(async () => {
        try {
          const result = await fetchJson(`/api/orders?page=${currentPage}&limit=${itemsPerPage}`)
          const list = Array.isArray(result?.data) ? result.data : []
          setOrders(list)
          setTotalPages(result?.totalPages ?? 1)
          setTotalItems(result?.total ?? list.length)
        } catch (error) {
          console.error('Fallback polling error:', error)
        }
      }, 15000)
    }

    return () => {
      channel.unbind('status-changed')
      client.unsubscribe(channelName)
      if (fallbackInterval) clearInterval(fallbackInterval)
    }
  }, [client, session?.user?.id, connectionState, currentPage])

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true)
      setError('')
      try {
        const result = await fetchJson(`/api/orders?page=${currentPage}&limit=${itemsPerPage}`)
        const list = Array.isArray(result?.data) ? result.data : []
        setOrders(list)
        setTotalPages(result?.totalPages ?? 1)
        setTotalItems(result?.total ?? list.length)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [currentPage])

  // Called by the modal after a successful cancellation — re-fetches the current page
  async function handleCancelled() {
    const result = await fetchJson(`/api/orders?page=${currentPage}&limit=${itemsPerPage}`)
    const list = Array.isArray(result?.data) ? result.data : []
    setOrders(list)
    setTotalPages(result?.totalPages ?? 1)
    setTotalItems(result?.total ?? list.length)
  }

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
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 px-8 py-3.5 text-sm font-black tracking-wide text-white shadow-xl shadow-amber-200 dark:shadow-amber-900/30 transition-all duration-300 hover:scale-[1.03] hover:brightness-110 active:scale-[0.97]"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl min-h-[calc(100vh-4rem)] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/products" className="mb-2 flex w-fit items-center gap-1 text-sm font-bold uppercase tracking-widest text-amber-600/60 transition-colors hover:text-amber-700">
        <ChevronLeft size={16} />
        Continue Shopping
      </Link>
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-[var(--bakery-text)]">My Orders</h1>
        <p className="text-sm font-medium text-[var(--bakery-text-muted)]">Manage and track your recent bakery treats.</p>
      </div>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <article
              key={order.id}
              className="group relative rounded-2xl border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-amber-900/5 cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between gap-4">

                {/* Left — order meta + item pills */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--bakery-text)]">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs font-medium text-[var(--bakery-text-muted)]">Placed on {formatDate(order.createdAt)}</p>

                  {/* Compact item preview — names only, max 2 */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {order.items.slice(0, 2).map((item) => (
                      <span
                        key={item.id}
                        className="rounded-lg bg-amber-50 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-[var(--bakery-text)]"
                      >
                        {item.product?.name || 'Product'}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="rounded-lg bg-amber-100 dark:bg-zinc-700 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                        +{order.items.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Right — status, total, action */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider',
                      statusClasses[order.status] || 'bg-gray-100 text-gray-700',
                    ].join(' ')}
                  >
                    {order.status}
                  </span>
                  <p className="text-lg font-black text-[var(--bakery-text)]">${Number(order.total ?? 0).toFixed(2)}</p>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-600 group-hover:underline underline-offset-4">
                    View Details →
                  </span>
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
        totalItems={totalItems}
        label="orders"
      />

      {/* Order Detail Modal */}
      {selectedOrder && (() => {
        const activeOrder = orders.find((o) => o.id === selectedOrder.id) || selectedOrder
        return (
          <OrderDetailModal
            order={activeOrder}
            onClose={() => setSelectedOrder(null)}
            onCancelled={handleCancelled}
          />
        )
      })()}
    </div>
  )
}
