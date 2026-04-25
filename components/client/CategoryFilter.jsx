'use client'

export default function CategoryFilter({
  categories,
  activeCategory = '',
  onChangeCategory,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChangeCategory?.('')}
        className={[
          'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
          activeCategory
            ? 'border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[var(--bakery-text-muted)] hover:border-amber-300 dark:hover:border-zinc-600 hover:text-amber-700 dark:hover:text-amber-400'
            : 'border-amber-400 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400',
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
            onClick={() => onChangeCategory?.(category.slug)}
            className={[
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
              active
                ? 'border-amber-400 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400'
                : 'border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[var(--bakery-text-muted)] hover:border-amber-300 dark:hover:border-zinc-600 hover:text-amber-700 dark:hover:text-amber-400',
            ].join(' ')}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
