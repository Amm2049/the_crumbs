import CategoriesManager from '@/components/admin/CategoriesManager'
import { apiGet } from '@/lib/api-client'

export const metadata = {
  title: 'Categories | The Crumbs Admin',
}

export default async function AdminCategoriesPage() {
  let categories = []
  let hasDataError = false

  try {
    categories = await apiGet('/api/admin/categories', {
      cache: 'no-store',
    })
  } catch {
    hasDataError = true
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--bakery-text)]">Categories</h1>
        <p className="mt-1 text-sm text-[var(--bakery-text-muted)]">Create, rename, and remove product categories.</p>
      </div>

      {hasDataError ? (
        <p className="rounded-xl border border-amber-200 dark:border-zinc-700 bg-amber-50 dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-[var(--bakery-text-muted)]">
          Category data is not available right now. UI is still interactive for review.
        </p>
      ) : null}

      <CategoriesManager initialCategories={categories} />
    </div>
  )
}
