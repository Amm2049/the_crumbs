'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'

export default function CartItemRow({ item, mutate }) {
  const { id, product, quantity } = item
  const unitPrice = Number(product?.price ?? 0)
  const lineTotal = unitPrice * Number(quantity ?? 0)
  const maxStock = Number(product?.stock ?? 0)
  const imageUrl = Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : ''

  const updateQuantity = async (newQuantity) => {
    if (newQuantity < 1) return
    if (maxStock > 0 && newQuantity > maxStock) return

    const response = await fetch(`/api/cart/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity }),
    })

    if (response.ok) {
      await mutate()
    }
  }

  const removeItem = async () => {
    const response = await fetch(`/api/cart/${id}`, { method: 'DELETE' })

    if (response.ok) {
      await mutate()
    }
  }

  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-amber-50">
          {imageUrl ? (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
              aria-label={product?.name || 'Product image'}
              role="img"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-[#4D321E]">{product?.name || 'Product'}</p>
          <p className="mt-1 text-sm text-[#7A5D4B]">${unitPrice.toFixed(2)} each</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center overflow-hidden rounded-xl border border-amber-200">
            <button
              type="button"
              onClick={() => updateQuantity(quantity - 1)}
              className="px-3 py-2 text-[#6B4C3B] transition-colors hover:bg-amber-50"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>

            <span className="min-w-10 px-3 py-2 text-center text-sm font-semibold text-[#5C3A21]">{quantity}</span>

            <button
              type="button"
              onClick={() => updateQuantity(quantity + 1)}
              className="px-3 py-2 text-[#6B4C3B] transition-colors hover:bg-amber-50"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <p className="min-w-20 text-right text-sm font-bold text-[#4D321E]">${lineTotal.toFixed(2)}</p>

          <button
            type="button"
            onClick={removeItem}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
