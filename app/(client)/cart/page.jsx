'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import CartItemRow from '@/components/client/CartItemRow'
import { CartSkeleton } from '@/components/shared/Skeletons'
import { useCart } from '@/hooks/useCart'

export default function CartPage() {
  const router = useRouter()
  const { cartItems, isLoading, removeItem, updateQuantity, mutate } = useCart()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [placeOrderError, setPlaceOrderError] = useState('')

  const total = cartItems.reduce((sum, item) => sum + Number(item.quantity ?? 0) * Number(item.product?.price ?? 0), 0)
  const totalItems = cartItems.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)

  const handlePlaceOrder = async () => {
    if (isPlacingOrder || isSuccess) return
    setPlaceOrderError('')
    setIsPlacingOrder(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        let message = 'Failed to place order'
        try {
          const payload = await response.json()
          if (payload?.error) message = payload.error
        } catch { }
        setPlaceOrderError(message)
        setIsPlacingOrder(false)
        return
      }

      // Order placed successfully
      setIsSuccess(true)
      setIsPlacingOrder(false)

      // Refresh cart state to clear it
      await mutate()

      // Redirect to orders
      router.push('/orders')
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
      <h1 className="mb-8 text-3xl font-extrabold text-[#4D321E] sm:text-4xl">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Left Column: Items */}
        <div className="min-h-[450px] space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-amber-50/30 rounded-[2rem] border-2 border-dashed border-amber-200 px-6">
              <div className="mb-6 rounded-full bg-amber-100 p-6 text-amber-500">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#4D321E]">Your basket is empty</h2>
              <p className="mt-2 text-[#7A5D4B] max-w-xs">Add some artisanal treats to get started on your order.</p>
              <Link
                href="/products"
                className="mt-8 inline-flex rounded-full bg-amber-500 px-10 py-4 text-sm font-bold text-white shadow-xl shadow-amber-200 transition-all hover:bg-amber-600 hover:scale-105 active:scale-95"
              >
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
          <div className="rounded-[2rem] border border-amber-100 bg-white p-8 shadow-2xl shadow-amber-900/5">
            <h2 className="text-2xl font-bold text-[#4D321E] mb-8">Order Summary</h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between text-sm font-medium text-[#7A5D4B]">
                <span>Total Items</span>
                <span className="text-[#4D321E]">{totalItems} units</span>
              </div>
              
              <div className="pt-5 border-t border-amber-50">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#4D321E]">Total Amount</span>
                  <span className="text-3xl font-black text-amber-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {placeOrderError && (
              <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold animate-shake">
                <span className="shrink-0 h-2 w-2 rounded-full bg-red-500" />
                {placeOrderError}
              </div>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || cartItems.length === 0}
              className="mt-8 hidden lg:flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 py-5 text-base font-black text-white shadow-xl shadow-amber-200 transition-all hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98] disabled:bg-amber-100 disabled:text-amber-300 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100"
            >
              {isPlacingOrder ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processing...
                </>
              ) : (
                'Place Your Order'
              )}
            </button>
            
            <p className="mt-6 text-[10px] text-center text-[#7A5D4B] font-semibold uppercase tracking-widest opacity-60">
              Secure Checkout
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile Sticky Footer */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
          <div className="bg-white/80 backdrop-blur-xl border-t border-amber-100 p-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="mx-auto max-w-lg">
              <div className="flex items-center justify-between mb-4 px-2">
                <div>
                  <p className="text-[10px] font-bold text-[#7A5D4B] uppercase tracking-wider">Total Amount</p>
                  <p className="text-2xl font-black text-[#4D321E]">${total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#7A5D4B] uppercase tracking-wider">Items</p>
                  <p className="text-lg font-bold text-[#4D321E]">{totalItems}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 py-4 text-lg font-black text-white shadow-xl shadow-amber-200 transition-all active:scale-95 disabled:bg-amber-100 disabled:text-amber-300"
              >
                {isPlacingOrder ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
