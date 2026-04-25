import Link from 'next/link'
import { Plus } from 'lucide-react'
import ProductsTable from '@/components/admin/ProductsTable'
import { apiGet } from '@/lib/api-client'

export const metadata = {
  title: 'Products | The Crumbs Admin',
}

const LIMIT = 10

export default async function AdminProductsPage({ searchParams }) {
  const resolved = await searchParams
  const page = Math.max(1, parseInt(resolved?.page ?? '1', 10))

  let products = []
  let categories = []
  let total = 0
  let totalPages = 1
  let hasDataError = false

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      apiGet('/api/admin/products', {
        searchParams: { page: String(page), limit: String(LIMIT) },
        cache: 'no-store',
      }),
      apiGet('/api/categories', { cache: 'no-store' }),
    ])

    products   = Array.isArray(productsRes?.data) ? productsRes.data : []
    total      = productsRes?.total ?? 0
    totalPages = productsRes?.totalPages ?? 1
    categories = Array.isArray(categoriesRes) ? categoriesRes : []
  } catch {
    hasDataError = true
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="px-1">
        <h1 className="text-3xl font-extrabold text-[var(--bakery-text)]">Products</h1>
        <p className="mt-1 text-sm text-[var(--bakery-text-muted)]">
          Manage your menu, stock, and storefront visibility.
        </p>
      </div>

      {hasDataError && (
        <p className="rounded-xl border border-amber-200 dark:border-zinc-700 bg-amber-50 dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-[var(--bakery-text-muted)]">
          Data is temporarily unavailable. Please try again later.
        </p>
      )}

      <ProductsTable
        products={products}
        categories={categories}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  )
}
