'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { CldUploadWidget } from 'next-cloudinary'
import { useToast } from '@/context/ToastContext'
import { ChevronDown, Check, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'

function slugPattern(value) {
  return /^[a-z0-9-]+$/.test(value)
}

function toSlug(value) {
  return value.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── Custom Category Dropdown ────────────────────────────────────────────────
function CategoryDropdown({ categories, value, onChange, error }) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const ref = useRef(null)
  const selected = categories.find((c) => c.id === value)

  useEffect(() => {
    if (!open) return
    
    // Check if we should open upwards
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUp(spaceBelow < 250) // Flip if less than 250px space
    }

    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold
          transition-all outline-none
          ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[var(--bakery-text)] hover:border-amber-400 dark:hover:border-amber-500'}
          ${open ? 'border-amber-500 ring-2 ring-amber-100 dark:ring-amber-900/30' : ''}
        `}
      >
        <span className={selected ? 'text-[var(--bakery-text)]' : 'text-[#B09080] dark:text-[#8A6D5E]'}>
          {selected ? selected.name : 'Select a category'}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-amber-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`
          absolute left-0 z-[10001] w-full animate-fade-up overflow-hidden rounded-2xl border border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl shadow-amber-900/20
          ${openUp ? 'bottom-full mb-2' : 'top-full mt-1.5'}
        `}>
          <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
            {categories.map((cat) => {
              const isSelected = cat.id === value
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { onChange(cat.id); setOpen(false) }}
                  className={`
                    flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors
                    ${isSelected ? 'bg-amber-500 text-white' : 'text-[var(--bakery-text)] hover:bg-amber-50 dark:hover:bg-zinc-800'}
                  `}
                >
                  <span className="flex-1 text-left">{cat.name}</span>
                  {isSelected && <Check size={14} className="shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductModal({ isOpen, onClose, product, categories = [] }) {
  const router = useRouter()
  const { addToast } = useToast()
  const [image, setImage] = useState('')
  const [formError, setFormError] = useState('')
  const [mounted, setMounted] = useState(false)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const canUpload = Boolean(cloudName && uploadPreset)

  const mode = product ? 'edit' : 'create'

  const defaultValues = useMemo(() => ({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    stock: product?.stock ?? 0,
    categoryId: product?.categoryId ?? '',
    isAvailable: product?.isAvailable ?? true,
  }), [product])

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm({ defaultValues })

  const nameValue = watch('name')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues)
      setImage(product?.images?.[0] || '')
      setFormError('')
    }
  }, [isOpen, product, reset, defaultValues])

  if (!isOpen || !mounted) return null

  const onSubmit = async (values) => {
    setFormError('')
    const payload = {
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
      images: image ? [image] : [],
      isAvailable: Boolean(values.isAvailable),
    }

    const url = mode === 'create' ? '/api/products' : `/api/products/${product.id}`
    const method = mode === 'create' ? 'POST' : 'PATCH'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        const msg = body?.error || 'Failed to save product.'
        setFormError(msg)
        addToast(msg, 'error')
        return
      }

      addToast(mode === 'create' ? 'Product created! 🎉' : 'Product updated ✓', 'success')
      onClose()
      router.refresh()
    } catch {
      setFormError('Network error.')
      addToast('Network error.', 'error')
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A0E08]/60 backdrop-blur-sm" onClick={onClose} />
      
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-2xl animate-fade-up overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-amber-50 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between border-b border-amber-50 dark:border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-black text-[var(--bakery-text)]">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-[#B09080] dark:text-[#8A6D5E] hover:bg-amber-50 dark:hover:bg-zinc-800 hover:text-amber-700 dark:hover:text-amber-400">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">Product Name</span>
                <input
                  {...register('name', { required: 'Name is required' })}
                  onBlur={() => { if (mode === 'create' && nameValue) setValue('slug', toSlug(nameValue)) }}
                  className="w-full rounded-xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 px-3 py-2 text-sm font-semibold text-[var(--bakery-text)] outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800"
                />
                {errors.name && <p className="text-[10px] font-bold text-red-500">{errors.name.message}</p>}
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">Slug</span>
                <input
                  {...register('slug', { required: 'Slug is required', validate: slugPattern })}
                  className="w-full rounded-xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 px-3 py-2 text-sm font-semibold text-[var(--bakery-text)] outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">Price ($)</span>
                  <input
                    type="number" step="0.01"
                    {...register('price', { required: true, min: 0.01 })}
                    className="w-full rounded-xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 px-3 py-2 text-sm font-semibold text-[var(--bakery-text)] outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">Stock</span>
                  <input
                    type="number"
                    {...register('stock', { required: true, min: 0 })}
                    className="w-full rounded-xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 px-3 py-2 text-sm font-semibold text-[var(--bakery-text)] outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">Category</span>
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CategoryDropdown categories={categories} value={field.value} onChange={field.onChange} error={errors.categoryId} />
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border-2 border-dashed border-amber-100 dark:border-zinc-700 bg-amber-50/30 dark:bg-zinc-800/30 p-4">
                <div className="relative h-32 w-32 overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 shadow-inner ring-4 ring-white dark:ring-zinc-900">
                  {image ? (
                    <>
                      <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
                      <button type="button" onClick={() => setImage('')} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-amber-200 dark:text-zinc-700">
                      <ImageIcon size={40} />
                    </div>
                  )}
                </div>
                {canUpload && (
                  <CldUploadWidget
                    uploadPreset={uploadPreset}
                    options={{ folder: 'the_crumbs/products', multiple: false }}
                    onSuccess={(res) => { if (res.info?.secure_url) setImage(res.info.secure_url) }}
                  >
                    {({ open }) => (
                      <button type="button" onClick={() => open()} className="rounded-xl border-2 border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-zinc-700">
                        {image ? 'Change Photo' : 'Upload Photo'}
                      </button>
                    )}
                  </CldUploadWidget>
                )}
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">Description</span>
                <textarea
                  {...register('description', { required: true })}
                  rows={4}
                  className="w-full rounded-xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 px-3 py-2 text-sm font-semibold text-[var(--bakery-text)] outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800"
                />
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-[var(--bakery-text-muted)]">
                <input type="checkbox" {...register('isAvailable')} className="h-4 w-4 accent-amber-600" />
                Visible in storefront
              </label>
            </div>
          </div>

          {formError && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">{formError}</p>}
        </div>

        <div className="flex gap-3 border-t border-amber-50 dark:border-zinc-800 bg-amber-50/30 dark:bg-zinc-800/30 p-6">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border-2 border-amber-100 dark:border-zinc-700 py-3 text-sm font-bold text-[var(--bakery-text-muted)] hover:bg-white dark:hover:bg-zinc-800">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 rounded-2xl bg-amber-500 py-3 text-sm font-black text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-600 disabled:opacity-50">
            {isSubmitting ? <Loader2 size={18} className="mx-auto animate-spin" /> : 'Save Product'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  )
}
