'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

import { Button } from '@/components/ui/button'

export default function AddToCartButton({ productId, quantity = 1, disabled = false, className = "", isUpdate = false }) {
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const isAdmin = session?.user?.role === 'ADMIN'
  const isCustomer = session && !isAdmin

  if (authStatus === 'loading') {
    return (
      <div className={`h-14 w-full animate-pulse rounded-xl bg-amber-100/80 ${className}`} />
    )
  }

  if (!isCustomer && session) return null
  // For guest users, we show the button which redirects to login

  useEffect(() => {
    if (status !== 'success') return

    const timeoutId = setTimeout(() => {
      setStatus('idle')
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [status])

  const { addToCart } = useCart()

  const handleAddToCart = async () => {
    setError('')

    if (!session) {
      router.push('/login')
      return
    }

    if (disabled || isLoading) return

    setIsLoading(true)

    try {
      await addToCart(productId, Number(quantity))
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Could not add to cart.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || isLoading}
        size="lg"
        className={`w-full bg-amber-500 text-white hover:bg-amber-600 h-full ${className.includes('rounded') ? '' : 'rounded-xl'}`}
      >
        <ShoppingCart size={18} />
        {isLoading ? 'Adding...' : status === 'success' ? 'Added to Cart' : (isUpdate ? 'Add More to Cart' : 'Add to Cart')}
      </Button>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  )
}
