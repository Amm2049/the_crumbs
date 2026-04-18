/**
 * components/admin/OrdersTable.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Orders Table for Admin Panel  (Client Component)
 *
 * Shows all orders with inline status update dropdown.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 'use client'
 *
 * import { useRouter } from 'next/navigation'
 *
 * const STATUS_COLORS = {
 *   PENDING:    'bg-yellow-100 text-yellow-800',
 *   PROCESSING: 'bg-blue-100 text-blue-800',
 *   READY:      'bg-purple-100 text-purple-800',
 *   DELIVERED:  'bg-green-100 text-green-800',
 *   CANCELLED:  'bg-red-100 text-red-800',
 * }
 *
 * const ALL_STATUSES = ['PENDING', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED']
 *
 * // Props: orders (array with user and items included)
 * export default function OrdersTable({ orders }) {
 *   const router = useRouter()
 *
 *   const handleStatusChange = async (orderId, newStatus) => {
 *     // PATCH /api/orders/:orderId with { status: newStatus }
 *     // On success: router.refresh() to re-fetch updated orders
 *   }
 *
 *   // TABLE COLUMNS:
 *   //   Order ID (shortened: id.slice(0, 8).toUpperCase())
 *   //   Customer (user.name + user.email)
 *   //   Items (count: order.items.length)
 *   //   Total ($XX.XX)
 *   //   Date (createdAt formatted as locale date string)
 *   //   Status (dropdown <select> or shadcn/ui Select component)
 * }
 */
