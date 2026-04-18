/**
 * app/(client)/cart/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cart Page  →  URL: /cart
 * Protected by middleware — redirects to /login if not authenticated.
 *
 * Displays the user's cart items and allows them to place an order.
 * This should be a Client Component to enable real-time cart updates.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 'use client'
 *
 * import useSWR from 'swr'
 * import CartItemRow from '@/components/client/CartItemRow'
 *
 * const fetcher = (url) => fetch(url).then(res => res.json())
 *
 * export default function CartPage() {
 *   // STEP 1 — Fetch cart with SWR (auto-revalidates)
 *   const { data: cartItems, mutate, isLoading } = useSWR('/api/cart', fetcher)
 *
 *   // STEP 2 — Calculate total
 *   const total = cartItems?.reduce(
 *     (sum, item) => sum + item.quantity * item.product.price, 0
 *   ) ?? 0
 *
 *   // STEP 3 — Place order handler
 *   const handlePlaceOrder = async () => {
 *     // POST to /api/orders
 *     // On success: show success message, mutate cart (it will be empty now), redirect to /orders
 *     // Handle errors (out of stock, etc.)
 *   }
 *
 *   // STEP 4 — Render
 *   // - List of CartItemRow components (pass item + mutate for optimistic updates)
 *   // - Order summary (subtotal, item count)
 *   // - Optional: customer notes textarea
 *   // - "Place Order" button
 *   // - Empty state: "Your cart is empty" with link to /products
 * }
 */
