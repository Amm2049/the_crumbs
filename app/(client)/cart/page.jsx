'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

import CartItemRow from '@/components/client/CartItemRow'

const fetcher = async (url) => {
  const response = await fetch(url)
  if (!response.ok) return []

  const payload = await response.json()
  return Array.isArray(payload) ? payload : []
}

export default function CartPage() {
  const router = useRouter()
  const { data: cartItems = [], mutate, isLoading } = useSWR('/api/cart', fetcher, {
    revalidateOnFocus: false,
  })

  const total = cartItems.reduce((sum, item) => sum + Number(item.quantity ?? 0) * Number(item.product?.price ?? 0), 0)
  const totalItems = cartItems.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)

  const handlePlaceOrder = async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      return
    }

    await mutate()
    router.push('/orders')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-[#6B4C3B]">Loading cart...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-[#4D321E]">Your cart is empty</h1>
        <p className="mt-3 text-[#7A5D4B]">Add a few bakery favorites to get started.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-extrabold text-[#4D321E]">Your Cart</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {cartItems.map((item) => (
            <CartItemRow key={item.id} item={item} mutate={mutate} />
          ))}
        </div>

        <aside className="rounded-2xl border border-amber-100 bg-white p-5">
          <h2 className="text-lg font-bold text-[#4D321E]">Order Summary</h2>

          <div className="mt-4 space-y-2 text-sm text-[#6B4C3B]">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span className="font-semibold">{totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span className="text-base font-extrabold text-[#4D321E]">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            className="mt-5 w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            Place Order
          </button>
        </aside>
      </div>
    </div>
  )
}
