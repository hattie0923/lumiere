'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, X, ShoppingBag, ArrowRight, Sparkles, Tag, ChevronRight, Lock } from 'lucide-react'
import { products, getProductById } from '@/lib/data'
import { useCart } from '@/lib/cart-context'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function CartPage() {
  const { items, remove, updateQty, clear, count } = useCart()

  // Resolve cart items to full product data
  const cartProducts = useMemo(() =>
    items.map(item => ({
      ...item,
      product: getProductById(item.productId),
    })).filter(item => item.product != null),
    [items]
  )

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + (item.product!.price * item.quantity), 0
  )
  const shipping = subtotal > 330 ? 0 : 22
  const total = subtotal + shipping

  const suggestedProducts = products.filter(
    p => !items.some(i => i.productId === p.id)
  ).slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tighter font-bold">
              Shopping Bag
            </h1>
            <p className="font-mono text-sm uppercase tracking-widest mt-3 text-foreground/50">
              {count} {count === 1 ? 'item' : 'items'}
            </p>
          </div>
          {count > 0 && (
            <button
              onClick={clear}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/30 hover:text-red-500 transition-colors"
            >
              <X size={14} /> Clear All
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
              <ShoppingBag size={40} className="text-foreground/15" />
            </div>
            <h2 className="font-display text-2xl uppercase tracking-tight font-bold text-foreground/40 mb-3">
              Your bag is empty
            </h2>
            <p className="text-foreground/30 text-sm max-w-sm mb-8">
              Discover our curated collection and find your perfect style.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 font-display uppercase tracking-widest text-sm hover:bg-accent transition-colors"
            >
              Explore Collection <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}

        {/* Cart Content */}
        {count > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

            {/* Left: Cart Items */}
            <div>
              <div className="space-y-0 divide-y divide-foreground/8">
                <AnimatePresence mode="popLayout">
                  {cartProducts.map((item, i) => {
                    const p = item.product!
                    return (
                      <motion.div
                        key={`${item.productId}-${item.color}-${item.size}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-4 md:gap-6 py-6"
                      >
                        {/* Image */}
                        <Link href={`/products/${p.id}`} className="relative w-24 md:w-28 aspect-[3/4] rounded overflow-hidden shrink-0 bg-[#f5f5f5]">
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                            sizes="120px"
                          />
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[10px] font-bold tracking-widest text-foreground/30 uppercase">{p.brand}</p>
                              <Link href={`/products/${p.id}`}>
                                <h3 className="text-sm font-medium text-foreground/85 hover:text-foreground transition-colors leading-snug mt-0.5">
                                  {p.name}
                                </h3>
                              </Link>
                            </div>
                            <button
                              onClick={() => remove(item.productId, item.color, item.size)}
                              className="p-1.5 text-foreground/20 hover:text-red-500 transition-colors shrink-0"
                            >
                              <X size={15} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-[11px] text-foreground/40">
                            <span>Color: {item.color}</span>
                            <span className="text-foreground/15">|</span>
                            <span>Size: {item.size}</span>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-3">
                            {/* Quantity */}
                            <div className="flex items-center gap-0 border border-foreground/15 rounded overflow-hidden">
                              <button
                                onClick={() => updateQty(item.productId, item.color, item.size, -1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center text-foreground/50 hover:text-foreground disabled:opacity-30 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQty(item.productId, item.color, item.size, 1)}
                                className="w-8 h-8 flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Price */}
                            <span className="font-mono text-base font-semibold">
                              £{(p.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* AI Suggestions */}
              {suggestedProducts.length > 0 && (
                <div className="mt-10 p-5 rounded-lg border border-accent/20 bg-accent/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={14} className="text-accent" />
                    <p className="text-sm font-bold text-accent">AI Styling — Complete your look</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {suggestedProducts.map(p => (
                      <Link key={p.id} href={`/products/${p.id}`} className="group">
                        <div className="relative rounded overflow-hidden aspect-[3/4] mb-2 bg-[#f5f5f5]">
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="150px" />
                        </div>
                        <p className="text-xs text-foreground/55 truncate group-hover:text-foreground transition-colors">{p.name}</p>
                        <p className="font-mono text-xs text-accent mt-0.5">£{p.price.toLocaleString()}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:sticky lg:top-28 self-start space-y-4">
              <div className="bg-white rounded-lg border border-foreground/8 p-6">
                <h2 className="font-display text-lg uppercase tracking-tight font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/50">Subtotal ({count} items)</span>
                    <span className="font-mono font-medium">£{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/50">Shipping</span>
                    <span className={`font-mono ${shipping === 0 ? 'text-green-600 font-medium' : ''}`}>
                      {shipping === 0 ? 'FREE' : `£${shipping}`}
                    </span>
                  </div>
                  {subtotal > 0 && subtotal < 330 && (
                    <p className="text-[11px] text-foreground/30">
                      Free shipping on orders over £330 — just £{(330 - subtotal).toLocaleString()} more!
                    </p>
                  )}
                </div>

                <div className="border-t border-foreground/8 mb-6" />

                <div className="flex justify-between items-baseline mb-8">
                  <span className="font-display uppercase tracking-tight font-bold">Total</span>
                  <span className="font-mono text-2xl font-bold">
                    £{total.toLocaleString()}
                  </span>
                </div>

                {/* Checkout */}
                <button className="w-full py-4 bg-foreground text-background font-display uppercase tracking-widest text-sm hover:bg-accent transition-colors flex items-center justify-center gap-2.5 mb-3">
                  <Lock size={14} />
                  Secure Checkout
                </button>

                {/* Payment */}
                <div className="text-center mb-5">
                  <p className="text-[10px] text-foreground/25 mb-2">Accepted payment methods</p>
                  <div className="flex items-center justify-center gap-2">
                    {['WeChat Pay', 'Alipay', 'Visa', 'Mastercard'].map(m => (
                      <span key={m} className="text-[9px] px-2 py-1 border border-foreground/10 rounded text-foreground/30">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Trust */}
                <div className="space-y-1.5">
                  {['Free returns within 7 days', '100% Authentic guarantee', 'Encrypted secure payment'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-foreground/30">
                      <div className="w-1 h-1 rounded-full bg-accent/50" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Try-On CTA */}
              <Link
                href="/try-on"
                className="flex items-center gap-4 p-4 rounded-lg border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors group"
              >
                <Sparkles size={18} className="text-accent shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-accent">Not sure yet? Try it on first</p>
                  <p className="text-[11px] text-foreground/35">Free AI virtual fitting room</p>
                </div>
                <ChevronRight size={14} className="text-accent/50 group-hover:text-accent transition-colors" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
