import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { apiGet } from '@/lib/api-client'

export const metadata = {
  title: 'My Orders | The Crumbs',
}

import { Suspense } from 'react'
import OrdersClient from '@/components/client/OrdersClient'

export default async function OrdersPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  let orders = []

  try {
    orders = await apiGet('/api/orders', {
      cache: 'no-store',
    })
  } catch {
    orders = []
  }

  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-amber-100" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 w-full animate-pulse rounded-2xl bg-amber-50" />
          ))}
        </div>
      </div>
    }>
      <OrdersClient initialOrders={orders} />
    </Suspense>
  )
}
