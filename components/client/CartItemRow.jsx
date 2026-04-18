/**
 * components/client/CartItemRow.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A single row in the Cart Page  (Client Component)
 *
 * Displays one cart item with quantity controls and a remove button.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 'use client'
 *
 * import Image from 'next/image'
 * import { Minus, Plus, X } from 'lucide-react'
 *
 * // Props:
 * //   item: CartItem with product included
 * //   mutate: SWR mutate function to refresh cart after changes
 *
 * export default function CartItemRow({ item, mutate }) {
 *   const { product, quantity, id } = item
 *
 *   const updateQuantity = async (newQuantity) => {
 *     if (newQuantity < 1) return
 *     if (newQuantity > product.stock) return  // cap at available stock
 *     await fetch(`/api/cart/${id}`, {
 *       method: 'PATCH',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ quantity: newQuantity }),
 *     })
 *     mutate()  // re-fetch cart from SWR
 *   }
 *
 *   const removeItem = async () => {
 *     await fetch(`/api/cart/${id}`, { method: 'DELETE' })
 *     mutate()
 *   }
 *
 *   return (
 *     <div className="flex items-center gap-4 py-4 border-b">
 *       {/* Product image *\/}
 *       {/* Product name + price *\/}
 *       {/* Quantity controls: - [count] + *\/}
 *       {/* Line total: quantity × price *\/}
 *       {/* Remove button *\/}
 *     </div>
 *   )
 * }
 */
