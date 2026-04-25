'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Star, Clock, ShieldCheck, Leaf, ShoppingCart, Minus, Plus, ShoppingBag, ShoppingBasket } from 'lucide-react'
import AddToCartButton from '@/components/client/AddToCartButton'
import { useCart } from '@/hooks/useCart'

export default function ProductDetailClient({ product }) {
  const { cartItems, isAuthenticated, isLoading } = useCart()
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : []
  const [activeImage, setActiveImage] = useState(images[0] || '')
  const [quantity, setQuantity] = useState(1)

  const inStock = product.isAvailable && Number(product.stock ?? 0) > 0
  const price = Number(product.price ?? 0)

  const cartItem = cartItems.find(item => item.productId === product.id)
  const isInCart = !!cartItem
  const remainingStock = Math.max(0, Number(product.stock || 0) - (cartItem?.quantity || 0))
  const isFullyStockedInCart = remainingStock <= 0

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs / Back Link */}
      <nav className="mb-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-600/60">
        <Link href="/products" className="flex items-center gap-1 transition-colors hover:text-amber-700 dark:hover:text-amber-400">
          <ChevronLeft size={16} />
          Shop
        </Link>
        <span>/</span>
        <span className="text-[var(--bakery-text)]">{product.category?.name || 'Treats'}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="group relative aspect-square max-w-xl mx-auto overflow-hidden rounded-[2rem] border-4 border-white dark:border-zinc-800 bg-amber-50 dark:bg-zinc-900 shadow-xl shadow-amber-900/5 transition-all duration-500 hover:shadow-amber-900/15">
            {activeImage ? (
              <div
                className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${activeImage}')` }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-amber-200">
                <ShoppingBag size={48} />
              </div>
            )}

            {/* "Freshly Baked" Badge */}
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 shadow-sm">
              <Clock size={12} />
              Freshly Baked
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3">
              {images.map((image, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(image)}
                  className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-all duration-300 ${activeImage === image
                    ? 'border-amber-400 shadow-md shadow-amber-200 dark:shadow-none scale-105'
                    : 'border-white dark:border-zinc-800 hover:border-amber-100 dark:hover:border-zinc-700 hover:scale-105 shadow-sm'
                    }`}
                >
                  <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">
                {product.category?.name || 'Handcrafted'}
              </span>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill="currentColor" />)}
                <span className="ml-1 text-[10px] font-bold text-[var(--bakery-text-muted)]">(4.9)</span>
              </div>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-[var(--bakery-text)] sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-end gap-3 pt-1">
              <div className="flex items-end gap-2">
                <p className="text-3xl font-black text-amber-600 dark:text-amber-500">${price.toFixed(2)}</p>
                <p className="mb-1 text-[11px] font-bold text-[var(--bakery-text-muted)]">per treat</p>
              </div>

              {isInCart && (
                <div className="mb-1 flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
                  <ShoppingBasket size={12} />
                  <span>{cartItem.quantity} in Basket</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500/80">Baker's Description</h3>
            <p className="text-base leading-relaxed text-[var(--bakery-text)] font-medium">
              {product.description || "Our artisanal creation, baked fresh daily using premium local ingredients and a secret family recipe passed down through generations."}
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-2 gap-4 border-y border-amber-100 dark:border-zinc-800 py-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-50 dark:bg-green-900/20 p-1.5 text-green-600 dark:text-green-400">
                <Leaf size={16} />
              </div>
              <span className="text-xs font-bold text-[var(--bakery-text)]">Natural Ingredients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-1.5 text-blue-600 dark:text-blue-400">
                <ShieldCheck size={16} />
              </div>
              <span className="text-xs font-bold text-[var(--bakery-text)]">Safety Guaranteed</span>
            </div>
          </div>

          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-5">
              {/* Quantity Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)] opacity-60">Quantity</label>
                {isLoading ? (
                  <div className="h-10 w-24 animate-pulse rounded-xl bg-amber-100/80" />
                ) : (
                  <div className="flex items-center rounded-xl border-2 border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isFullyStockedInCart}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bakery-text)] transition-colors hover:bg-amber-50 dark:hover:bg-zinc-800 active:scale-90 disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-8 text-center text-sm font-black text-[var(--bakery-text)]">{isFullyStockedInCart ? 0 : quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(remainingStock, quantity + 1))}
                      disabled={isFullyStockedInCart || quantity >= remainingStock}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bakery-text)] transition-colors hover:bg-amber-50 dark:hover:bg-zinc-800 active:scale-90 disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col mt-4">
                <p className={`text-[10px] font-black uppercase tracking-widest ${inStock && !isFullyStockedInCart ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {inStock ? (isFullyStockedInCart ? 'Limit Reached' : 'Ready for Pickup') : 'Sold Out'}
                </p>
                <p className="text-[10px] font-bold text-[var(--bakery-text-muted)]">
                  {inStock 
                    ? (isFullyStockedInCart 
                        ? 'All available stock is in your basket' 
                        : `${remainingStock} more available`) 
                    : 'Baking more soon!'}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <AddToCartButton
                productId={product.id}
                quantity={quantity}
                disabled={!inStock || isFullyStockedInCart}
                isUpdate={isInCart}
                className="h-14 flex-1 rounded-xl text-base font-black"
              />
            </div>
          </div>

          {/* Baker's Note Box */}
          <div className="rounded-2xl bg-amber-50 dark:bg-zinc-800/50 p-5 border-2 border-white dark:border-zinc-800 shadow-sm">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">Baker's Note</p>
            <p className="text-xs font-medium italic text-[var(--bakery-text)]">
              "This treat is best enjoyed warm with a cup of our signature honey tea. Keep stored in a cool, dry place for up to 3 days."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
