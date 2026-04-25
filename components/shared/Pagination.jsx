'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems,
  startIndex,
  label = 'items'
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col items-center justify-center gap-6 pt-8 border-t border-amber-100 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border-2 border-amber-100 dark:border-zinc-800 text-[var(--bakery-text)] shadow-sm transition-all hover:border-amber-400 dark:hover:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:border-amber-100 dark:disabled:hover:border-zinc-800 disabled:hover:bg-white dark:disabled:hover:bg-zinc-900 active:scale-90"
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1
            // Logic to show limited pages if many
            if (
              totalPages > 7 &&
              pageNum !== 1 &&
              pageNum !== totalPages &&
              (pageNum < currentPage - 1 || pageNum > currentPage + 1)
            ) {
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className="px-1 text-amber-300">...</span>
              }
              return null
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black transition-all active:scale-90 ${
                  currentPage === pageNum
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-none'
                    : 'bg-white dark:bg-zinc-900 border-2 border-amber-100 dark:border-zinc-800 text-[var(--bakery-text)] hover:border-amber-400 dark:hover:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-zinc-800'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border-2 border-amber-100 dark:border-zinc-800 text-[var(--bakery-text)] shadow-sm transition-all hover:border-amber-400 dark:hover:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:border-amber-100 dark:disabled:hover:border-zinc-800 disabled:hover:bg-white dark:disabled:hover:bg-zinc-900 active:scale-90"
          aria-label="Next page"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <p className="text-xs font-bold text-[var(--bakery-text-muted)] uppercase tracking-widest opacity-60">
        Showing {totalItems === 0 ? 0 : Math.min(startIndex + 1, totalItems)}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} {label}
      </p>
    </div>
  )
}
