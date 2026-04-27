'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { useToast } from '@/context/ToastContext'

/** API Fetcher for SWR */
const fetcher = async (url) => {
  const response = await fetch(url)
  if (!response.ok) return []
  const payload = await response.json()
  return Array.isArray(payload) ? payload : []
}

/** Main Cart Hook - Manages all basket operations */
export function useCart() {
  const { data: session, status } = useSession()
  const { addToast } = useToast()
  const { data: cartItems = [], mutate, isLoading } = useSWR(
    session ? '/api/cart' : null,
    fetcher,
    // prevents unnecessary background refreshes every time the user switches tabs
    { revalidateOnFocus: false }
  )

  /** Adds an item to the basket or increases quantity */
  const addToCart = async (productId, quantity = 1) => {
    if (!session) return

    try {
      await mutate(
        async (current = []) => {
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity }),
          })

          if (!response.ok) {
            const payload = await response.json().catch(() => ({}))
            throw new Error(payload.error || 'Failed to add to cart')
          }

          const updatedItem = await response.json()
          addToast('Added to your basket! 🍯', 'success')

          // Cache Merging (add only updated one product)
          const existing = current.find(item => item.productId === productId)
          if (existing) {
            return current.map(item =>
              item.productId === productId ? { ...item, ...updatedItem } : item
            )
          }
          return [...current, updatedItem]
        },
        {
          optimisticData: (current = []) => {
            // Step A: Check if the product is already in our local cart
            const existing = current.find(item => item.productId === productId)
            if (existing) {
              // Step B: If it exists, just show the increased number (e.g., 1 -> 2)
              return current.map(item =>
                item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
              )
            }
            // Step C: If it's new, add a "ghost" item so the UI shows it immediately.
            return [...current, { productId, quantity, id: 'temp-id', product: { id: productId } }]
          },
          rollbackOnError: true,
          revalidate: true, // Revalidate to get the full product info from server (all products updated to cache)
        }
      )
    } catch (err) {
      addToast(err.message || 'Something went wrong with your order. 🍯', 'error')
      throw err
    }
  }

  /** Updates the quantity of a specific item */
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return removeItem(itemId)
    }

    try {
      await mutate(
        async (current = []) => {
          const response = await fetch(`/api/cart/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity }),
          })

          if (!response.ok) throw new Error('Failed to update')
          const updated = await response.json()
          return current.map(item => item.id === itemId ? { ...item, ...updated } : item)
        },
        {
          optimisticData: (current = []) =>
            current.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item),
          rollbackOnError: true,
          revalidate: false,
        }
      )
    } catch (err) {
      addToast('Could not update quantity. Please try again. 🍯', 'error')
    }
  }

  /** Removes an item completely from the basket */
  const removeItem = async (itemId) => {
    try {
      await mutate(
        async (current = []) => {
          const response = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
          if (!response.ok) throw new Error('Failed to remove item')
          addToast('Item removed from basket.', 'info')
          return current.filter(item => item.id !== itemId)
        },
        {
          rollbackOnError: true,
          revalidate: false,
        }
      )
    } catch (err) {
      addToast('Could not remove item. Please try again. 🍯', 'error')
    }
  }

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    mutate,
    isLoading: (isLoading && !!session) || status === 'loading',
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === 'ADMIN',
    status
  }
}
