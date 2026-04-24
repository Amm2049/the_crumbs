'use client'

import Link from 'next/link'
import { Plus, CheckCircle } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'

export default function ProductCard({ product }) {
  const router = useRouter()
  const { cartItems, addToCart, updateQuantity, isAuthenticated, isAdmin } = useCart()
  
  const imageUrl = Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : ''
  const unavailable = !product?.isAvailable || Number(product?.stock ?? 0) < 1
  const price = Number(product?.price ?? 0)

  // Check if item is in cart
  const cartItem = cartItems.find(item => item.productId === product.id)
  const quantity = cartItem ? cartItem.quantity : 0

  const handleAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    await addToCart(product.id, 1)
  }


  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-amber-100 bg-white transition-all hover:shadow-xl hover:shadow-amber-900/5">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-amber-50">
          {imageUrl ? (
            <div 
              className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
              style={{ backgroundImage: `url(${imageUrl})` }} 
            />
          ) : null}

          {unavailable ? (
            <div className="absolute inset-0 grid place-items-center bg-[#3F2A1D]/40 text-sm font-bold text-white backdrop-blur-[2px]">
              Sold Out
            </div>
          ) : (
            /* Floating Cart Controls - Hidden for Admins */
            !isAdmin && (
              <div className="absolute bottom-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
                {quantity > 0 ? (
                  <div 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push('/cart');
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 shadow-sm backdrop-blur-sm transition-all hover:bg-emerald-100 hover:scale-105 cursor-pointer"
                  >
                    <CheckCircle size={12} strokeWidth={3} />
                    <span>In Cart</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAdd}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-amber-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-amber-600"
                    aria-label="Add to cart"
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>
            )
          )}
        </div>

        <div className="space-y-1.5 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 sm:text-[10px]">
              {product?.category?.name || 'Handcrafted'}
            </p>
            <p className="text-sm font-black text-[#4D321E] sm:text-base">${price.toFixed(2)}</p>
          </div>
          <h3 className="text-sm font-bold text-[#4D321E] transition-colors group-hover:text-amber-800 sm:text-base truncate">
            {product?.name}
          </h3>
          <p className="text-[10px] leading-relaxed text-[#7A5D4B] line-clamp-1 sm:text-[11px]">
            {product?.description || 'Freshly baked item.'}
          </p>
        </div>
      </Link>
    </div>
  )
}
