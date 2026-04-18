/**
 * components/client/AddToCartButton.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Add to Cart Button — Client Component
 * Used on the Product Detail page.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 'use client'
 *
 * import { useState } from 'react'
 * import { useSession } from 'next-auth/react'
 * import { useRouter } from 'next/navigation'
 * import { Button } from '@/components/ui/button'
 * import { ShoppingCart } from 'lucide-react'
 *
 * // Props: productId (string)
 * export default function AddToCartButton({ productId }) {
 *   const { data: session } = useSession()
 *   const router = useRouter()
 *   const [isLoading, setIsLoading] = useState(false)
 *   const [added, setAdded] = useState(false)
 *
 *   const handleAddToCart = async () => {
 *     // If not logged in, redirect to /login
 *     if (!session) {
 *       router.push('/login')
 *       return
 *     }
 *
 *     setIsLoading(true)
 *     const res = await fetch('/api/cart', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ productId, quantity: 1 }),
 *     })
 *     setIsLoading(false)
 *
 *     if (res.ok) {
 *       setAdded(true)
 *       setTimeout(() => setAdded(false), 2000)  // reset after 2s
 *     }
 *   }
 *
 *   return (
 *     <Button onClick={handleAddToCart} disabled={isLoading} size="lg">
 *       <ShoppingCart size={18} />
 *       {isLoading ? 'Adding...' : added ? '✓ Added!' : 'Add to Cart'}
 *     </Button>
 *   )
 * }
 */
