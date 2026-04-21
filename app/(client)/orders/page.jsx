import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import db from '@/lib/db'

export const metadata = {
  title: 'My Orders | The Crumbs',
}

const statusClasses = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  READY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-700',
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export default async function OrdersPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  let orders = []

  try {
    orders = await db.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    orders = []
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-[#4D321E]">My Orders</h1>
        <p className="mt-3 text-[#7A5D4B]">You have not placed any orders yet.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-[#4D321E]">My Orders</h1>

      {orders.map((order) => (
        <article key={order.id} className="rounded-2xl border border-amber-100 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#6B4C3B]">Order #{order.id.slice(0, 8)}</p>
              <p className="text-xs text-[#8A6D5E]">Placed on {formatDate(order.createdAt)}</p>
            </div>

            <span
              className={[
                'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
                statusClasses[order.status] || 'bg-gray-100 text-gray-700',
              ].join(' ')}
            >
              {order.status}
            </span>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-[#5B4333]">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <span>{item.product?.name || 'Product'}</span>
                <span>x{item.quantity}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-amber-100 pt-3 text-right">
            <p className="text-sm text-[#6B4C3B]">Total</p>
            <p className="text-lg font-extrabold text-[#4D321E]">${Number(order.total ?? 0).toFixed(2)}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
