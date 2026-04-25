import CustomersTable from '@/components/admin/CustomersTable'
import { apiGet } from '@/lib/api-client'

export const metadata = {
  title: 'Customers | The Crumbs Admin',
}

export default async function AdminCustomersPage() {
  let customers = []
  let hasDataError = false

  try {
    customers = await apiGet('/api/admin/customers', {
      cache: 'no-store',
    })
  } catch {
    hasDataError = true
  }

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-3xl font-extrabold text-[var(--bakery-text)]">Customers</h1>
        <p className="mt-1 text-sm text-[var(--bakery-text-muted)]">View and manage your registered customer base.</p>
      </div>

      {hasDataError && (
        <p className="rounded-xl border border-amber-200 dark:border-zinc-700 bg-amber-50 dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-[var(--bakery-text-muted)]">
          Data is temporarily unavailable. Please try again later.
        </p>
      )}

      <CustomersTable customers={customers} />
    </div>
  )
}
