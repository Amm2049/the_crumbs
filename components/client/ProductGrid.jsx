/**
 * components/client/ProductGrid.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Product Grid — renders a responsive grid of ProductCard components
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import ProductCard from '@/components/client/ProductCard'
 *
 * // Props: products (array of products with categories)
 * export default function ProductGrid({ products }) {
 *   if (products.length === 0) {
 *     return (
 *       <div className="text-center py-20">
 *         <p className="text-muted-foreground">No products found.</p>
 *       </div>
 *     )
 *   }
 *
 *   return (
 *     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
 *       {products.map(product => (
 *         <ProductCard key={product.id} product={product} />
 *       ))}
 *     </div>
 *   )
 * }
 */
