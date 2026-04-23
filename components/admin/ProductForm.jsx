'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { CldUploadWidget } from 'next-cloudinary'

function slugPattern(value) {
  return /^[a-z0-9-]+$/.test(value)
}

export default function ProductForm({ categories = [], product, mode = 'create' }) {
  const router = useRouter()
  const [images, setImages] = useState(Array.isArray(product?.images) ? product.images : [])
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
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues })

  const onSubmit = async (values) => {
    setFormError('')

    const payload = {
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
      images,
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
        return
      }

      router.push('/admin/products')
      router.refresh()
    } catch {
      setFormError('Network error while saving product.')
    }
  }

  const removeImage = (target) => {
    setImages((prev) => prev.filter((url) => url !== target))
  }

  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 sm:p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#6B4C3B]">Name</span>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm text-[#4D321E] outline-none focus:border-amber-400"
            />
            {errors.name ? <p className="text-xs font-medium text-red-600">{errors.name.message}</p> : null}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#6B4C3B]">Slug</span>
            <input
              {...register('slug', {
                required: 'Slug is required',
                validate: (value) => slugPattern(value) || 'Use lowercase letters, numbers, and hyphens only',
              })}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm text-[#4D321E] outline-none focus:border-amber-400"
            />
            {errors.slug ? <p className="text-xs font-medium text-red-600">{errors.slug.message}</p> : null}
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-sm font-semibold text-[#6B4C3B]">Description</span>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={5}
            className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm text-[#4D321E] outline-none focus:border-amber-400"
          />
          {errors.description ? <p className="text-xs font-medium text-red-600">{errors.description.message}</p> : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#6B4C3B]">Price</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('price', {
                required: 'Price is required',
                min: { value: 0.01, message: 'Price must be greater than 0' },
              })}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm text-[#4D321E] outline-none focus:border-amber-400"
            />
            {errors.price ? <p className="text-xs font-medium text-red-600">{errors.price.message}</p> : null}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#6B4C3B]">Stock</span>
            <input
              type="number"
              min="0"
              {...register('stock', {
                required: 'Stock is required',
                min: { value: 0, message: 'Stock cannot be negative' },
              })}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm text-[#4D321E] outline-none focus:border-amber-400"
            />
            {errors.stock ? <p className="text-xs font-medium text-red-600">{errors.stock.message}</p> : null}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#6B4C3B]">Category</span>
            <select
              {...register('categoryId', { required: 'Category is required' })}
              className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-[#4D321E] outline-none focus:border-amber-400"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? <p className="text-xs font-medium text-red-600">{errors.categoryId.message}</p> : null}
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B4C3B]">
          <input type="checkbox" {...register('isAvailable')} className="h-4 w-4 accent-amber-600" />
          Available in storefront
        </label>

        <section className="space-y-3 rounded-xl border border-amber-100 bg-amber-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#6B4C3B]">Images</p>

            {canUpload ? (
              <CldUploadWidget
                uploadPreset={uploadPreset}
                onSuccess={(result) => {
                  const url = result?.info?.secure_url
                  if (typeof url === 'string' && url) {
                    setImages((prev) => [...prev, url])
                  }
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                  >
                    Upload Image
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <p className="text-xs text-[#8A6D5E]">Set Cloudinary env vars to enable upload widget.</p>
            )}
          </div>

          {images.length === 0 ? (
            <p className="text-xs text-[#8A6D5E]">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image) => (
                <div key={image} className="space-y-2">
                  <div className="aspect-square overflow-hidden rounded-lg border border-amber-200 bg-white">
                    <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="w-full rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
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
            className="rounded-xl border border-amber-200 px-5 py-2.5 text-sm font-semibold text-[#6B4C3B] transition-colors hover:bg-amber-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
