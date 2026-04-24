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
        <h1 className="text-3xl font-extrabold text-[#4D321E]">Categories</h1>
        <p className="mt-1 text-sm text-[#7A5D4B]">Create, rename, and remove product categories.</p>
      </div>

      {hasDataError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-[#6B4C3B]">
          Category data is not available right now. UI is still interactive for review.
        </p>
      ) : null}

      <CategoriesManager initialCategories={categories} />
    </div>
  )
}
