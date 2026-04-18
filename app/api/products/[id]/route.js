/**
 * app/api/products/[id]/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Products API — Single Product Endpoints
 *
 * GET    /api/products/:id  → Fetch a single product by ID
 *   - Include category relation
 *   - Return 404 if not found
 *
 * PATCH  /api/products/:id  → Update a product (ADMIN only)
 *   - Check session — reject if not ADMIN (return 403)
 *   - Read request body (any partial update: name, price, stock, etc.)
 *   - Use db.product.update()
 *   - Return updated product
 *
 * DELETE /api/products/:id  → Delete a product (ADMIN only)
 *   - Check session — reject if not ADMIN (return 403)
 *   - Check if this product has existing orders — if yes, consider soft delete
 *     (set isAvailable: false) instead of hard delete to preserve order history
 *   - db.product.delete()
 *   - Return 204 No Content
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { NextResponse } from 'next/server'
 * import { auth } from '@/lib/auth'
 * import db from '@/lib/db'
 *
 * export async function GET(request, { params }) {
 *   // const { id } = await params (params is a Promise in Next.js 15)
 *   // db.product.findUnique({ where: { id }, include: { category: true } })
 *   // if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
 * }
 *
 * export async function PATCH(request, { params }) {
 *   // Check admin session
 *   // const body = await request.json()
 *   // db.product.update({ where: { id }, data: { ...body } })
 * }
 *
 * export async function DELETE(request, { params }) {
 *   // Check admin session
 *   // db.product.delete({ where: { id } })
 *   // return new NextResponse(null, { status: 204 })
 * }
 */
