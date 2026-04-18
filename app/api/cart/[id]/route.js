/**
 * app/api/cart/[id]/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cart API — Single Cart Item Endpoints
 *
 * PATCH  /api/cart/:id  → Update quantity of a specific cart item
 *   - Must be logged in
 *   - Verify the cart item belongs to the current user (security check!)
 *     Otherwise, any logged-in user could modify another user's cart.
 *   - Body: { quantity }
 *   - Validate: quantity >= 1, quantity <= product.stock
 *   - db.cartItem.update({ where: { id }, data: { quantity } })
 *
 * DELETE /api/cart/:id  → Remove a specific item from cart
 *   - Must be logged in
 *   - Verify the cart item belongs to the current user (security check!)
 *   - db.cartItem.delete({ where: { id } })
 *   - Return 204 No Content
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { NextResponse } from 'next/server'
 * import { auth } from '@/lib/auth'
 * import db from '@/lib/db'
 *
 * Security pattern for ownership check:
 *   const cartItem = await db.cartItem.findUnique({ where: { id } })
 *   if (!cartItem || cartItem.userId !== session.user.id) {
 *     return NextResponse.json({ error: 'Not found' }, { status: 404 })
 *   }
 *
 * export async function PATCH(request, { params }) { ... }
 * export async function DELETE(request, { params }) { ... }
 */
