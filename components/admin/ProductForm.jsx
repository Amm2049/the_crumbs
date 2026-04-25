'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { CldUploadWidget } from 'next-cloudinary'
import { useToast } from '@/context/ToastContext'
import { ChevronDown, Check, Image as ImageIcon, X } from 'lucide-react'

function slugPattern(value) {
  return /^[a-z0-9-]+$/.test(value)
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
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold
          transition-all outline-none
          ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[var(--bakery-text)] hover:border-amber-400 dark:hover:border-amber-500'}
          ${open ? 'border-amber-500 ring-2 ring-amber-100 dark:ring-amber-900/30' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-[var(--bakery-text)]' : 'text-[#B09080] dark:text-[#8A6D5E]'}>
          {selected ? selected.name : 'Select a category'}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-amber-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Panel */}
      {open && (
        <div className={`
          absolute left-0 z-[100] w-full animate-fade-up overflow-hidden rounded-2xl border border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl shadow-amber-900/20
          ${openUp ? 'bottom-full mb-2' : 'top-full mt-1.5'}
        `}>
          <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
            {categories.length === 0 ? (
              <p className="px-3 py-2 text-xs font-medium text-[var(--bakery-text-muted)]">No categories yet.</p>
            ) : (
              categories.map((cat) => {
                const isSelected = cat.id === value
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
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
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductForm({ categories = [], product, mode = 'create' }) {
  const router = useRouter()
  const { addToast } = useToast()
  const [image, setImage] = useState(product?.images?.[0] || '')
  const [formError, setFormError] = useState('')

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const canUpload = Boolean(cloudName && uploadPreset)

  const defaultValues = useMemo(
    () => ({
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      price: product?.price ?? '',
      stock: product?.stock ?? 0,
      categoryId: product?.categoryId ?? '',
      isAvailable: product?.isAvailable ?? true,
    }),
    [product]
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues })

  const onSubmit = async (values) => {
    setFormError('')

    const payload = {
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
      images: image ? [image] : [], // Still send as array to match DB schema
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
        let message = 'Failed to save product.'
        try {
          const body = await response.json()
          message = body?.error || message
        } catch {
          // Keep fallback message.
        }
        setFormError(message)
        addToast(message, 'error')
        return
      }

      addToast(
        mode === 'create' ? 'Product created successfully! 🎉' : 'Product updated successfully ✓',
        'success'
      )
      router.push('/admin/products')
      router.refresh()
    } catch {
      const msg = 'Network error while saving product.'
      setFormError(msg)
      addToast(msg, 'error')
    }
  }


  return (
    <div className="rounded-2xl border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xl shadow-amber-900/5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-[var(--bakery-text-muted)]">Name</span>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full rounded-xl border border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-[var(--bakery-text)] outline-none focus:border-amber-400"
            />
            {errors.name ? <p className="text-xs font-medium text-red-600">{errors.name.message}</p> : null}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[var(--bakery-text-muted)]">Slug</span>
            <input
              {...register('slug', {
                required: 'Slug is required',
                validate: (value) => slugPattern(value) || 'Use lowercase letters, numbers, and hyphens only',
              })}
              className="w-full rounded-xl border border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-[var(--bakery-text)] outline-none focus:border-amber-400"
            />
            {errors.slug ? <p className="text-xs font-medium text-red-600">{errors.slug.message}</p> : null}
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-sm font-semibold text-[var(--bakery-text-muted)]">Description</span>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={5}
            className="w-full rounded-xl border border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-[var(--bakery-text)] outline-none focus:border-amber-400"
          />
          {errors.description ? <p className="text-xs font-medium text-red-600">{errors.description.message}</p> : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-[var(--bakery-text-muted)]">Price</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('price', {
                required: 'Price is required',
                min: { value: 0.01, message: 'Price must be greater than 0' },
              })}
              className="w-full rounded-xl border border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-[var(--bakery-text)] outline-none focus:border-amber-400"
            />
            {errors.price ? <p className="text-xs font-medium text-red-600">{errors.price.message}</p> : null}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[var(--bakery-text-muted)]">Stock</span>
            <input
              type="number"
              min="0"
              {...register('stock', {
                required: 'Stock is required',
                min: { value: 0, message: 'Stock cannot be negative' },
              })}
              className="w-full rounded-xl border border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-[var(--bakery-text)] outline-none focus:border-amber-400"
            />
            {errors.stock ? <p className="text-xs font-medium text-red-600">{errors.stock.message}</p> : null}
          </label>

          <div className="space-y-1.5">
            <span className="text-sm font-semibold text-[var(--bakery-text-muted)]">Category</span>
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <CategoryDropdown
                  categories={categories}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.categoryId}
                />
              )}
            />
            {errors.categoryId ? <p className="text-xs font-medium text-red-600">{errors.categoryId.message}</p> : null}
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--bakery-text-muted)]">
          <input type="checkbox" {...register('isAvailable')} className="h-4 w-4 accent-amber-600" />
          Available in storefront
        </label>

        <section className="space-y-3 rounded-xl border border-amber-100 dark:border-zinc-700 bg-amber-50/40 dark:bg-zinc-800/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--bakery-text-muted)]">Images</p>

            {canUpload ? (
              <CldUploadWidget
                uploadPreset={uploadPreset}
                options={{
                  folder: 'the_crumbs/products',
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
                      inactiveTabIcon: "#8A6D5E",
                      error: "#EF4444",
                      inProgress: "#F59E0B",
                      complete: "#10B981",
                      sourceBg: "#FFFBEB"
                    },
                    fonts: {
                      default: null,
                      "'Inter', sans-serif": "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
                    }
                  }
                }}
                onSuccess={(result) => {
                  const url = result?.info?.secure_url
                  if (typeof url === 'string' && url) {
                    setImage(url)
                  }
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="rounded-lg border border-amber-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 transition-colors hover:bg-amber-100 dark:hover:bg-zinc-700"
                  >
                    {image ? 'Change Image' : 'Upload Image'}
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <p className="text-xs text-[var(--bakery-text-muted)]">Set Cloudinary env vars to enable upload widget.</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
              {image ? (
                <div className="relative h-full w-full">
                  <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }} />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-amber-50 dark:bg-zinc-800 text-amber-200 dark:text-zinc-700">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
            {!image && <p className="text-xs text-[var(--bakery-text-muted)]">No image uploaded yet. Square images work best.</p>}
          </div>
        </section>

        {formError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{formError}</p> : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="rounded-xl border border-amber-200 dark:border-zinc-700 px-5 py-2.5 text-sm font-semibold text-[var(--bakery-text-muted)] transition-colors hover:bg-amber-50 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
