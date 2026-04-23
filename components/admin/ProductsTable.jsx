'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'

export default function ProductsTable({ products = [] }) {
  const router = useRouter()

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this product?')
    if (!confirmed) return

    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      return
    }

    router.refresh()
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-10 text-center">
        <p className="font-semibold text-[#6B4C3B]">No products yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-amber-50/70 text-xs uppercase tracking-wide text-[#7A5D4B]">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const imageUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : ''
              return (
                <tr key={product.id} className="border-t border-amber-100/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg border border-amber-100 bg-amber-50">
                        {imageUrl ? (
                          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold text-[#4D321E]">{product.name}</p>
                        <p className="text-xs text-[#8A6D5E]">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6B4C3B]">{product.category?.name || '-'}</td>
                  <td className="px-4 py-3 font-semibold text-[#4D321E]">${Number(product.price ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#6B4C3B]">{product.stock ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'rounded-full px-2 py-1 text-xs font-bold uppercase',
                        product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700',
                      ].join(' ')}
                    >
                      {product.isAvailable ? 'Available' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2 py-1 text-xs font-semibold text-[#6B4C3B] transition-colors hover:bg-amber-50"
                      >
                        <Pencil size={12} />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
