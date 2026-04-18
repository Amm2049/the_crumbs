/**
 * app/(client)/products/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Products Listing Page  →  URL: /products
 *
 * Displays all available products with search and category filtering.
 * This can be a Server Component — pass searchParams to filter on server.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import db from '@/lib/db'
 * import ProductGrid from '@/components/client/ProductGrid'
 * import CategoryFilter from '@/components/client/CategoryFilter'
 *
 * export const metadata = {
 *   title: 'Our Products — The Crumbs',
 * }
 *
 * export default async function ProductsPage({ searchParams }) {
 *   // Next.js 15: searchParams is a Promise — must await it
 *   const { category, search } = await searchParams
 *
 *   // Build Prisma where clause dynamically
 *   const where = {
 *     isAvailable: true,
 *     ...(category && { category: { slug: category } }),
 *     ...(search && { name: { contains: search, mode: 'insensitive' } }),
 *   }
 *
 *   const [products, categories] = await Promise.all([
 *     db.product.findMany({ where, include: { category: true }, orderBy: { createdAt: 'desc' } }),
 *     db.category.findMany(),
 *   ])
 *
 *   return (
 *     <div>
 *       <CategoryFilter categories={categories} />
 *       <ProductGrid products={products} />
 *     </div>
 *   )
 * }
 */
