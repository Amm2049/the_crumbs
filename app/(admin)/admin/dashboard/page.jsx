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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#4D321E]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#7A5D4B]">Quick snapshot of your bakery operations.</p>
      </div>

      {hasDataError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-[#6B4C3B]">
          Data is not ready yet. Dashboard is showing fallback values.
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Orders" value={totalOrders} icon={ShoppingBag} />
        <StatsCard title="Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} />
        <StatsCard title="Products" value={totalProducts} icon={Package} />
        <StatsCard title="Customers" value={totalCustomers} icon={Users} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#4D321E]">Recent Orders</h2>
        <OrdersTable orders={recentOrders} />
      </section>
    </div>
  )
}
