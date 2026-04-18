/**
 * app/(client)/products/[slug]/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Product Detail Page  →  URL: /products/:slug
 *
 * Displays full product details and an "Add to Cart" button.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import db from '@/lib/db'
 * import { notFound } from 'next/navigation'
 * import AddToCartButton from '@/components/client/AddToCartButton'  ← Client Component
 *
 * export async function generateMetadata({ params }) {
 *   const { slug } = await params
 *   const product = await db.product.findUnique({ where: { slug } })
 *   if (!product) return { title: 'Not Found' }
 *   return { title: `${product.name} — The Crumbs`, description: product.description }
 * }
 *
 * export default async function ProductDetailPage({ params }) {
 *   // STEP 1 — Await params (required in Next.js 15)
 *   const { slug } = await params
 *
 *   // STEP 2 — Fetch product by slug
 *   const product = await db.product.findUnique({
 *     where: { slug },
 *     include: { category: true },
 *   })
 *   if (!product) notFound()  // renders the nearest not-found.jsx
 *
 *   // STEP 3 — Render
 *   // - Image gallery (product.images array)
 *   // - Name, category badge, price
 *   // - Description
 *   // - Stock status (In Stock / Out of Stock)
 *   // - <AddToCartButton productId={product.id} /> — this needs to be a Client Component
 *   //   because it calls the cart API and needs useState for loading state
 * }
 */
