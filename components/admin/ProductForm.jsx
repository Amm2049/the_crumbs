/**
 * components/admin/ProductForm.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Create / Edit Product Form  (Client Component)
 *
 * Reused for both /admin/products/new (create) and /admin/products/:id/edit (edit).
 * Uses React Hook Form for form state and validation.
 * Handles Cloudinary image upload via next-cloudinary.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 'use client'
 *
 * import { useForm } from 'react-hook-form'
 * import { useRouter } from 'next/navigation'
 * import { CldUploadWidget } from 'next-cloudinary'   ← Cloudinary upload widget
 * import { Button } from '@/components/ui/button'
 * + other shadcn/ui form components
 *
 * // Props:
 * //   categories: array of Category objects (for the dropdown)
 * //   product: existing Product object (only in edit mode)
 * //   mode: 'create' | 'edit'
 *
 * export default function ProductForm({ categories, product, mode }) {
 *   const router = useRouter()
 *   const [images, setImages] = useState(product?.images ?? [])
 *
 *   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
 *     defaultValues: product ?? { price: 0, stock: 0, isAvailable: true },
 *   })
 *
 *   const onSubmit = async (data) => {
 *     const payload = { ...data, images }  // merge uploaded image URLs
 *     const url = mode === 'create' ? '/api/products' : `/api/products/${product.id}`
 *     const method = mode === 'create' ? 'POST' : 'PATCH'
 *
 *     const res = await fetch(url, {
 *       method,
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(payload),
 *     })
 *     if (res.ok) router.push('/admin/products')
 *   }
 *
 *   // FORM FIELDS:
 *   //   name (required)
 *   //   slug (required, pattern: /^[a-z0-9-]+$/ — lowercase letters, numbers, hyphens only)
 *   //   description (required)
 *   //   price (required, min: 0.01)
 *   //   stock (required, min: 0)
 *   //   categoryId (required — render as <select> with categories)
 *   //   isAvailable (checkbox)
 *   //   images — use CldUploadWidget from next-cloudinary
 *   //     onSuccess: (result) => setImages(prev => [...prev, result.info.secure_url])
 *   //     Show uploaded images as thumbnails with a remove button
 * }
 */
