/**
 * app/api/categories/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Categories API — Collection Endpoints
 *
 * GET  /api/categories  → Fetch all categories
 *   - Used by: product filter sidebar, product create/edit form dropdown
 *   - Include _count: { products: true } to show how many products each has
 *   - Return: Array of categories
 *
 * POST /api/categories  → Create a new category (ADMIN only)
 *   - Check session — reject if not ADMIN
 *   - Body: { name, slug, description?, image? }
 *   - db.category.create()
 *   - Return created category with 201 status
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { NextResponse } from 'next/server'
 * import { auth } from '@/lib/auth'
 * import db from '@/lib/db'
 *
 * export async function GET() {
 *   // db.category.findMany({ include: { _count: { select: { products: true } } } })
 *   // return NextResponse.json(categories)
 * }
 *
 * export async function POST(request) {
 *   // Check admin session
 *   // const body = await request.json()
 *   // db.category.create({ data: { name, slug, description, image } })
 *   // return NextResponse.json(category, { status: 201 })
 * }
 */
