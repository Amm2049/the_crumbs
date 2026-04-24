import { notFound } from 'next/navigation'

import ProductForm from '@/components/admin/ProductForm'
import { apiGet } from '@/lib/api-client'

export const metadata = {
  title: 'Edit Product | The Crumbs Admin',
}

export default async function EditProductPage({ params }) {
  const { id } = await params

  let product = null
  let categories = []

  try {
    ;[product, categories] = await Promise.all([
      apiGet(`/api/products/${id}`, {
        cache: 'no-store',
      }),
      apiGet('/api/categories', {
        next: { revalidate: 60 },
      }),
    ])
  } catch {
    product = null
    categories = []
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold text-[#4D321E]">Edit Product</h1>
        <p className="mt-1 text-sm text-[#7A5D4B]">Update details, stock, and visibility.</p>
      </div>

      <ProductForm categories={categories} product={product} mode="edit" />
    </div>
  )
}
