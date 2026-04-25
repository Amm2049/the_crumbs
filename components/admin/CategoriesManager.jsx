'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X, Plus, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { CldUploadWidget } from 'next-cloudinary'
import { createPortal } from 'react-dom'

// ── Helpers ──────────────────────────────────────────────────────────────────
function toSlug(value) {
  return value.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── Category Form Modal ──────────────────────────────────────────────────────
function CategoryModal({ isOpen, onClose, category, isSaving, onSave }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [mounted, setMounted] = useState(false)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const canUpload = Boolean(cloudName && uploadPreset)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (isOpen) {
      setName(category?.name || '')
      setSlug(category?.slug || '')
      setDescription(category?.description || '')
      setImage(category?.image || '')
    }
  }, [isOpen, category])

  if (!isOpen || !mounted) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ name, slug, description, image })
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1A0E08]/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg animate-fade-up overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-amber-50 dark:border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-black text-[var(--bakery-text)]">
            {category ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[#B09080] dark:text-[#8A6D5E] hover:bg-amber-50 dark:hover:bg-zinc-800 hover:text-amber-700 dark:hover:text-amber-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
          {/* Image Upload Area */}
          <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border-2 border-dashed border-amber-100 dark:border-zinc-700 bg-amber-50/30 dark:bg-zinc-800/30 py-8">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 shadow-inner ring-4 ring-white dark:ring-zinc-900">
              {image ? (
                <>
                  <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-amber-200">
                  <ImageIcon size={40} />
                </div>
              )}
            </div>

            {canUpload ? (
              <CldUploadWidget
                uploadPreset={uploadPreset}
                options={{
                  folder: 'the_crumbs/categories',
                  multiple: false,
                  styles: {
                    palette: {
                      window: "#FFFFFF",
                      windowBorder: "#FDE68A",
                      tabIcon: "#4D321E",
                      menuIcons: "#6B4C3B",
                      textDark: "#4D321E",
                      textLight: "#FFFFFF",
                      link: "#F59E0B",
                      action: "#F59E0B",
                      activeTabIcon: "#F59E0B",
                      inactiveTabIcon: "#8A6D5E"
                    }
                  }
                }}
                onSuccess={(result) => {
                  const url = result?.info?.secure_url
                  if (typeof url === 'string' && url) setImage(url)
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="rounded-xl border-2 border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-bold text-amber-700 dark:text-amber-400 transition-all hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-700"
                  >
                    {image ? 'Replace Image' : 'Upload Image'}
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <p className="text-xs text-red-500 font-medium">Cloudinary not configured</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">Name</span>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!category) setSlug(toSlug(e.target.value))
                }}
                required
                className="w-full rounded-xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 px-4 py-2.5 text-sm font-semibold text-[var(--bakery-text)] outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">URL Slug</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                pattern="[a-z0-9-]+"
                className="w-full rounded-xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 px-4 py-2.5 text-sm font-semibold text-[var(--bakery-text)] outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 px-4 py-2.5 text-sm font-semibold text-[var(--bakery-text)] outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800"
            />
          </label>
        </div>

        <div className="flex gap-3 border-t border-amber-50 dark:border-zinc-800 bg-amber-50/30 dark:bg-zinc-800/30 p-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border-2 border-amber-100 dark:border-zinc-700 py-3 text-sm font-bold text-[var(--bakery-text-muted)] transition-colors hover:bg-white dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-2xl bg-amber-500 py-3 text-sm font-black text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-600 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Category'
            )}
          </button>
        </div>
      </form>
    </div>,
    document.body
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function CategoriesManager({ initialCategories = [] }) {
  const router = useRouter()
  const { addToast } = useToast()

  const [modal, setModal] = useState({ open: false, category: null })
  const [isSaving, setIsSaving] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  const categories = useMemo(() => (Array.isArray(initialCategories) ? initialCategories : []), [initialCategories])

  const openAdd = () => setModal({ open: true, category: null })
  const openEdit = (cat) => setModal({ open: true, category: cat })
  const closeModal = () => { if (!isSaving) setModal({ open: false, category: null }) }

  const handleSave = async (data) => {
    setIsSaving(true)
    const isEdit = !!modal.category
    const url = isEdit ? `/api/categories/${modal.category.id}` : '/api/categories'
    const method = isEdit ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        addToast(payload.error || 'Failed to save category.', 'error')
        return
      }

      addToast(isEdit ? 'Category updated ✓' : 'Category created! 🎉', 'success')
      closeModal()
      router.refresh()
    } catch {
      addToast('Network error while saving.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/categories/${confirmDelete.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        addToast(payload.error || 'Unable to delete category.', 'error')
        return
      }
      addToast(`Category deleted.`, 'info')
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
        title="Delete Category?"
        description={`"${confirmDelete.name}" will be removed forever.`}
      />

      <CategoryModal
        isOpen={modal.open}
        category={modal.category}
        isSaving={isSaving}
        onClose={closeModal}
        onSave={handleSave}
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-black text-[var(--bakery-text)]">Product Categories</h2>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
              ({categories.length} total)
            </span>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-600 active:scale-95"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-amber-900/5">
          {categories.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-zinc-800 text-amber-300 dark:text-amber-700">
                <ImageIcon size={32} />
              </div>
              <p className="font-bold text-[var(--bakery-text)]">No categories found</p>
              <p className="text-sm text-[var(--bakery-text-muted)]">Start by adding your first category above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-amber-50/40 dark:bg-zinc-800/50 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--bakery-text-muted)]">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Name / Slug</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center">Items</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50 dark:divide-zinc-800">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="group transition-colors hover:bg-amber-50/20 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 overflow-hidden rounded-xl border border-amber-100 dark:border-zinc-700 bg-amber-50 dark:bg-zinc-800 shadow-sm">
                          {cat.image ? (
                            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${cat.image})` }} />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-amber-200">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-black text-[var(--bakery-text)]">{cat.name}</p>
                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">{cat.slug}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="max-w-xs truncate text-[var(--bakery-text-muted)]">
                          {cat.description || <span className="italic opacity-50 text-[var(--bakery-text-muted)]/50">No description</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30 px-2 text-[11px] font-black text-amber-700 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-900/40">
                          {cat._count?.products ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(cat)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[var(--bakery-text)] shadow-sm transition-all hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-400"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ open: true, id: cat.id, name: cat.name })}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-50 dark:border-red-900/30 bg-white dark:bg-zinc-900 text-red-400 shadow-sm transition-all hover:border-red-200 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
