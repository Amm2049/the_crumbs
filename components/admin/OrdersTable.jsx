'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  READY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-700',
}

const ALL_STATUSES = ['PENDING', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED']

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export default function OrdersTable({ orders = [] }) {
  const router = useRouter()
  const [pendingOrderId, setPendingOrderId] = useState('')
  const [localStatus, setLocalStatus] = useState({})
  const [tableError, setTableError] = useState('')

  const normalizedOrders = useMemo(() => (Array.isArray(orders) ? orders : []), [orders])

  const handleStatusChange = async (orderId, newStatus) => {
    setTableError('')
    setPendingOrderId(orderId)
    setLocalStatus((prev) => ({ ...prev, [orderId]: newStatus }))

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        let message = 'Unable to update order status.'
        try {
          const payload = await response.json()
          message = payload?.error || message
        } catch {
          // Keep fallback message.
        }
        setTableError(message)
        return
      }

      router.refresh()
    } catch {
      setTableError('Network error while updating order status.')
    } finally {
      setPendingOrderId('')
    }
  }

  if (normalizedOrders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-10 text-center">
        <p className="font-semibold text-[#6B4C3B]">No orders found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white">
      {tableError ? (
        <p className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{tableError}</p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-amber-50/70 text-xs uppercase tracking-wide text-[#7A5D4B]">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {normalizedOrders.map((order) => {
              const currentStatus = localStatus[order.id] ?? order.status
              const isUpdating = pendingOrderId === order.id
              return (
                <tr key={order.id} className="border-t border-amber-100/80">
                  <td className="px-4 py-3 font-semibold text-[#4D321E]">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#4D321E]">{order.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-[#8A6D5E]">{order.user?.email || 'No email'}</p>
                  </td>
                  <td className="px-4 py-3 text-[#6B4C3B]">{order.items?.length ?? 0}</td>
                  <td className="px-4 py-3 font-semibold text-[#4D321E]">${Number(order.total ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#6B4C3B]">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          'rounded-full px-2 py-1 text-xs font-bold uppercase',
                          STATUS_COLORS[currentStatus] || 'bg-gray-100 text-gray-700',
                        ].join(' ')}
                      >
                        {currentStatus}
                      </span>
                      <select
                        className="rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs font-semibold text-[#4D321E] outline-none focus:border-amber-400"
                        value={currentStatus}
                        disabled={isUpdating}
                        onChange={(event) => handleStatusChange(order.id, event.target.value)}
                      >
                        {ALL_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
