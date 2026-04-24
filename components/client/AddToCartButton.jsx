'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function AddToCartButton({ productId, disabled = false }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const isAdmin = session?.user?.role === 'ADMIN'
  const isCustomer = session && !isAdmin

  if (!isCustomer) return null

  useEffect(() => {
    if (status !== 'success') return

    const timeoutId = setTimeout(() => {
      setStatus('idle')
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [status])

  const handleAddToCart = async () => {
    setError('')

    if (!session) {
      router.push('/login')
      return
    }

    if (disabled || isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (!response.ok) {
        let message = 'Unable to add this item to the cart right now.'

        try {
          const payload = await response.json()
          message = payload?.error || message
        } catch {
          // Ignore JSON parsing errors and use fallback message.
        }

        setStatus('error')
        setError(message)
        return
      }

      setStatus('success')
      router.refresh()
    } catch {
      setStatus('error')
      setError('Network issue while adding to cart. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || isLoading}
        size="lg"
        className="bg-amber-500 text-white hover:bg-amber-600"
      >
        <ShoppingCart size={18} />
        {isLoading ? 'Adding...' : status === 'success' ? 'Added to Cart' : 'Add to Cart'}
      </Button>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  )
}
