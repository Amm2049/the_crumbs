'use client'

import { X, MapPin, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import OrderStatusTimeline from './OrderStatusTimeline'
import { formatCurrency } from '@/lib/utils'

const statusClasses = {
    PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    PROCESSING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    READY: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400',
    DELIVERED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

export default function OrderDetailModal({ order, onClose, onCancelled }) {
    const [isCancelling, setIsCancelling] = useState(false)
    const [cancelError, setCancelError] = useState('')

    const handleCancel = async () => {
        setCancelError('')
        setIsCancelling(true)

        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'CANCELLED',
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to cancel order')
            }

            // Signal to the parent component that cancellation was successful
            if (onCancelled) {
                await onCancelled(order.id)
            }

            // Optionally close the modal automatically after successful cancellation
            onClose()
        } catch (error) {
            console.error('Cancel order error:', error)
            setCancelError(error.message || 'Failed to cancel order')
        } finally {
            setIsCancelling(false)
        }
    }

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Panel ΓÇö stop click from bubbling to backdrop */}
            <div
                className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-amber-100 dark:border-zinc-800 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-black text-[var(--bakery-text)]">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                        </h2>
                        <p className="text-xs text-[var(--bakery-text-muted)]">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-400 hover:bg-amber-50 dark:hover:bg-zinc-800 hover:text-amber-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-5">

                    {/* Status badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--bakery-text-muted)]">Status</span>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusClasses[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {order.status}
                        </span>
                    </div>

                    {/* Order timeline - Realtime  */}
                    <OrderStatusTimeline status={order.status} updatedAt={order.updatedAt} />

                    {/* Items */}
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--bakery-text-muted)]">Items</p>
                        <ul className="space-y-2">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-zinc-800/50 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-bold text-[var(--bakery-text)]">{item.product?.name ?? 'Product'}</p>
                                        <p className="text-xs text-[var(--bakery-text-muted)]">x{item.quantity} · {formatCurrency(Number(item.price))} each</p>
                                    </div>
                                    <p className="text-sm font-black text-amber-700 dark:text-amber-400">
                                        {formatCurrency(item.quantity * Number(item.price))}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between border-t border-amber-100 dark:border-zinc-800 pt-4">
                        <span className="text-sm font-bold text-[var(--bakery-text-muted)]">Total</span>
                        <span className="text-xl font-black text-[var(--bakery-text)]">{formatCurrency(Number(order.total))}</span>
                    </div>

                    {/* Delivery Address */}
                    <div className="rounded-xl border border-amber-100 dark:border-zinc-700 bg-amber-50/30 dark:bg-zinc-800/50 px-4 py-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">
                            <MapPin size={11} />
                            <span>Delivery Address</span>
                        </div>
                        <p className="text-sm font-semibold text-[var(--bakery-text)]">{order.address || 'No address provided (historical order)'}</p>
                    </div>

                    {/* Special Instructions */}
                    {order.notes && (
                        <div className="rounded-xl border border-amber-100 dark:border-zinc-700 bg-amber-50/30 dark:bg-zinc-800/50 px-4 py-3 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">
                                <MessageSquare size={11} />
                                <span>Special Instructions</span>
                            </div>
                            <p className="text-sm italic text-[var(--bakery-text-muted)]">{order.notes}</p>
                        </div>
                    )}

                    {/* Cancel button ΓÇö only for PENDING orders */}
                    {order.status === 'PENDING' && (
                        <div className="pt-2">
                            {cancelError && (
                                <p className="mb-2 text-center text-xs font-bold text-red-500">{cancelError}</p>
                            )}
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="w-full rounded-xl border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 py-3 text-sm font-black uppercase tracking-widest text-red-600 dark:text-red-400 transition-all hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        </div>
                    )}


                </div>

            </div>
        </div>
    )
}
