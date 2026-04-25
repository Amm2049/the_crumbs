'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function CartItemRow({ item, onUpdate, onRemove }) {
  const { id, product, quantity } = item
  const unitPrice = Number(product?.price ?? 0)
  const lineTotal = unitPrice * Number(quantity ?? 0)
  const maxStock = Number(product?.stock ?? 0)
  const imageUrl = Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : ''
  const [isRemoving, setIsRemoving] = useState(false)

  const handleUpdate = async (newQuantity) => {
    if (newQuantity < 1) return
    if (maxStock > 0 && newQuantity > maxStock) return
    await onUpdate(id, newQuantity)
  }

  const handleRemove = async () => {
    if (isRemoving) return
    setIsRemoving(true)
    try {
      await onRemove(id)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="group rounded-2xl border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all duration-300 hover:translate-x-1 hover:border-amber-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-amber-900/5">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-amber-50 dark:bg-zinc-800 sm:h-20 sm:w-20">
          {imageUrl ? (
            <div
              className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${imageUrl})` }}
              aria-label={product?.name || 'Product image'}
              role="img"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-amber-200">
              <Plus size={24} />
            </div>
          )}
        </div>

        {/* Product Info & Controls */}
        <div className="flex flex-1 flex-col justify-between min-w-0 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-[var(--bakery-text)] sm:text-lg">{product?.name || 'Product'}</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--bakery-text-muted)]">${unitPrice.toFixed(2)} each</p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 sm:mt-0 sm:justify-end">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center overflow-hidden rounded-xl border border-amber-200 dark:border-zinc-700 bg-amber-50/50 dark:bg-zinc-800/50">
                <button
                  type="button"
                  onClick={() => handleUpdate(quantity - 1)}
                  className="px-2.5 py-1.5 text-[var(--bakery-text-muted)] transition-colors hover:bg-amber-100 dark:hover:bg-zinc-700 disabled:opacity-30"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>

                <span className="min-w-8 px-1 text-center text-sm font-bold text-[var(--bakery-text)]">{quantity}</span>

                <button
                  type="button"
                  onClick={() => handleUpdate(quantity + 1)}
                  className="px-2.5 py-1.5 text-[var(--bakery-text-muted)] transition-colors hover:bg-amber-100 dark:hover:bg-zinc-700 disabled:opacity-30"
                  disabled={maxStock > 0 && quantity >= maxStock}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <p className="min-w-[70px] text-right text-base font-black text-amber-700 dark:text-amber-500 sm:text-[var(--bakery-text)]">
                ${lineTotal.toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="ml-1 rounded-full p-2 text-red-500 transition-all hover:bg-red-50 hover:text-red-600 active:scale-90 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Remove item"
            >
              {isRemoving ? (
                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
