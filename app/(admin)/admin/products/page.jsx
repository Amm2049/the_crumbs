/**
 * app/(admin)/admin/products/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin Products List  →  URL: /admin/products
 *
 * Shows ALL products (including unavailable ones) with CRUD actions.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import db from '@/lib/db'
 * import ProductsTable from '@/components/admin/ProductsTable'
 * import Link from 'next/link'
 * import { Button } from '@/components/ui/button'
 *
 * export const metadata = { title: 'Products — The Crumbs Admin' }
 *
 * export default async function AdminProductsPage() {
 *   const products = await db.product.findMany({
 *     include: { category: true },
 *     orderBy: { createdAt: 'desc' },
 *   })
 *
 *   return (
 *     <div>
 *       <div className="flex justify-between items-center mb-6">
 *         <h1>Products</h1>
 *         <Link href="/admin/products/new">
 *           <Button>+ Add Product</Button>
 *         </Link>
 *       </div>
 *       <ProductsTable products={products} />
 *     </div>
 *   )
 * }
 *
 * NOTE: ProductsTable should be a Client Component so it can handle
 * delete button clicks and call the DELETE API, then router.refresh() to re-fetch.
 */
