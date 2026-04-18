/**
 * app/api/orders/[id]/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Orders API — Single Order Endpoints
 *
 * GET   /api/orders/:id  → Fetch single order
 *   - ADMIN: can view any order
 *   - CUSTOMER: can only view their own order (check order.userId === session.user.id)
 *   - Include: user (name, email), items (quantity, price, product name + image)
 *   - Return 404 if not found, 403 if not authorized
 *
 * PATCH /api/orders/:id  → Update order status (ADMIN only)
 *   - Body: { status: 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED' }
 *   - Validate status is a valid OrderStatus enum value
 *   - db.order.update({ where: { id }, data: { status } })
 *   - Return updated order
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { NextResponse } from 'next/server'
 * import { auth } from '@/lib/auth'
 * import db from '@/lib/db'
 *
 * Valid statuses: ['PENDING', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED']
 *
 * export async function GET(request, { params }) { ... }
 * export async function PATCH(request, { params }) { ... }
 */
