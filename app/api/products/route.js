/**
 * app/api/products/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Products API — Collection Endpoints
 *
 * GET  /api/products  → Fetch all available products
 *   - Used by the client storefront product listing page (via SWR)
 *   - Accepts optional query params:
 *       ?category=slug   → filter by category slug
 *       ?search=keyword  → filter by name containing keyword
 *   - Only return products where isAvailable === true (for public)
 *   - Include the category relation (for displaying category name/badge)
 *   - Return: Array of products with their category
 *
 * POST /api/products  → Create a new product (ADMIN only)
 *   - Check session with auth() — reject if not ADMIN (return 403)
 *   - Read request body: { name, slug, description, price, stock, categoryId, images, isAvailable }
 *   - Validate: all required fields present, price > 0, stock >= 0
 *   - Use db.product.create() to save to DB
 *   - Return: created product with 201 status
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { NextResponse } from 'next/server'
 * import { auth } from '@/lib/auth'
 * import db from '@/lib/db'
 *
 * export async function GET(request) {
 *   // 1. Get search params from request.nextUrl.searchParams
 *   // 2. Build the Prisma `where` clause (category filter, search, isAvailable: true)
 *   // 3. db.product.findMany({ where, include: { category: true }, orderBy: { createdAt: 'desc' } })
 *   // 4. Return NextResponse.json(products)
 * }
 *
 * export async function POST(request) {
 *   // 1. const session = await auth()
 *   // 2. if (!session || session.user.role !== 'ADMIN') return 403
 *   // 3. const body = await request.json()
 *   // 4. Validate required fields
 *   // 5. db.product.create({ data: { ...body } })
 *   // 6. return NextResponse.json(product, { status: 201 })
 * }
 */
