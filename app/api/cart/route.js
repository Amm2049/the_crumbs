/**
 * app/api/cart/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cart API — Collection Endpoints
 *
 * GET  /api/cart  → Fetch current user's cart
 *   - Must be logged in (401 if not)
 *   - Fetch CartItems where userId === session.user.id
 *   - Include product (name, price, images, stock, isAvailable)
 *   - Return: array of cart items with product details
 *
 * POST /api/cart  → Add a product to cart (or update quantity if already present)
 *   - Must be logged in (401 if not)
 *   - Body: { productId, quantity }
 *   - Validate: product exists, product isAvailable, requested quantity <= product.stock
 *   - Use db.cartItem.upsert():
 *       where: { userId_productId: { userId, productId } }  ← uses the @@unique constraint
 *       create: { userId, productId, quantity }
 *       update: { quantity: { increment: quantity } }       ← adds to existing quantity
 *   - Return the upserted cart item
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { NextResponse } from 'next/server'
 * import { auth } from '@/lib/auth'
 * import db from '@/lib/db'
 *
 * export async function GET(request) { ... }
 *
 * export async function POST(request) {
 *   // db.cartItem.upsert() is the key pattern here —
 *   // it handles both "new item" and "already in cart" cases in one query
 * }
 */
