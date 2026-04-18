/**
 * components/client/CategoryFilter.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Category Filter Bar — Client Component (updates URL search params)
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 'use client'
 *
 * import { useRouter, useSearchParams, usePathname } from 'next/navigation'
 *
 * // Props: categories (array of Category objects)
 * export default function CategoryFilter({ categories }) {
 *   const router = useRouter()
 *   const pathname = usePathname()
 *   const searchParams = useSearchParams()
 *   const activeCategory = searchParams.get('category')
 *
 *   const setCategory = (slug) => {
 *     const params = new URLSearchParams(searchParams)
 *     if (slug) {
 *       params.set('category', slug)
 *     } else {
 *       params.delete('category')
 *     }
 *     // Update URL without full page reload — triggers server re-render with new searchParams
 *     router.push(`${pathname}?${params.toString()}`)
 *   }
 *
 *   return (
 *     <div className="flex gap-2 flex-wrap">
 *       <button
 *         onClick={() => setCategory(null)}
 *         className={activeCategory === null ? 'active styles' : ''}
 *       >
 *         All
 *       </button>
 *       {categories.map(cat => (
 *         <button
 *           key={cat.id}
 *           onClick={() => setCategory(cat.slug)}
 *           className={activeCategory === cat.slug ? 'active styles' : ''}
 *         >
 *           {cat.name}
 *         </button>
 *       ))}
 *     </div>
 *   )
 * }
 */
