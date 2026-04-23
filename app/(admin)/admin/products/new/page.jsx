/**
 * app/(admin)/admin/products/new/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Create New Product  →  URL: /admin/products/new
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import db from '@/lib/db'
 * import ProductForm from '@/components/admin/ProductForm'
 *
 * export const metadata = { title: 'New Product — The Crumbs Admin' }
 *
 * export default async function NewProductPage() {
 *   // Fetch categories for the category dropdown in the form
 *   const categories = await db.category.findMany()
 *
 *   // ProductForm is a Client Component (it uses useForm + image upload)
 *   // Pass categories and mode="create" so it knows to POST vs PATCH
 *   return <ProductForm categories={categories} mode="create" />
 * }
 */

export default function NewProductPage() {
  return <div>New Product — implement me!</div>
}
