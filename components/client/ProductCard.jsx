import Link from 'next/link'

export default function ProductCard({ product }) {
  const imageUrl = Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : ''
  const unavailable = !product?.isAvailable || Number(product?.stock ?? 0) < 1
  const price = Number(product?.price ?? 0)

  return (
    <Link href={`/products/${product.slug}`} className="group block rounded-2xl border border-amber-100 bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-amber-50">
        {imageUrl ? (
          <div className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url(${imageUrl})` }} />
        ) : null}

        {unavailable ? (
          <div className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-semibold text-white">Out of stock</div>
        ) : null}
      </div>

      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{product?.category?.name || 'Bakery'}</p>
        <h3 className="text-base font-bold text-[#4D321E]">{product?.name}</h3>
        <p className="min-h-10 text-sm text-[#7A5D4B]">{product?.description || 'Freshly baked item.'}</p>
        <p className="text-lg font-extrabold text-[#4D321E]">${price.toFixed(2)}</p>
      </div>
    </Link>
  )
}
