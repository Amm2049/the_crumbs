/**
 * app/(admin)/admin/products/[id]/edit/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Edit Product  →  URL: /admin/products/:id/edit
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import db from '@/lib/db'
 * import { notFound } from 'next/navigation'
 * import ProductForm from '@/components/admin/ProductForm'
 *
 * export const metadata = { title: 'Edit Product — The Crumbs Admin' }
 *
 * export default async function EditProductPage({ params }) {
 *   // Next.js 15: await params
 *   const { id } = await params
 *
 *   // Fetch product and categories in parallel
 *   const [product, categories] = await Promise.all([
 *     db.product.findUnique({ where: { id } }),
 *     db.category.findMany(),
 *   ])
 *
 *   if (!product) notFound()
 *
 *   // Pass existing product data to pre-fill the form
 *   // ProductForm with mode="edit" will PATCH to /api/products/:id
 *   return <ProductForm categories={categories} product={product} mode="edit" />
 * }
 */
