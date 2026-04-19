/**
 * app/(client)/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Home Page  →  URL: /
 *
 * The landing page of the storefront. This is a Server Component.
 * You can fetch data directly here (no SWR needed — no client-side interaction).
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import HeroSection from '@/components/client/HeroSection'
 * import ProductCard from '@/components/client/ProductCard'
 * import Link from 'next/link'
 * import db from '@/lib/db'
 *
 * export const metadata = {
 *   title: 'The Crumbs — Fresh Baked with Love',
 *   description: 'Artisan cakes, breads, pastries and cookies baked fresh daily.',
 * }
 *
 * export default async function HomePage() {
 *   // STEP 1 — Fetch featured products (latest 8 available products)
 *   const featuredProducts = await db.product.findMany({
 *     where: { isAvailable: true },
 *     include: { category: true },
 *     orderBy: { createdAt: 'desc' },
 *     take: 8,
 *   })
 *
 *   // STEP 2 — Fetch all categories
 *   const categories = await db.category.findMany()
 *
 *   // STEP 3 — Render
 *   return (
 *     <>
 *       <HeroSection />
 *
 *       {/* Categories Section *\/}
 *       <section> ... map categories ... </section>
 *
 *       {/* Featured Products Section *\/}
 *       <section>
 *         <h2>Fresh Today</h2>
 *         <div className="grid ...">
 *           {featuredProducts.map(product => (
 *             <ProductCard key={product.id} product={product} />
 *           ))}
 *         </div>
 *         <Link href="/products">View All Products</Link>
 *       </section>
 *     </>
 *   )
 * }
 */

export default function HomePage() {
  return <div>Home Page — implement me!</div>
}
