import Link from 'next/link'
import { notFound } from 'next/navigation'

import { apiGet } from '@/lib/api-client'
import ProductDetailClient from '@/components/client/ProductDetailClient'

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

  return <ProductDetailClient product={product} />
}
