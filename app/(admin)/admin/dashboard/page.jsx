import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react'

import OrdersTable from '@/components/admin/OrdersTable'
import StatsCard from '@/components/admin/StatsCard'
import { apiGet } from '@/lib/api-client'

export const metadata = {
  title: 'Dashboard | The Crumbs Admin',
}

export default async function DashboardPage() {
  let totalOrders = 0
  let totalProducts = 0
  let totalCustomers = 0
  let totalRevenue = 0
  let recentOrders = []
  let hasDataError = false

  try {
    const data = await apiGet('/api/admin/dashboard', {
      cache: 'no-store',
    })

    totalOrders = data.totalOrders ?? 0
    totalProducts = data.totalProducts ?? 0
    totalCustomers = data.totalCustomers ?? 0
    totalRevenue = Number(data.totalRevenue ?? 0)
    recentOrders = Array.isArray(data.recentOrders) ? data.recentOrders : []
  } catch {
    hasDataError = true
  }

  return (
    <div className="space-y-8">
      <div className="px-1">
        <h1 className="text-3xl font-extrabold text-[var(--bakery-text)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--bakery-text-muted)]">Quick snapshot of your bakery operations.</p>
      </div>

      {hasDataError && (
        <p className="rounded-xl border border-amber-200 dark:border-zinc-700 bg-amber-50 dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-[var(--bakery-text-muted)]">
          Some data couldn't be loaded. Dashboard is showing fallback values.
        </p>
      )}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Orders" value={totalOrders} icon={ShoppingBag} trend="+12% from last week" />
        <StatsCard title="Gross Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} trend="+8% from last week" />
        <StatsCard title="Active Menu" value={totalProducts} icon={Package} />
        <StatsCard title="Customers" value={totalCustomers} icon={Users} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-black text-[var(--bakery-text)]">Recent Orders</h2>
        </div>
        <OrdersTable orders={recentOrders} compact={true} />
      </section>
    </div>
  )
}
