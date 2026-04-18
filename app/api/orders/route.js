/**
 * app/api/orders/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Orders API — Collection Endpoints
 *
 * GET  /api/orders  → Fetch orders
 *   - ADMIN: fetch ALL orders (include user info, items, product names)
 *     Support optional ?status=PENDING filter
 *   - CUSTOMER: fetch only orders belonging to session.user.id
 *   - Differentiate by checking session.user.role
 *   - Include: user (name, email), items (with product name + image)
 *   - Order by: createdAt descending (newest first)
 *
 * POST /api/orders  → Place a new order (logged-in users only)
 *   - Must be logged in (any role)
 *   - Steps:
 *     1. Get session — reject if not logged in (401)
 *     2. Fetch user's CartItems from DB (include product for price + stock)
 *     3. Validate: cart is not empty, all products are still available,
 *        all products have sufficient stock
 *     4. Calculate total: sum of (cartItem.quantity * product.price)
 *     5. Create Order + OrderItems in a Prisma transaction ($transaction):
 *        a. db.order.create() with items embedded via nested create
 *        b. For each cart item, reduce product stock:
 *           db.product.update({ data: { stock: { decrement: quantity } } })
 *        c. Clear the user's cart: db.cartItem.deleteMany({ where: { userId } })
 *     6. Return the created order with 201 status
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { NextResponse } from 'next/server'
 * import { auth } from '@/lib/auth'
 * import db from '@/lib/db'
 *
 * export async function GET(request) { ... }
 * export async function POST(request) {
 *   // Use db.$transaction([...]) to run multiple operations atomically
 *   // If any step fails, ALL steps are rolled back automatically
 * }
 */
