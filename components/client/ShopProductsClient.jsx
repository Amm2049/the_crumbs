'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, Suspense } from 'react'

import CategoryFilter from '@/components/client/CategoryFilter'
import ProductGrid from '@/components/client/ProductGrid'
import Pagination from '@/components/shared/Pagination'
import { ProductCardSkeleton } from '@/components/shared/Skeletons'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { usePusher } from '@/hooks/usePusher';


/**
 * Helper to fetch and parse JSON data from the internal API
 */

async function fetchJson(path) {
  const res = await fetch(path, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const payload = await res.json()
      if (payload?.error) message = payload.error
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  return res.json()
}

function ShopProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlSearch = searchParams.get('q') || ''
  const activeCategory = searchParams.get('category') || ''
  const currentPage = Number(searchParams.get('page')) || 1
  const itemsPerPage = 15

  // Local state management
  const [categories, setCategories] = useState([])
  const [productsData, setProductsData] = useState({ data: [], total: 0, totalPages: 1 })
  const [search, setSearch] = useState(urlSearch)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const { client } = usePusher()

  useEffect(() => {
    if (!client) return

    const channel = client.subscribe('products')
    channel.bind('stock-changed', (data) => {
      // Update stock in products list
      setProductsData((prev) => ({
        ...prev,
        data: prev.data.map((p) =>
          p.id === data.id
            ? { ...p, stock: data.stock, isAvailable: data.isAvailable }
            : p
        )
      }))
    })

    return () => {
      channel.unbind('stock-changed')
      client.unsubscribe('products')
    }
  }, [client])

  // Sync input text with URL (handles browser back/forward buttons & clear actions)
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch)
  if (urlSearch !== prevUrlSearch) {
    setSearch(urlSearch)
    setPrevUrlSearch(urlSearch)
  }


  // Initial Category Fetch
  useEffect(() => {
    let cancelled = false

    async function loadCats() {
      try {
        const cats = await fetchJson('/api/categories')
        if (cancelled) return
        setCategories(Array.isArray(cats) ? cats : [])
      } catch (error) {
        if (cancelled) {
          return
        }
        setCategories([])
      }
    }

    loadCats()
    return () => {
      cancelled = true
    }
  }, [])

  // Fetch products from backend whenever URL parameters change
  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setIsLoading(true)
      setError('')
      try {
        const queryParams = new URLSearchParams()
        if (urlSearch) queryParams.set('search', urlSearch)
        if (activeCategory) queryParams.set('category', activeCategory)
        queryParams.set('page', currentPage.toString())
        queryParams.set('limit', itemsPerPage.toString())

        const res = await fetchJson(`/api/products?${queryParams.toString()}`)
        if (cancelled) return

        if (res && Array.isArray(res.data)) {
          setProductsData(res)
        } else if (Array.isArray(res)) {
          setProductsData({
            data: res,
            total: res.length,
            totalPages: Math.ceil(res.length / itemsPerPage)
          })
        } else {
          setProductsData({ data: [], total: 0, totalPages: 1 })
        }
      } catch (e) {
        if (cancelled) return
        setProductsData({ data: [], total: 0, totalPages: 1 })
        setError(e instanceof Error ? e.message : 'Failed to load products')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadProducts()
    return () => {
      cancelled = true
    }
  }, [urlSearch, activeCategory, currentPage])

  /**
   * Synchronizes component state with the URL query parameters
   * This allows filters to persist on page refresh and shareable links
   */
  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    // Reset to page 1 on filter change unless specifically setting page
    if (!newParams.page) {
      params.set('page', '1')
    }
    router.push(`/products?${params.toString()}`, { scroll: false })
  }

  // Debounced URL updates when typing
  const debouncedUpdateFilters = useDebouncedCallback((val) => {
    updateFilters({ q: val })
  }, 500)

  const totalPages = productsData.totalPages
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = productsData.data

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    updateFilters({ page: newPage.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Check if any active filters are applied to show/hide the "Clear" button
  const hasFilters = Boolean(activeCategory || urlSearch)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Search Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-[var(--bakery-text)] sm:text-5xl">Our Products</h1>
          <p className="text-lg font-medium text-[var(--bakery-text-muted)]">Artisanal treats baked with love, just for you.</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                debouncedUpdateFilters(e.target.value)
              }}
              placeholder="Search treats..."
              className="w-full rounded-2xl border-2 border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-3 pl-11 pr-4 text-sm font-medium text-[var(--bakery-text)] outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-50 dark:focus:ring-amber-900/20"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('')
                  debouncedUpdateFilters.cancel()
                  updateFilters({ q: '' })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-amber-400 hover:bg-amber-50 dark:hover:bg-zinc-800 hover:text-amber-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                debouncedUpdateFilters.cancel()
                updateFilters({ q: '', category: '', page: '1' })
              }}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 text-sm font-bold text-[var(--bakery-text-muted)] transition-all hover:bg-amber-50 dark:hover:bg-zinc-800 active:scale-95"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onChangeCategory={(slug) => {
          updateFilters({ category: slug })
        }}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border-2 border-dashed border-red-100 bg-red-50/50 p-16 text-center">
          <p className="text-lg font-bold text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm font-bold text-red-600 underline underline-offset-4"
          >
            Try refreshing the page
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          <ProductGrid products={paginatedProducts} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={productsData.total}
            startIndex={startIndex}
            label="treats"
          />
        </div>
      )}
    </div>
  )
}

/**
 * Main wrapper component using React Suspense for handling 
 * the useSearchParams hook during server rendering
 */
export default function ShopProductsClient() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-12 w-48 animate-pulse rounded-xl bg-amber-100 dark:bg-zinc-800" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <ShopProductsContent />
    </Suspense>
  )
}

