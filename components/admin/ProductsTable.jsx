'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Pencil, Trash2, ChevronLeft, ChevronRight, Plus, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import ConfirmModal from '@/components/admin/ConfirmModal'
import ProductModal from './ProductModal'

// ─── Pagination bar ──────────────────────────────────────────────────────────
function PaginationBar({ page, totalPages }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const go = (p) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-amber-100 dark:border-zinc-800 px-5 py-3">
      <p className="text-xs font-semibold text-[var(--bakery-text-muted)]">
        Page <span className="text-[var(--bakery-text)]">{page}</span> of <span className="text-[var(--bakery-text)]">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => go(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 dark:border-zinc-700 text-[var(--bakery-text)] transition-colors hover:bg-amber-50 dark:hover:bg-zinc-800 disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => go(p)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
              p === page
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                : 'border border-amber-200 dark:border-zinc-700 text-[var(--bakery-text)] hover:bg-amber-50 dark:hover:bg-zinc-800'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 dark:border-zinc-700 text-[var(--bakery-text)] transition-colors hover:bg-amber-50 dark:hover:bg-zinc-800 disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductsTable({ products = [], categories = [], page = 1, totalPages = 1, total = 0 }) {
  const router = useRouter()
  const { addToast } = useToast()

  const [modal, setModal] = useState({ open: false, product: null })
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  const openAdd = () => setModal({ open: true, product: null })
  const openEdit = (p) => setModal({ open: true, product: p })
  const closeModal = () => setModal({ open: false, product: null })

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/products/${confirmDelete.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        addToast(payload.error || 'Failed to delete product.', 'error')
        return
      }
      addToast(`"${confirmDelete.name}" deleted.`, 'success')
      setConfirmDelete({ open: false, id: null, name: '' })
      router.refresh()
    } catch {
      addToast('Network error.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <ConfirmModal
        isOpen={confirmDelete.open}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null, name: '' })}
        isDeleting={isDeleting}
        title="Delete Product?"
        description={`"${confirmDelete.name}" will be removed forever.`}
      />

      <ProductModal
        isOpen={modal.open}
        onClose={closeModal}
        product={modal.product}
        categories={categories}
      />

      <div className="space-y-4">
        {/* Table Controls (Header) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-black text-[var(--bakery-text)]">Menu Items</h2>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">({total} total)</span>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-600 active:scale-95"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-amber-900/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-amber-50/40 dark:bg-zinc-800/50 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--bakery-text-muted)]">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50 dark:divide-zinc-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-20 text-center text-[var(--bakery-text-muted)] font-bold">No products found.</td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const imageUrl = p.images?.[0]
                    return (
                      <tr key={p.id} className="group transition-colors hover:bg-amber-50/20 dark:hover:bg-zinc-800/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-amber-100 dark:border-zinc-700 bg-amber-50 dark:bg-zinc-800 shadow-sm">
                              {imageUrl ? (
                                <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${imageUrl}')` }} />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-amber-200">
                                  <ImageIcon size={18} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-black text-[var(--bakery-text)]">{p.name}</p>
                              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-[var(--bakery-text-muted)]">{p.category?.name || 'Uncategorized'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-amber-700 dark:text-amber-400">${Number(p.price).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex h-7 min-w-[32px] items-center justify-center rounded-full px-2 text-[11px] font-black ring-1 ${
                            p.stock > 0 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 ring-amber-100 dark:ring-amber-900/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-red-100 dark:ring-red-900/30'
                          }`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                            p.isAvailable ? 'border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 text-gray-500'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${p.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {p.isAvailable ? 'Live' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[var(--bakery-text)] shadow-sm transition-all hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-400"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ open: true, id: p.id, name: p.name })}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-50 dark:border-red-900/30 bg-white dark:bg-zinc-900 text-red-400 shadow-sm transition-all hover:border-red-200 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <PaginationBar page={page} totalPages={totalPages} />
        </div>
      </div>
    </>
  )
}
