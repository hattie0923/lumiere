'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Sparkles, Star } from 'lucide-react'
import { Product } from '@/lib/data'
import { useWishlist } from '@/lib/wishlist-context'

const badgeStyles: Record<string, string> = {
  NEW: 'bg-accent text-white',
  SALE: 'bg-red-600 text-white',
  HOT: 'bg-amber-500 text-white',
  LIMITED: 'bg-foreground text-background',
}

const garmentTypeLabel: Record<string, string> = {
  top: 'Top',
  bottom: 'Bottom',
  dress: 'Dress',
  full_outfit: 'Full Outfit',
}

interface ProductCardProps {
  product: Product
  index?: number
  onTryOn?: () => void
}

export default function ProductCard({ product, index = 0, onTryOn }: ProductCardProps) {
  const { toggle, has } = useWishlist()
  const wishlisted = has(product.id)
  const router = useRouter()

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-foreground/8 overflow-hidden hover:shadow-xl hover:shadow-foreground/5 transition-all duration-500">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Top row: badge + wishlist */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
          <div className="flex gap-1.5">
            {product.badge && (
              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${badgeStyles[product.badge]}`}>
                {product.badge === 'SALE' && discount ? `-${discount}%` : product.badge}
              </span>
            )}
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-foreground/5 backdrop-blur-sm text-foreground/60">
              {garmentTypeLabel[product.garmentType]}
            </span>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); toggle(product.id) }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              wishlisted
                ? 'bg-red-50 text-red-500'
                : 'bg-white/80 backdrop-blur-sm text-foreground/40 hover:text-foreground/70'
            }`}
          >
            <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Try-On button on hover */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => {
              e.preventDefault()
              if (onTryOn) {
                onTryOn()
              } else {
                router.push(`/try-on?garmentId=${product.id}`)
              }
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent text-white text-xs font-bold uppercase tracking-wider hover:bg-accent/90 transition-colors shadow-lg"
          >
            <Sparkles size={13} />
            Try On Now
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <p className="text-[10px] font-semibold tracking-widest text-foreground/30 uppercase">
          {product.brand}
        </p>

        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium text-foreground/85 leading-snug hover:text-foreground transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-foreground/15'}
              />
            ))}
          </div>
          <span className="text-[10px] text-foreground/35">({product.reviewCount})</span>
        </div>

        {/* Color dots */}
        <div className="flex gap-1 mt-0.5">
          {product.colors.map(color => (
            <span
              key={color.name}
              title={color.name}
              className="w-3.5 h-3.5 rounded-full border border-foreground/10"
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="font-mono text-sm font-semibold text-foreground">
            £{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="font-mono text-xs text-foreground/30 line-through">
              £{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
