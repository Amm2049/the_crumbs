import OrdersTable from '@/components/admin/OrdersTable'
import { apiGet } from '@/lib/api-client'

export const metadata = {
  title: 'Orders | The Crumbs Admin',
}

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED']
const LIMIT = 10

// Status filter styling
const STATUS_PILL = {
  PENDING:    { active: 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-400',  idle: 'border-amber-200 dark:border-zinc-700 text-[var(--bakery-text-muted)] hover:bg-amber-50 dark:hover:bg-zinc-800' },
  PROCESSING: { active: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-400',        idle: 'border-amber-200 dark:border-zinc-700 text-[var(--bakery-text-muted)] hover:bg-amber-50 dark:hover:bg-zinc-800' },
  READY:      { active: 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-400',  idle: 'border-amber-200 dark:border-zinc-700 text-[var(--bakery-text-muted)] hover:bg-amber-50 dark:hover:bg-zinc-800' },
  DELIVERED:  { active: 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-400',     idle: 'border-amber-200 dark:border-zinc-700 text-[var(--bakery-text-muted)] hover:bg-amber-50 dark:hover:bg-zinc-800' },
  CANCELLED:  { active: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400',           idle: 'border-amber-200 dark:border-zinc-700 text-[var(--bakery-text-muted)] hover:bg-amber-50 dark:hover:bg-zinc-800' },
}

export default async function AdminOrdersPage({ searchParams }) {
  const resolved = await searchParams
  const requestedStatus = resolved?.status
  const selectedStatus = ORDER_STATUSES.includes(requestedStatus) ? requestedStatus : ''
  const page = Math.max(1, parseInt(resolved?.page ?? '1', 10))
  
  // New date filters
  const month = resolved?.month || ''
  const year = resolved?.year || ''

  let orders = []
  let total = 0
  let totalPages = 1
  let hasDataError = false

  try {
    const params = {
      page: String(page),
      limit: String(LIMIT),
      ...(selectedStatus ? { status: selectedStatus } : {}),
      ...(month ? { month } : {}),
      ...(year ? { year } : {}),
    }
    const result = await apiGet('/api/orders', { searchParams: params, cache: 'no-store' })
    orders     = Array.isArray(result?.data) ? result.data : []
    total      = result?.total ?? 0
    totalPages = result?.totalPages ?? 1
  } catch {
    hasDataError = true
  }

  // Helper to build links while preserving date filters
  const getFilterUrl = (status) => {
    const p = new URLSearchParams()
    if (status) p.set('status', status)
    if (month) p.set('month', month)
    if (year) p.set('year', year)
    const qs = p.toString()
    return `/admin/orders${qs ? '?' + qs : ''}`
  }

  return (
    <div className="space-y-5">
      {/* Header + filter */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--bakery-text)]">Orders</h1>
          <p className="mt-1 text-sm text-[var(--bakery-text-muted)]">
            Track and update order statuses.
            {total > 0 && <span className="ml-1 font-semibold text-amber-700 dark:text-amber-500">({total} total)</span>}
          </p>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          <a
            href={getFilterUrl('')}
            className={[
              'rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all',
              selectedStatus === '' ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/25' : 'border-amber-200 dark:border-zinc-700 text-[var(--bakery-text-muted)] hover:bg-amber-50 dark:hover:bg-zinc-800',
            ].join(' ')}
          >
            All
          </a>
          {ORDER_STATUSES.map((status) => {
            const cfg = STATUS_PILL[status]
            const isActive = selectedStatus === status
            return (
              <a
                key={status}
                href={getFilterUrl(status)}
                className={[
                  'rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all',
                  isActive ? cfg.active + ' shadow-sm' : cfg.idle,
                ].join(' ')}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </a>
            )
          })}
        </div>
      </div>

      {hasDataError && (
        <p className="rounded-xl border border-amber-200 dark:border-zinc-700 bg-amber-50 dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-[var(--bakery-text-muted)]">
          Orders data is not available yet. UI is ready and will populate once the backend is connected.
        </p>
      )}

      <OrdersTable orders={orders} page={page} totalPages={totalPages} total={total} />
    </div>
  )
}
