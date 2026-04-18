/**
 * app/(admin)/admin/dashboard/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin Dashboard Overview  →  URL: /admin/dashboard
 *
 * Shows key business stats and a recent orders table.
 * This is a Server Component — fetch data directly with Prisma.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import db from '@/lib/db'
 * import StatsCard from '@/components/admin/StatsCard'
 * import OrdersTable from '@/components/admin/OrdersTable'
 *
 * export const metadata = { title: 'Dashboard — The Crumbs Admin' }
 *
 * export default async function DashboardPage() {
 *   // STEP 1 — Fetch all stats in parallel with Promise.all
 *   const [totalOrders, totalProducts, totalCustomers, recentOrders] = await Promise.all([
 *     db.order.count(),
 *     db.product.count(),
 *     db.user.count({ where: { role: 'CUSTOMER' } }),
 *     db.order.findMany({
 *       take: 10,
 *       orderBy: { createdAt: 'desc' },
 *       include: { user: { select: { name: true, email: true } }, items: true },
 *     }),
 *   ])
 *
 *   // STEP 2 — Calculate total revenue (sum of all order totals)
 *   const revenueResult = await db.order.aggregate({ _sum: { total: true } })
 *   const totalRevenue = revenueResult._sum.total ?? 0
 *
 *   // STEP 3 — Render stats grid + recent orders table
 *   return (
 *     <div>
 *       <div className="grid grid-cols-4 gap-4">
 *         <StatsCard title="Total Orders" value={totalOrders} />
 *         <StatsCard title="Revenue" value={`$${totalRevenue.toFixed(2)}`} />
 *         <StatsCard title="Products" value={totalProducts} />
 *         <StatsCard title="Customers" value={totalCustomers} />
 *       </div>
 *       <OrdersTable orders={recentOrders} />
 *     </div>
 *   )
 * }
 */
