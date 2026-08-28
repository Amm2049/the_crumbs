import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react'

import OrdersTable from '@/components/admin/OrdersTable'
import StatsCard from '@/components/admin/StatsCard'
import AnalyticsCharts from '@/components/admin/AnalyticsCharts'
import db from '@/lib/db'

export const metadata = {
  title: 'Dashboard | The Crumbs Admin',
}

export default async function DashboardPage() {
  let totalOrders = 0
  let totalProducts = 0
  let totalCustomers = 0
  let totalRevenue = 0
  let recentOrders = []
  let lowStockCount = 0
  let hasDataError = false

  try {
    const [ordersCount, productsCount, customersCount, revenueResult, recentOrdersResult, lowStockCountVal] =
      await Promise.all([
        db.order.count(),
        db.product.count(),
        db.user.count({ where: { role: "CUSTOMER" } }),
        db.order.aggregate({ _sum: { total: true } }),
        db.order.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, email: true, image: true } },
            items: { include: { product: { select: { name: true, images: true, category: { select: { name: true } } } } } },
          },
        }),
        db.product.count({ where: { stock: { lte: 5 } } })
      ]);

    totalOrders = ordersCount
    totalProducts = productsCount
    totalCustomers = customersCount
    totalRevenue = Number(revenueResult?._sum?.total ?? 0)
    recentOrders = Array.isArray(recentOrdersResult) ? recentOrdersResult : []
    lowStockCount = lowStockCountVal
  } catch (error) {
    console.error('[Dashboard SSR Error]:', error)
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
          Some data couldn&apos;t be loaded. Dashboard is showing fallback values.
        </p>
      )}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Orders" value={totalOrders} icon={ShoppingBag} />
        <StatsCard title="Gross Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} />
        <StatsCard title="Active Menu" value={totalProducts} icon={Package} alert={lowStockCount > 0} />
        <StatsCard title="Customers" value={totalCustomers} icon={Users} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-black text-[var(--bakery-text)]">Analytics</h2>
        </div>
        <AnalyticsCharts />
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
