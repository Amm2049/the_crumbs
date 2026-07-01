import ProductCard from '@/components/client/ProductCard'
import { Cookie } from 'lucide-react'

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-amber-200 dark:border-zinc-800 bg-amber-50/40 dark:bg-zinc-900/10 p-16 text-center max-w-2xl mx-auto my-8 animate-fade-up">
        <div className="rounded-full bg-amber-100/80 dark:bg-zinc-800 p-4 mb-4 text-amber-500 dark:text-amber-400">
          <Cookie size={40} className="animate-bounce" style={{ animationDuration: '3s' }} />
        </div>
        <h3 className="text-xl font-bold text-[var(--bakery-text)] mb-2">No Treats Found</h3>
        <p className="text-sm font-medium text-[var(--bakery-text-muted)] max-w-md">
          We couldn&apos;t find any products matching your search terms or category filter. Try clearing your filters or refining your keywords!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
