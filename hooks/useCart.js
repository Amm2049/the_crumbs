'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { useToast } from '@/context/ToastContext'

const fetcher = async (url) => {
  const response = await fetch(url)
  if (!response.ok) return []
  const payload = await response.json()
  return Array.isArray(payload) ? payload : []
}

export function useCart() {
  const { data: session } = useSession()
  const { addToast } = useToast()
  const { data: cartItems = [], mutate, isLoading } = useSWR(
    session ? '/api/cart' : null, 
    fetcher, 
    { revalidateOnFocus: false }
  )

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
            const existing = current.find(item => item.productId === productId)
            if (existing) {
              return current.map(item => 
                item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
              )
            }
            // Note: In a real app, we might need a placeholder ID or more product info for the UI
            return [...current, { productId, quantity, id: 'temp-id', product: { id: productId } }]
          },
          rollbackOnError: true,
          revalidate: true, // Revalidate to get the full product info from server
        }
      )
    } catch (err) {
      addToast(err.message || 'Something went wrong with your order. 🍯', 'error')
    }
  }

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
    isLoading: isLoading && !!session,
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === 'ADMIN'
  }
}
