import ProductForm from '@/components/admin/ProductForm'
import { apiGet } from '@/lib/api-client'

export const metadata = {
  title: 'New Product | The Crumbs Admin',
}

export default async function NewProductPage() {
  let categories = []
  let hasDataError = false

  try {
    categories = await apiGet('/api/categories', {
      next: { revalidate: 60 },
    })
  } catch {
    hasDataError = true
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold text-[#4D321E]">Add Product</h1>
        <p className="mt-1 text-sm text-[#7A5D4B]">Create a new item for your storefront.</p>
      </div>

      {hasDataError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-[#6B4C3B]">
          Categories are unavailable right now. You can still review the form structure.
        </p>
      ) : null}

      <ProductForm categories={categories} mode="create" />
    </div>
  )
}
