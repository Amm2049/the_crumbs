'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronLeft, UtensilsCrossed, MapPin, MessageSquare, ShoppingBag, X } from 'lucide-react'
import CartItemRow from '@/components/client/CartItemRow'
import ProductCard from '@/components/client/ProductCard'
import { CartSkeleton, ProductCardSkeleton } from '@/components/shared/Skeletons'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'

export default function CartPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const { cartItems, isLoading, removeItem, updateQuantity, flushCartSync, mutate } = useCart()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [placeOrderError, setPlaceOrderError] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [addressError, setAddressError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      if (cartItems.length === 0) {
        setRecommendations([])
        setLoadingRecs(false)
        return
      }
      try {
        const productIds = cartItems.map(item => item.productId).join(',')
        const res = await fetch(`/api/products/recommendations?type=cart&cartItems=${productIds}&limit=4`)
        if (res.ok) {
          const data = await res.json()
          setRecommendations(data)
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err)
      } finally {
        setLoadingRecs(false)
      }
    }
    fetchRecommendations()
  }, [cartItems])

  const total = cartItems.reduce((sum, item) => sum + Number(item.quantity ?? 0) * Number(item.product?.price ?? 0), 0)
  const totalItems = cartItems.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)

  // Step 1: validate, then show confirmation modal
  const handlePlaceOrder = async () => {
    if (isPlacingOrder || isSuccess) return
    setPlaceOrderError('')
    setAddressError('')

    if (!address.trim()) {
      setAddressError('Please enter a delivery address before placing your order.')
      return
    }

    if (flushCartSync) {
      await flushCartSync()
    }

    const invalidItems = cartItems.filter(item => {
      const stock = Number(item.product?.stock ?? 0);
      return !item.product?.isAvailable || stock < item.quantity;
    });

    if (invalidItems.length > 0) {
      addToast('Some items in your cart are out of stock or unavailable.', 'error');
      return;
    }

    setShowConfirm(true)
  }

  // Step 2: user confirmed — actually place the order
  const handleConfirmOrder = async () => {
    setShowConfirm(false)
    setIsPlacingOrder(true)

    try {
      if (flushCartSync) {
        await flushCartSync()
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim(), notes: notes.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPlaceOrderError(data?.error || 'Failed to place order')
        setIsPlacingOrder(false)
        return
      }

      setIsSuccess(true)
      setIsPlacingOrder(false)
      await mutate()
      router.push(`/checkout/${data.id}/pay`)
    } catch (err) {
      setPlaceOrderError(err?.message || 'Failed to place order')
      setIsPlacingOrder(false)
    }
  }

  if (isLoading || isSuccess) {
    return <CartSkeleton />
  }

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 py-8 pb-32 sm:px-6 lg:px-8 lg:pb-8">
      <Link href="/products" className="mb-6 flex w-fit items-center gap-1 text-sm font-bold uppercase tracking-widest text-amber-600/60 transition-colors hover:text-amber-700">
        <ChevronLeft size={16} />
        Continue Shopping
      </Link>
      <h1 className="mb-8 text-3xl font-extrabold text-[var(--bakery-text)] sm:text-4xl">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Left Column: Items */}
        <div className="min-h-[450px] space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-amber-50/30 dark:bg-zinc-900/30 rounded-[2rem] border-2 border-dashed border-amber-200 dark:border-zinc-800 px-6">
              <div className="mb-6 rounded-full bg-amber-100 dark:bg-zinc-800 p-6 text-amber-500">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[var(--bakery-text)]">Your basket is empty</h2>
              <p className="mt-2 text-[var(--bakery-text-muted)] max-w-xs">Add some artisanal treats to get started on your order.</p>
              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 px-10 py-4 text-sm font-black tracking-wide text-white shadow-xl shadow-amber-200 dark:shadow-amber-900/30 transition-all duration-300 hover:scale-[1.03] hover:brightness-110 active:scale-[0.97]"
              >
                <UtensilsCrossed size={18} />
                Browse Our Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdate={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Order Summary (Sticky on Desktop) */}
        <aside className="lg:sticky lg:top-28 h-fit">
          <div className="rounded-[2rem] border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-2xl shadow-amber-900/5">
            <h2 className="text-2xl font-bold text-[var(--bakery-text)] mb-8">Order Summary</h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between text-sm font-medium text-[var(--bakery-text-muted)]">
                <span>Total Items</span>
                <span className="text-[var(--bakery-text)]">{totalItems} units</span>
              </div>

              {/* Delivery Address + Notes */}
              <div className="mt-6 space-y-4">
                {/* Address — required */}
                <div>
                  <label
                    htmlFor="delivery-address"
                    className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Delivery Address <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="delivery-address"
                    type="text"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setAddressError('') }}
                    placeholder="E.g. 123 Sukhumvit Rd, Bangkok 10110"
                    className="w-full rounded-xl border border-amber-100 dark:border-zinc-700 bg-amber-50/30 dark:bg-zinc-800/50 px-4 py-3 text-sm text-[var(--bakery-text)] placeholder:text-[var(--bakery-text-muted)]/50 outline-none transition-all focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30"
                  />
                  {addressError && (
                    <p className="mt-1.5 text-[11px] font-bold text-red-500">{addressError}</p>
                  )}
                </div>

                {/* Notes — optional */}
                <div>
                  <label
                    htmlFor="order-notes"
                    className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                    </svg>
                    Special Instructions <span className="text-[var(--bakery-text-muted)]/40 font-bold normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    id="order-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Leave at door, ring bell, no onions..."
                    rows={2}
                    className="w-full resize-none rounded-xl border border-amber-100 dark:border-zinc-700 bg-amber-50/30 dark:bg-zinc-800/50 px-4 py-3 text-sm text-[var(--bakery-text)] placeholder:text-[var(--bakery-text-muted)]/50 outline-none transition-all focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30"
                  />
                </div>
              </div>

              <div className="pt-5 border-t border-amber-50 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[var(--bakery-text)]">Total Amount</span>
                  <span className="text-3xl font-black text-amber-600 dark:text-amber-500">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {placeOrderError && (
              <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold animate-shake">
                <span className="shrink-0 h-2 w-2 rounded-full bg-red-500" />
                {placeOrderError}
              </div>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || cartItems.length === 0}
              className="btn-shimmer mt-8 hidden lg:flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_100%] py-5 text-base font-black tracking-wide text-white transition-all duration-300 hover:scale-[1.03] hover:brightness-110 active:scale-[0.97] disabled:animation-none disabled:bg-none disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 [&:disabled]:animation-[none] disabled:[animation:none]"
            >
              {isPlacingOrder ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-[2.5px] border-white/30 border-t-white" />
                  <span className="tracking-widest text-sm">Processing…</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Place Your Order
                </>
              )}
            </button>

            <p className="mt-6 text-[10px] text-center text-[var(--bakery-text-muted)] font-semibold uppercase tracking-widest opacity-60">
              Secure Checkout
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile Sticky Footer */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-amber-100 dark:border-zinc-800 p-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="mx-auto max-w-lg">
              <div className="flex items-center justify-between mb-4 px-2">
                <div>
                  <p className="text-[10px] font-bold text-[var(--bakery-text-muted)] uppercase tracking-wider">Total Amount</p>
                  <p className="text-2xl font-black text-[var(--bakery-text)]">{formatCurrency(total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[var(--bakery-text-muted)] uppercase tracking-wider">Items</p>
                  <p className="text-lg font-bold text-[var(--bakery-text)]">{totalItems}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="btn-shimmer flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 py-4 text-base font-black tracking-wide text-white transition-all duration-300 hover:brightness-110 active:scale-95 disabled:[animation:none] disabled:bg-none disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none"
              >
                {isPlacingOrder ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-[2.5px] border-white/30 border-t-white" />
                    <span className="tracking-widest text-sm">Processing…</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Place Your Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-amber-50 dark:border-zinc-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-50 dark:border-zinc-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-400">
                  <ShoppingBag size={18} />
                </div>
                <h2 className="text-base font-black text-[var(--bakery-text)]">Confirm Your Order</h2>
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-amber-50 dark:hover:bg-zinc-800 hover:text-amber-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs text-[var(--bakery-text-muted)] font-semibold">Please review your order details before confirming.</p>

              {/* Items + Total */}
              <div className="rounded-2xl border border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/40 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--bakery-text)]">
                  <ShoppingBag size={14} className="text-amber-500" />
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </div>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(total)}</span>
              </div>

              {/* Address */}
              <div className="rounded-2xl border border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/40 px-4 py-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">
                  <MapPin size={11} />
                  Delivery Address
                </div>
                <p className="text-sm font-semibold text-[var(--bakery-text)]">{address.trim()}</p>
              </div>

              {/* Notes — only if filled */}
              {notes.trim() && (
                <div className="rounded-2xl border border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/40 px-4 py-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">
                    <MessageSquare size={11} />
                    Special Instructions
                  </div>
                  <p className="text-sm italic text-[var(--bakery-text-muted)]">{notes.trim()}</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 border-t border-amber-50 dark:border-zinc-800 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border-2 border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-3 text-sm font-black text-[var(--bakery-text)] transition-all hover:bg-amber-50 dark:hover:bg-zinc-700 active:scale-95"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="flex-1 btn-shimmer rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_100%] py-3 text-sm font-black text-white transition-all duration-300 hover:brightness-110 active:scale-95"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Your Order Section */}
      {cartItems.length > 0 && (
        <div className="mt-16 border-t border-amber-100/50 dark:border-zinc-800/50 pt-12">
          <div className="mb-8 space-y-1">
            <h2 className="text-2xl font-extrabold text-[var(--bakery-text)]">Complete Your Order</h2>
            <p className="text-sm text-[var(--bakery-text-muted)]">Customers also loved adding these delicious treats</p>
          </div>
          
          {loadingRecs ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            recommendations.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {recommendations.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Full-screen Loading Overlay during checkout creation */}
      {isPlacingOrder && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-2xl border border-amber-50 dark:border-zinc-800 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-amber-500/20 border-t-amber-500" />
            <div>
              <p className="text-lg font-black text-[var(--bakery-text)]">Securing Your Treats...</p>
              <p className="text-xs text-[var(--bakery-text-muted)] font-semibold mt-1">Please wait while we prepare your checkout.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
