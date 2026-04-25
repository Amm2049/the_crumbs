'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  isDeleting = false,
}) {
  // Track when we're mounted on the client so createPortal works safely in Next.js
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onCancel])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Full-screen backdrop — rendered via portal so nothing clips it */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-xs animate-fade-up rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl border border-amber-50 dark:border-zinc-800">

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-3">
          Confirm Delete
        </p>

        <h2
          id="confirm-modal-title"
          className="text-base font-extrabold text-[var(--bakery-text)] leading-snug"
        >
          {title}
        </h2>

        <p className="mt-2 text-sm text-[var(--bakery-text-muted)] leading-relaxed">
          {description}
        </p>

        <div className="my-5 h-px bg-[#F0E8E0] dark:bg-zinc-800" />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-[#F5EFE6] dark:bg-zinc-800 py-2.5 text-sm font-bold text-[var(--bakery-text)] transition-colors hover:bg-amber-100 dark:hover:bg-zinc-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Deleting…
              </span>
            ) : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body  // ← Renders directly into <body>, bypasses all stacking contexts
  )
}
