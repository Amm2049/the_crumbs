'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import Link from 'next/link'
import Pagination from '@/components/shared/Pagination'

const statusClasses = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  READY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-700',
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export default function OrdersClient({ initialOrders = [] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentPage = Number(searchParams.get('page')) || 1
  const itemsPerPage = 5

  const totalPages = Math.ceil(initialOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  
  const paginatedOrders = useMemo(() => {
    return initialOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [initialOrders, startIndex])

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/orders?${params.toString()}`, { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (initialOrders.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-[#4D321E]">My Orders</h1>
        <p className="mt-3 text-[#7A5D4B]">You have not placed any orders yet.</p>
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
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-[#4D321E]">My Orders</h1>
        <p className="text-sm font-medium text-[#7A5D4B]">Manage and track your recent bakery treats.</p>
      </div>

      <div className="space-y-4">
        {paginatedOrders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-[#4D321E]">Order #{order.id.slice(0, 8)}</p>
                <p className="text-xs font-medium text-[#7A5D4B]">Placed on {formatDate(order.createdAt)}</p>
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

            <ul className="mt-4 space-y-2 border-y border-amber-50 py-3 text-sm text-[#5B4333]">
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7A5D4B]">Total Amount</p>
                <p className="text-xl font-black text-[#4D321E]">${Number(order.total ?? 0).toFixed(2)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={initialOrders.length}
        startIndex={startIndex}
        label="orders"
      />
    </div>
  )
}
