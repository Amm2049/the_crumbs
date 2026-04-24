import Link from 'next/link'

import ProductsTable from '@/components/admin/ProductsTable'
import { apiGet } from '@/lib/api-client'

export const metadata = {
  title: 'Products | The Crumbs Admin',
}

export default async function AdminProductsPage() {
  let products = []
  let hasDataError = false

  try {
    products = await apiGet('/api/admin/products', {
      cache: 'no-store',
    })
  } catch {
    hasDataError = true
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4D321E]">Products</h1>
          <p className="mt-1 text-sm text-[#7A5D4B]">Manage your menu, stock, and storefront visibility.</p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          + Add Product
        </Link>
      </div>

      {hasDataError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-[#6B4C3B]">
          Products data is not ready yet. This table will populate when DB/API is available.
        </p>
      ) : null}

      <ProductsTable products={products} />
    </div>
  )
}
