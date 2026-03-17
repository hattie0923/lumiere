'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, SlidersHorizontal, X, ArrowUpDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { products, Product, GarmentType } from '@/lib/data'
import ProductCard from '@/components/ProductCard'
import TryOnFloat from '@/components/TryOnFloat'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

type FilterCategory = 'all' | 'women' | 'men'
type FilterGarment = 'all' | GarmentType
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating'

function ProductsContent() {
  const searchParams = useSearchParams()
  const urlCategory = searchParams.get('category') as FilterCategory | null
  const urlType = searchParams.get('type') as FilterGarment | null

  const [category, setCategory] = useState<FilterCategory>(
    urlCategory && ['women', 'men'].includes(urlCategory) ? urlCategory : 'all'
  )
  const [garmentFilter, setGarmentFilter] = useState<FilterGarment>(
    urlType && ['top', 'bottom', 'dress'].includes(urlType) ? urlType : 'all'
  )
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      if (category !== 'all' && p.category !== category) return false
      if (garmentFilter !== 'all' && p.garmentType !== garmentFilter) return false
      return true
    })

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }

    return result
  }, [category, garmentFilter, sortBy])

  const garmentTypes = useMemo(() => {
    const base = category === 'all' ? products : products.filter(p => p.category === category)
    const items: { value: FilterGarment; label: string; count: number }[] = [
      { value: 'all' as const, label: 'All', count: base.length },
      { value: 'top' as const, label: 'Tops', count: base.filter(p => p.garmentType === 'top').length },
      { value: 'bottom' as const, label: 'Bottoms', count: base.filter(p => p.garmentType === 'bottom').length },
      { value: 'dress' as const, label: 'Dresses', count: base.filter(p => p.garmentType === 'dress').length },
    ]
    return items.filter(t => t.count > 0)
  }, [category])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-foreground/35 mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-foreground/60">
            {category === 'all' ? 'All Collection' : category === 'women' ? "Women's" : "Men's"}
            {garmentFilter !== 'all' && ` / ${garmentFilter === 'top' ? 'Tops' : garmentFilter === 'bottom' ? 'Bottoms' : 'Dresses'}`}
          </span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tighter font-bold">
            {category === 'all' ? 'Collection' : category === 'women' ? "Women's" : "Men's"}
            {garmentFilter !== 'all' && ` ${garmentFilter === 'top' ? 'Tops' : garmentFilter === 'bottom' ? 'Bottoms' : 'Dresses'}`}
          </h1>
          <p className="font-mono text-sm uppercase tracking-widest mt-3 text-foreground/50">
            {filtered.length} pieces · AI Virtual Try-On available on all items
          </p>
        </motion.div>

        {/* Filters + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10 border-b border-foreground/10 pb-6">
          {/* Category */}
          <div className="flex gap-1 bg-foreground/5 rounded-full p-1">
            {(['all', 'women', 'men'] as FilterCategory[]).map(c => (
              <button
                key={c}
                onClick={() => { setCategory(c); setGarmentFilter('all') }}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  category === c
                    ? 'bg-foreground text-background'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                {c === 'all' ? 'All' : c === 'women' ? 'Women' : 'Men'}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-foreground/15 hidden md:block" />

          {/* Garment Type */}
          <div className="flex gap-1 flex-wrap">
            {garmentTypes.map(t => (
              <button
                key={t.value}
                onClick={() => setGarmentFilter(t.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${
                  garmentFilter === t.value
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-foreground/10 text-foreground/40 hover:border-foreground/30 hover:text-foreground/70'
                }`}
              >
                {t.label}
                <span className="ml-1 opacity-50">{t.count}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown size={12} className="text-foreground/30" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-semibold tracking-wide text-foreground/50 bg-transparent border-none outline-none cursor-pointer hover:text-foreground transition-colors"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <ProductCard
                  product={product}
                  index={i}
                  onTryOn={() => setTryOnProduct(product)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-32 text-foreground/30">
            <p className="text-lg">No items found</p>
          </div>
        )}
      </div>

      <Footer />

      {/* Try-On Floating Panel */}
      <AnimatePresence>
        {tryOnProduct && (
          <TryOnFloat
            product={tryOnProduct}
            onClose={() => setTryOnProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProductsContent />
    </Suspense>
  )
}
