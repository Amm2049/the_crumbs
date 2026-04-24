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
    <div className="flex flex-col items-center justify-center gap-6 pt-8 border-t border-amber-100">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border-2 border-amber-100 text-[#4D321E] shadow-sm transition-all hover:border-amber-400 hover:bg-amber-50 disabled:opacity-30 disabled:hover:border-amber-100 disabled:hover:bg-white active:scale-90"
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
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                    : 'bg-white border-2 border-amber-100 text-[#4D321E] hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border-2 border-amber-100 text-[#4D321E] shadow-sm transition-all hover:border-amber-400 hover:bg-amber-50 disabled:opacity-30 disabled:hover:border-amber-100 disabled:hover:bg-white active:scale-90"
          aria-label="Next page"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <p className="text-xs font-bold text-[#7A5D4B] uppercase tracking-widest opacity-60">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} {label}
      </p>
    </div>
  )
}
