'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function CategoryFilter({ categories }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('category') ?? ''

  const setCategory = (slug) => {
    const params = new URLSearchParams(searchParams.toString())

    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setCategory('')}
        className={[
          'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
          activeCategory
            ? 'border-amber-200 bg-white text-[#6B4C3B] hover:border-amber-300 hover:text-amber-700'
            : 'border-amber-400 bg-amber-100 text-amber-800',
        ].join(' ')}
      >
        All
      </button>

      {categories.map((category) => {
        const active = activeCategory === category.slug

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategory(category.slug)}
            className={[
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
              active
                ? 'border-amber-400 bg-amber-100 text-amber-800'
                : 'border-amber-200 bg-white text-[#6B4C3B] hover:border-amber-300 hover:text-amber-700',
            ].join(' ')}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
