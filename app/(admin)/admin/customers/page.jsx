/**
 * app/(admin)/admin/customers/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin Customers List  →  URL: /admin/customers
 *
 * Read-only list of all registered customers (role: CUSTOMER).
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import db from '@/lib/db'
 *
 * export const metadata = { title: 'Customers — The Crumbs Admin' }
 *
 * export default async function AdminCustomersPage() {
 *   const customers = await db.user.findMany({
 *     where: { role: 'CUSTOMER' },
 *     include: { _count: { select: { orders: true } } },
 *     orderBy: { createdAt: 'desc' },
 *   })
 *
 *   // Display a table with:
 *   //   - Name, Email
 *   //   - Join date (createdAt formatted)
 *   //   - Total orders (_count.orders)
 *   return (
 *     <div>...</div>
 *   )
 * }
 */
