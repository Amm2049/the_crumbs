/**
 * components/client/ProductCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Product Card — used in the home page and product listing grid
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import Link from 'next/link'
 * import Image from 'next/image'
 *
 * // Props: product (with category included)
 * export default function ProductCard({ product }) {
 *   const mainImage = product.images[0] ?? '/placeholder-product.jpg'
 *
 *   return (
 *     <Link href={`/products/${product.slug}`}>
 *       <div className="group rounded-xl overflow-hidden border hover:shadow-lg transition-shadow">
 *
 *         {/* Product Image *\/}
 *         <div className="relative aspect-square overflow-hidden">
 *           <Image
 *             src={mainImage}
 *             alt={product.name}
 *             fill
 *             className="object-cover group-hover:scale-105 transition-transform"
 *           />
 *           {!product.isAvailable && (
 *             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
 *               <span className="text-white font-medium">Out of Stock</span>
 *             </div>
 *           )}
 *         </div>
 *
 *         {/* Product Info *\/}
 *         <div className="p-4">
 *           <span className="text-xs text-muted-foreground">{product.category.name}</span>
 *           <h3 className="font-semibold mt-1 line-clamp-1">{product.name}</h3>
 *           <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
 *           <p className="font-bold mt-2">${product.price.toFixed(2)}</p>
 *         </div>
 *       </div>
 *     </Link>
 *   )
 * }
 */
