/**
 * app/(admin)/admin/orders/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin Orders List  →  URL: /admin/orders
 *
 * Shows all orders with filtering by status and inline status updates.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import db from '@/lib/db'
 * import OrdersTable from '@/components/admin/OrdersTable'
 *
 * export const metadata = { title: 'Orders — The Crumbs Admin' }
 *
 * export default async function AdminOrdersPage({ searchParams }) {
 *   const { status } = await searchParams
 *
 *   const orders = await db.order.findMany({
 *     where: status ? { status } : undefined,
 *     include: {
 *       user: { select: { name: true, email: true } },
 *       items: { include: { product: { select: { name: true } } } },
 *     },
 *     orderBy: { createdAt: 'desc' },
 *   })
 *
 *   // OrdersTable is a Client Component to handle status update dropdowns
 *   // When admin changes status, it PATCHes to /api/orders/:id
 *   // and then calls router.refresh() to re-fetch updated data
 *   return <OrdersTable orders={orders} />
 * }
 */

export default function AdminOrdersPage() {
  return <div>Admin Orders — implement me!</div>
}
