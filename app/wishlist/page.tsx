'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, Trash2, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'
import { products, Product } from '@/lib/data'
import Navigation from '@/components/Navigation'
import TryOnFloat from '@/components/TryOnFloat'
import Footer from '@/components/Footer'
import { useState, useMemo } from 'react'

export default function WishlistPage() {
  const { items, toggle, clear, count } = useWishlist()
  const { add: addToCart } = useCart()
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null)

  const wishlistProducts = useMemo(
    () => products.filter(p => items.includes(p.id)),
    [items]
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tighter font-bold">
              Wishlist
            </h1>
            <p className="font-mono text-sm uppercase tracking-widest mt-3 text-foreground/50">
              {count} {count === 1 ? 'piece' : 'pieces'} saved
            </p>
          </div>
          {count > 0 && (
            <button
              onClick={clear}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/30 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </motion.div>

        {/* Empty State */}
        {count === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-foreground/5 flex items-center justify-center mb-6">
              <Heart size={40} className="text-foreground/15" />
            </div>
            <h2 className="font-display text-2xl uppercase tracking-tight font-bold text-foreground/40 mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-foreground/30 text-sm max-w-sm mb-8">
              Start browsing our collection and save your favorite pieces for later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 font-display uppercase tracking-widest text-sm hover:bg-accent transition-colors"
            >
              Explore Collection <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}

        {/* Wishlist Items */}
        {count > 0 && (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {wishlistProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex gap-4 md:gap-6 p-4 border border-foreground/8 rounded-lg bg-white hover:shadow-lg hover:shadow-foreground/5 transition-all group"
                >
                  {/* Image */}
                  <Link href={`/products/${product.id}`} className="relative w-28 md:w-36 aspect-[3/4] rounded overflow-hidden shrink-0">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="150px"
                    />
                    {product.badge && (
                      <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm ${
                        product.badge === 'NEW' ? 'bg-accent text-white' :
                        product.badge === 'SALE' ? 'bg-red-500 text-white' :
                        product.badge === 'HOT' ? 'bg-orange-500 text-white' :
                        'bg-foreground text-background'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col flex-1 py-1">
                    <p className="text-[10px] font-bold tracking-widest text-foreground/30 uppercase">
                      {product.brand}
                    </p>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-display text-lg md:text-xl uppercase tracking-tight font-bold hover:text-accent transition-colors mt-0.5">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-foreground/40 mt-1 line-clamp-2 hidden md:block">
                      {product.description}
                    </p>

                    {/* Colors */}
                    <div className="flex gap-1 mt-2">
                      {product.colors.map(c => (
                        <span
                          key={c.name}
                          className="w-4 h-4 rounded-full border border-foreground/10"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-auto pt-2">
                      <span className="font-mono text-base font-bold">
                        £{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="font-mono text-xs text-foreground/30 line-through">
                          £{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 py-1 shrink-0">
                    <button
                      onClick={() => toggle(product.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="mt-auto flex flex-col gap-2">
                      <button
                        onClick={() => setTryOnProduct(product)}
                        className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent rounded hover:bg-accent hover:text-white transition-all"
                      >
                        <Sparkles size={12} /> Try On
                      </button>
                      <button
                        onClick={() => addToCart(product.id, product.colors[0].name, product.sizes[0])}
                        className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider bg-foreground text-background rounded hover:bg-accent transition-colors"
                      >
                        <ShoppingBag size={12} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Footer />

      {/* Try-On Float */}
      <AnimatePresence>
        {tryOnProduct && (
          <TryOnFloat product={tryOnProduct} onClose={() => setTryOnProduct(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
