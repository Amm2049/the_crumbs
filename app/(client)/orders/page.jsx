/**
 * app/(client)/orders/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Customer Order History Page  →  URL: /orders
 * Protected by middleware — redirects to /login if not authenticated.
 *
 * Shows the logged-in customer's past orders with status badges.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { auth } from '@/lib/auth'
 * import db from '@/lib/db'
 * import { redirect } from 'next/navigation'
 *
 * export const metadata = { title: 'My Orders — The Crumbs' }
 *
 * export default async function OrdersPage() {
 *   // STEP 1 — Get session (server-side)
 *   const session = await auth()
 *   if (!session) redirect('/login')
 *
 *   // STEP 2 — Fetch user's orders
 *   const orders = await db.order.findMany({
 *     where: { userId: session.user.id },
 *     include: {
 *       items: {
 *         include: { product: { select: { name: true, images: true } } },
 *       },
 *     },
 *     orderBy: { createdAt: 'desc' },
 *   })
 *
 *   // STEP 3 — Render each order as a card showing:
 *   //   - Order ID (shortened: order.id.slice(0, 8))
 *   //   - Date placed
 *   //   - Status badge (color-coded by status)
 *   //   - List of items (product name × quantity)
 *   //   - Order total
 *   //   - Empty state: "You haven't placed any orders yet"
 * }
 */
