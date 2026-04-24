import Link from 'next/link'

import OrdersTable from '@/components/admin/OrdersTable'
import { apiGet } from '@/lib/api-client'

export const metadata = {
  title: 'Orders | The Crumbs Admin',
}

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED']

export default async function AdminOrdersPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const requestedStatus = resolvedSearchParams?.status
  const selectedStatus = ORDER_STATUSES.includes(requestedStatus) ? requestedStatus : ''

  let orders = []
  let hasDataError = false

  try {
    orders = await apiGet('/api/orders', {
      searchParams: selectedStatus ? { status: selectedStatus } : undefined,
      cache: 'no-store',
    })
  } catch {
    hasDataError = true
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4D321E]">Orders</h1>
          <p className="mt-1 text-sm text-[#7A5D4B]">Track and update order status.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className={[
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              selectedStatus === '' ? 'border-amber-300 bg-amber-100 text-amber-800' : 'border-amber-200 text-[#6B4C3B] hover:bg-amber-50',
            ].join(' ')}
          >
            All
          </Link>
          {ORDER_STATUSES.map((status) => (
            <Link
              key={status}
              href={`/admin/orders?status=${status}`}
              className={[
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                selectedStatus === status
                  ? 'border-amber-300 bg-amber-100 text-amber-800'
                  : 'border-amber-200 text-[#6B4C3B] hover:bg-amber-50',
              ].join(' ')}
            >
              {status}
            </Link>
          ))}
        </div>
      </div>

      {hasDataError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-[#6B4C3B]">
          Orders data is not available yet. UI is ready and will populate once the backend is connected.
        </p>
      ) : null}

      <OrdersTable orders={orders} />
    </div>
  )
}
