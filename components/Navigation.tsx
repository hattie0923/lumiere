'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, ShoppingBag, X, Menu, Sparkles } from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'
import { products } from '@/lib/data'

const dropdownItems = [
  { label: 'Tops', type: 'top' },
  { label: 'Bottoms', type: 'bottom' },
  { label: 'Dresses', type: 'dress' },
]

interface NavigationProps {
  theme?: 'light' | 'dark'
}

export default function Navigation({ theme = 'dark' }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { count: wishlistCount } = useWishlist()
  const { count: cartCount } = useCart()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = searchOpen || mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [searchOpen, mobileOpen])

  const handleMenuEnter = (menu: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setHoveredMenu(menu)
  }
  const handleMenuLeave = () => {
    hoverTimeout.current = setTimeout(() => setHoveredMenu(null), 150)
  }

  // Dynamic color classes based on theme + scroll state
  const isLight = theme === 'light' && !scrolled
  const mutedClass = isLight ? 'text-white/60' : 'text-charcoal/55'
  const hoverClass = isLight ? 'hover:text-white' : 'hover:text-charcoal'
  const activeClass = isLight ? 'text-white' : 'text-charcoal'
  const accentClass = isLight ? 'text-white' : 'text-vermillion'
  const logoClass = isLight ? 'text-white' : 'text-charcoal'

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.65, 0.05, 0, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-cream/90 backdrop-blur-xl shadow-soft border-b border-sand/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-[68px]">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className={`lg:hidden p-1.5 ${mutedClass} transition-colors`}
            >
              <Menu size={22} />
            </button>

            {/* Left Nav */}
            <div className="hidden lg:flex items-center gap-7">
              {/* WOMEN */}
              <div
                className="relative"
                onMouseEnter={() => handleMenuEnter('women')}
                onMouseLeave={handleMenuLeave}
              >
                <Link href="/products?category=women" className={`text-[11px] font-bold tracking-[0.1em] uppercase py-5 inline-block transition-colors duration-300 ${hoveredMenu === 'women' ? activeClass : mutedClass} ${hoverClass}`}>
                  Women
                </Link>
                <AnimatePresence>
                  {hoveredMenu === 'women' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 bg-white shadow-xl border border-foreground/8 rounded-lg py-2 min-w-[160px] z-50"
                      onMouseEnter={() => handleMenuEnter('women')}
                      onMouseLeave={handleMenuLeave}
                    >
                      <Link href="/products?category=women" className="block px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-charcoal/30 hover:text-charcoal/50 transition-colors">All Women</Link>
                      {dropdownItems.map(item => (
                        <Link key={item.type} href={`/products?category=women&type=${item.type}`} className="block px-4 py-2.5 text-[12px] font-semibold text-charcoal/70 hover:text-charcoal hover:bg-foreground/3 transition-all">
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* MEN */}
              <div
                className="relative"
                onMouseEnter={() => handleMenuEnter('men')}
                onMouseLeave={handleMenuLeave}
              >
                <Link href="/products?category=men" className={`text-[11px] font-bold tracking-[0.1em] uppercase py-5 inline-block transition-colors duration-300 ${hoveredMenu === 'men' ? activeClass : mutedClass} ${hoverClass}`}>
                  Men
                </Link>
                <AnimatePresence>
                  {hoveredMenu === 'men' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 bg-white shadow-xl border border-foreground/8 rounded-lg py-2 min-w-[160px] z-50"
                      onMouseEnter={() => handleMenuEnter('men')}
                      onMouseLeave={handleMenuLeave}
                    >
                      <Link href="/products?category=men" className="block px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-charcoal/30 hover:text-charcoal/50 transition-colors">All Men</Link>
                      {dropdownItems.filter(i => i.type !== 'dress').map(item => (
                        <Link key={item.type} href={`/products?category=men&type=${item.type}`} className="block px-4 py-2.5 text-[12px] font-semibold text-charcoal/70 hover:text-charcoal hover:bg-foreground/3 transition-all">
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Virtual Try-On */}
              <Link href="/try-on" className={`text-[11px] font-bold tracking-[0.1em] uppercase flex items-center gap-1.5 transition-colors duration-300 ${accentClass}`}>
                <Sparkles size={11} /> Virtual Try-On
              </Link>
            </div>

            {/* Center Logo */}
            <Link href="/" className={`absolute left-1/2 -translate-x-1/2 font-display text-2xl lg:text-3xl tracking-[-0.05em] font-medium uppercase whitespace-nowrap transition-colors duration-300 ${logoClass}`}>
              LUMIÈRE
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className={`p-2 transition-opacity hover:opacity-70 ${mutedClass}`}
              >
                <Search size={17} />
              </button>
              <Link href="/wishlist" className={`hidden sm:flex p-2 transition-opacity hover:opacity-70 relative ${mutedClass}`}>
                <Heart size={17} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className={`p-2 transition-opacity hover:opacity-70 relative ${mutedClass}`}>
                <ShoppingBag size={17} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-vermillion text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Search Overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-charcoal/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.65, 0.05, 0, 1] }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-[95] bg-white flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-foreground/8">
                <span className="font-display text-xl font-bold">LUMIÈRE</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 text-charcoal/40 hover:text-charcoal"><X size={20} /></button>
              </div>
              <div className="flex flex-col p-5 gap-0">
                <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal/30 mb-2">Women</p>
                {dropdownItems.map(item => (
                  <Link key={`w-${item.type}`} href={`/products?category=women&type=${item.type}`} onClick={() => setMobileOpen(false)} className="py-2 pl-2 text-sm text-charcoal/60 hover:text-charcoal">{item.label}</Link>
                ))}
                <div className="border-t border-foreground/8 my-3" />
                <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal/30 mb-2">Men</p>
                {dropdownItems.filter(i => i.type !== 'dress').map(item => (
                  <Link key={`m-${item.type}`} href={`/products?category=men&type=${item.type}`} onClick={() => setMobileOpen(false)} className="py-2 pl-2 text-sm text-charcoal/60 hover:text-charcoal">{item.label}</Link>
                ))}
                <div className="border-t border-foreground/8 my-3" />
                <Link href="/try-on" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-bold text-vermillion flex items-center gap-1.5"><Sparkles size={13} /> Virtual Try-On</Link>
              </div>
              <div className="mt-auto p-5 border-t border-foreground/8 flex gap-4">
                <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-sm text-charcoal/40 hover:text-charcoal"><Heart size={15} /> Wishlist</Link>
                <Link href="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-sm text-charcoal/40 hover:text-charcoal"><ShoppingBag size={15} /> Cart</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Search Overlay with real search ─── */
function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
    }
  }, [open])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.garmentType.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [query])

  const handleSelect = (id: string) => {
    onClose()
    router.push(`/products/${id}`)
  }

  const trendingTags = ['Silk Top', 'Wide-Leg Pants', 'Summer Dress', 'Linen Blazer', 'Cashmere']

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/98 backdrop-blur-xl flex flex-col"
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.65, 0.05, 0, 1] }}
            className="max-w-[720px] mx-auto w-full px-6 pt-28"
          >
            <div className="relative border-b-2 border-foreground pb-4 mb-8">
              <Search size={24} className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search styles, brands, materials..."
                className="w-full bg-transparent pl-10 pr-12 text-2xl md:text-3xl font-display font-bold text-foreground placeholder-foreground/25 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') onClose()
                  if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].id)
                }}
              />
              <button onClick={onClose} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-foreground/40 hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            {/* Results */}
            {query.trim() && results.length > 0 && (
              <div className="mb-8">
                <p className="text-[11px] font-bold tracking-[0.12em] text-foreground/40 uppercase mb-4">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  {results.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p.id)}
                      className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-foreground/5 transition-colors text-left group"
                    >
                      <div className="w-12 h-16 rounded bg-surface overflow-hidden shrink-0">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold tracking-widest text-foreground/30 uppercase">{p.brand}</p>
                        <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">{p.name}</p>
                        <p className="text-xs text-foreground/40 font-mono">£{p.price.toLocaleString()}</p>
                      </div>
                      {p.badge && (
                        <span className="text-[9px] px-2 py-0.5 rounded bg-accent/10 text-accent font-bold uppercase">{p.badge}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.trim() && results.length === 0 && (
              <p className="text-foreground/30 text-sm mb-8">No products found for &ldquo;{query}&rdquo;</p>
            )}

            {/* Trending */}
            {!query.trim() && (
              <>
                <p className="text-[11px] font-bold tracking-[0.12em] text-foreground/40 uppercase mb-4">Trending</p>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map(t => (
                    <button
                      key={t}
                      onClick={() => setQuery(t)}
                      className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground border border-foreground/15 hover:border-accent rounded-full transition-all"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
