'use client'

import { ClipboardCheck, Flame, Package, CheckCircle2, XCircle } from 'lucide-react'

const STEPS = [
  {
    id: 'PENDING',
    title: 'Order Placed',
    description: "We've received your order and it's being reviewed.",
    icon: ClipboardCheck,
  },
  {
    id: 'PROCESSING',
    title: 'Baking & Preparing',
    description: 'Our bakers are preparing your order fresh in the kitchen.',
    icon: Flame,
  },
  {
    id: 'READY',
    title: 'Ready for Pickup',
    description: 'Your order is baked, packed, and waiting for you!',
    icon: Package,
  },
  {
    id: 'DELIVERED',
    title: 'Delivered',
    description: 'Completed — enjoy your freshly baked treats!',
    icon: CheckCircle2,
  },
]

const STATUS_ORDER = ['PENDING', 'PROCESSING', 'READY', 'DELIVERED']

export default function OrderStatusTimeline({ status, updatedAt }) {
  const timeStr = updatedAt
    ? new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(updatedAt))
    : ''

  // ── Cancelled Layout ──────────────────────────────────────────────
  if (status === 'CANCELLED') {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-gradient-to-br from-red-50/60 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10 p-5 space-y-3">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400 shadow-sm">
            <XCircle size={22} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-red-700 dark:text-red-400">
              Order Cancelled
            </h3>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-red-600/70 dark:text-red-400/60">
              This order has been cancelled and any deducted stock has been restored.
            </p>
            {timeStr && (
              <span className="mt-2.5 inline-block rounded-lg bg-red-100/60 dark:bg-red-900/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-400">
                Cancelled at {timeStr}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Normal Timeline ───────────────────────────────────────────────
  const currentIndex = STATUS_ORDER.indexOf(status)

  return (
    <div className="rounded-2xl border border-amber-100 dark:border-zinc-800 bg-gradient-to-br from-amber-50/30 to-white dark:from-zinc-900 dark:to-zinc-900 p-5">
      <h3 className="mb-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bakery-text-muted)]">
        Track Your Order
      </h3>

      <div className="relative ml-[18px] border-l-2 border-amber-100 dark:border-zinc-800 pl-7 space-y-7">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex
          const isActive = idx === currentIndex
          const isFuture = idx > currentIndex
          const StepIcon = step.icon

          return (
            <div key={step.id} className="relative">
              {/* ── Timeline Node ── */}
              <div className="absolute -left-[37px] top-0.5 flex items-center justify-center">
                {isCompleted ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-md shadow-amber-200 dark:shadow-amber-900/30 transition-all duration-500">
                    <CheckCircle2 size={14} strokeWidth={3} />
                  </div>
                ) : isActive ? (
                  <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-300/50 dark:shadow-amber-800/40 transition-all duration-500">
                    <StepIcon size={13} strokeWidth={2.5} />
                    {/* Pulse ring */}
                    <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/30" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-amber-300 dark:text-zinc-600 transition-all duration-500">
                    <StepIcon size={13} strokeWidth={2} />
                  </div>
                )}
              </div>

              {/* ── Step Content ── */}
              <div
                className={`transition-all duration-300 ${
                  isFuture ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <h4
                  className={`text-sm font-black ${
                    isActive
                      ? 'text-amber-700 dark:text-amber-400'
                      : isCompleted
                      ? 'text-[var(--bakery-text)]'
                      : 'text-[var(--bakery-text-muted)]'
                  }`}
                >
                  {step.title}
                </h4>
                <p className="mt-0.5 text-xs font-semibold leading-relaxed text-[var(--bakery-text-muted)]">
                  {step.description}
                </p>

                {/* Timestamp badge on active step */}
                {isActive && timeStr && (
                  <span className="mt-2 inline-block rounded-md bg-amber-100/60 dark:bg-zinc-800 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Updated at {timeStr}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
