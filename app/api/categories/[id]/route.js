/**
 * app/api/categories/[id]/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Categories API — Single Category Endpoints
 *
 * GET    /api/categories/:id  → Fetch single category
 *
 * PATCH  /api/categories/:id  → Update category (ADMIN only)
 *   - Body: { name?, slug?, description?, image? }
 *
 * DELETE /api/categories/:id  → Delete category (ADMIN only)
 *   - IMPORTANT: Category has onDelete: Restrict on Product relation
 *   - If category has products → return 400 with a clear error message
 *     e.g. "Cannot delete category with existing products. Remove products first."
 *   - If no products → db.category.delete()
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { NextResponse } from 'next/server'
 * import { auth } from '@/lib/auth'
 * import db from '@/lib/db'
 *
 * export async function GET(request, { params }) { ... }
 * export async function PATCH(request, { params }) { ... }
 * export async function DELETE(request, { params }) {
 *   // Check admin session
 *   // Count products in this category first
 *   // If count > 0, return 400 error
 *   // Otherwise delete
 * }
 */
