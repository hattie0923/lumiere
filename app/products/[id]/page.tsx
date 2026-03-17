'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Star, ChevronLeft, ChevronRight, ShoppingBag, Heart } from 'lucide-react'
import { getProductById, getRelatedProducts, Product } from '@/lib/data'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Navigation from '@/components/Navigation'
import ProductCard from '@/components/ProductCard'
import TryOnFloat from '@/components/TryOnFloat'
import Footer from '@/components/Footer'

export default function ProductDetail({ params }: { params: { id: string } }) {
  const product = getProductById(params.id)
  const router = useRouter()
  const { toggle, has } = useWishlist()
  const { add: addToCart, has: inCart } = useCart()
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null)
  const [addedFeedback, setAddedFeedback] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Navigation />
        <h1 className="font-display text-3xl uppercase tracking-tight font-bold text-foreground/40 mt-20">
          Product Not Found
        </h1>
        <Link href="/products" className="mt-4 text-accent font-mono text-sm uppercase tracking-widest hover:underline">
          ← Back to Collection
        </Link>
      </div>
    )
  }

  const related = getRelatedProducts(product, 4)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Breadcrumb */}
      <div className="pt-24 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-foreground/35">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/products" className="hover:text-foreground transition-colors">Collection</Link>
          <ChevronRight size={10} />
          <Link href={`/products?category=${product.category}`} className="hover:text-foreground transition-colors capitalize">{product.category}</Link>
          <ChevronRight size={10} />
          <span className="text-foreground/60 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto mt-6">

        {/* Left: Product Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-[3/4] w-full bg-[#f5f5f5] rounded-sm overflow-hidden"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 cursor-zoom-in"
          />
          {product.badge && (
            <span className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm ${
              product.badge === 'NEW' ? 'bg-accent text-white' :
              product.badge === 'SALE' ? 'bg-red-500 text-white' :
              product.badge === 'HOT' ? 'bg-orange-500 text-white' :
              'bg-foreground text-background'
            }`}>
              {product.badge}
            </span>
          )}
        </motion.div>

        {/* Right: Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col justify-center py-8 lg:py-16"
        >
          {/* Brand */}
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">
            {product.brand}
          </p>

          {/* Name */}
          <h1 className="font-display text-3xl md:text-5xl uppercase tracking-tighter font-bold mb-3 leading-[0.95]">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-foreground/20'}
                />
              ))}
            </div>
            <span className="text-xs text-foreground/40 font-mono">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-8">
            <p className="font-display text-3xl font-bold">
              £{product.price.toLocaleString()}
            </p>
            {product.originalPrice && (
              <p className="text-lg text-foreground/30 line-through font-mono">
                £{product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-foreground/60 leading-relaxed max-w-lg mb-8 text-sm">
            {product.description}
          </p>

          {/* Colors */}
          <div className="mb-6">
            <p className="font-mono text-xs uppercase tracking-widest text-foreground/40 mb-3">
              Color — {product.colors[selectedColor].name}
            </p>
            <div className="flex gap-2">
              {product.colors.map((color, i) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(i)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === i ? 'border-accent scale-110' : 'border-foreground/10'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-foreground/40 mb-3">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] px-3 py-2.5 border text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedSize === size
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-foreground/15 text-foreground/60 hover:border-foreground/40'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Material & Details */}
          <div className="mb-8 border-t border-foreground/10 pt-6">
            <p className="font-mono text-xs uppercase tracking-widest text-foreground/40 mb-2">Material</p>
            <p className="text-sm text-foreground/70 mb-4">{product.material}</p>
            <p className="font-mono text-xs uppercase tracking-widest text-foreground/40 mb-2">Details</p>
            <ul className="text-sm text-foreground/70 space-y-1">
              {product.details.map((d, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 max-w-lg">
            <button
              onClick={() => {
                if (!product || !selectedSize) return
                addToCart(product.id, product.colors[selectedColor].name, selectedSize)
                setAddedFeedback(true)
                setTimeout(() => setAddedFeedback(false), 2000)
              }}
              disabled={!selectedSize}
              className={`w-full py-4 font-display uppercase tracking-widest text-sm flex items-center justify-center gap-3 group transition-all ${
                addedFeedback
                  ? 'bg-green-600 text-white'
                  : !selectedSize
                  ? 'bg-foreground/20 text-foreground/40 cursor-not-allowed'
                  : 'bg-foreground text-background hover:bg-accent'
              }`}
            >
              <ShoppingBag size={16} />
              {addedFeedback ? '✓ Added to Bag' : !selectedSize ? 'Select a Size' : 'Add to Cart'}
              {selectedSize && !addedFeedback && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>

            <button
              onClick={() => setTryOnProduct(product)}
              className="w-full py-4 border-2 border-accent text-accent font-display uppercase tracking-widest text-sm hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-3"
            >
              <Sparkles size={16} /> AI Virtual Try-On
            </button>

            <button
              onClick={() => product && toggle(product.id)}
              className={`w-full py-4 border font-display uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 ${
                product && has(product.id)
                  ? 'border-red-300 text-red-500 bg-red-50 hover:bg-red-100'
                  : 'border-foreground/10 text-foreground/40 hover:border-foreground/30 hover:text-foreground/60'
              }`}
            >
              <Heart size={16} fill={product && has(product.id) ? 'currentColor' : 'none'} />
              {product && has(product.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Agent Badge */}
          <div className="mt-10 pt-6 border-t border-foreground/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg">
              ⚡
            </div>
            <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-widest leading-relaxed">
              Powered by LUMIÈRE Multi-Agent Engine.<br />AI virtual try-on with OpenClaw intelligent routing.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto mt-20 mb-20">
          <h2 className="font-display text-2xl md:text-3xl uppercase tracking-tighter font-bold mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onTryOn={() => setTryOnProduct(p)} />
            ))}
          </div>
        </div>
      )}

      <Footer />

      {/* Try-On Float */}
      {tryOnProduct && (
        <TryOnFloat product={tryOnProduct} onClose={() => setTryOnProduct(null)} />
      )}
    </div>
  )
}
