import Link from 'next/link'
import { notFound } from 'next/navigation'

import AddToCartButton from '@/components/client/AddToCartButton'
import { apiGet } from '@/lib/api-client'

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const product = await apiGet(`/api/products/slug/${slug}`, {
      next: { revalidate: 60 },
    })

    return {
      title: `${product.name} | The Crumbs`,
      description: product.description,
    }
  } catch (err) {
    if (err?.status === 404) return { title: 'Product Not Found | The Crumbs' }
    return { title: 'Product | The Crumbs' }
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params

  let product
  try {
    product = await apiGet(`/api/products/slug/${slug}`, {
      next: { revalidate: 60 },
    })
  } catch (err) {
    if (err?.status === 404) notFound()
    throw err
  }

  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : []
  const mainImage = images[0] || ''
  const inStock = product.isAvailable && Number(product.stock ?? 0) > 0

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/products" className="text-sm font-semibold text-amber-700 hover:text-amber-800">
        Back to products
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-3xl border border-amber-100 bg-amber-50">
            {mainImage ? (
              <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${mainImage})` }} />
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((image, index) => (
                <div key={`${image}-${index}`} className="aspect-square overflow-hidden rounded-xl border border-amber-100 bg-amber-50">
                  <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 rounded-3xl border border-amber-100 bg-white p-6 sm:p-8">
          <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            {product.category?.name || 'Bakery'}
          </p>

          <h1 className="text-3xl font-extrabold text-[#4D321E]">{product.name}</h1>
          <p className="text-2xl font-extrabold text-[#4D321E]">${Number(product.price).toFixed(2)}</p>
          <p className="text-base leading-relaxed text-[#6B4C3B]">{product.description}</p>

          <p className={['text-sm font-semibold', inStock ? 'text-green-700' : 'text-red-600'].join(' ')}>
            {inStock ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <AddToCartButton productId={product.id} disabled={!inStock} />
        </div>
      </div>
    </div>
  )
}
