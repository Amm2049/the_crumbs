/**
 * app/(admin)/admin/categories/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin Categories  →  URL: /admin/categories
 *
 * Manage product categories with full CRUD.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import db from '@/lib/db'
 * import { Button } from '@/components/ui/button'
 *
 * export const metadata = { title: 'Categories — The Crumbs Admin' }
 *
 * export default async function AdminCategoriesPage() {
 *   const categories = await db.category.findMany({
 *     include: { _count: { select: { products: true } } },
 *     orderBy: { name: 'asc' },
 *   })
 *
 *   // Use a Client Component for the create/edit form (inline or modal dialog)
 *   // Show each category with:
 *   //   - Name, slug, product count
 *   //   - Edit button → opens edit dialog
 *   //   - Delete button → confirm dialog, then DELETE /api/categories/:id
 *   //     Note: delete will fail if category has products (Restrict constraint)
 *   //     Handle this error gracefully with a toast notification
 *   return (
 *     <div>...</div>
 *   )
 * }
 */
