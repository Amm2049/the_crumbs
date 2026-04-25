'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

import { CategoryShowcaseSkeleton } from '@/components/shared/Skeletons'

export default function CategoryShowcase() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        // Limit to 4 for the homepage layout
        setCategories(Array.isArray(data) ? data.slice(0, 4) : [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  if (isLoading) return <CategoryShowcaseSkeleton />

  if (categories.length === 0) return null

  return (
    <ScrollReveal className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-[var(--bakery-text)]">Shop by Category</h2>
        <p className="mt-2 text-[var(--bakery-text-muted)]">Explore our range of handcrafted bakery delights</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {categories.map((category, i) => (
          <div
            key={category.id}
            className={`group relative h-72 overflow-hidden rounded-3xl bg-amber-100 dark:bg-zinc-800 shadow-sm ${
              i === 0 ? 'delay-100' : i === 1 ? 'delay-200' : i === 2 ? 'delay-300' : 'delay-400'
            }`}
          >
            {category.image && (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${category.image}')` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3F2A1D]/90 via-[#3F2A1D]/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <span className="mb-2 w-fit rounded-full bg-amber-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-100 backdrop-blur-md">
                Discover in shop
              </span>
              <h3 className="text-2xl font-bold text-white">{category.name}</h3>
              <p className="mt-1 text-sm text-amber-50/70 line-clamp-2">{category.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link href="/products">
          <Button size="lg" className="h-12 rounded-2xl bg-amber-500 px-8 text-white hover:bg-amber-600">
            Visit Our Full Shop
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </Link>
      </div>
    </ScrollReveal>
  )
}
