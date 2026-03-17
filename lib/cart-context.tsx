'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

export interface CartItem {
  productId: string
  color: string
  size: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  add: (productId: string, color: string, size: string, quantity?: number) => void
  remove: (productId: string, color: string, size: string) => void
  updateQty: (productId: string, color: string, size: string, delta: number) => void
  clear: () => void
  count: number
  has: (productId: string) => boolean
}

const CartContext = createContext<CartContextType>({
  items: [],
  add: () => {},
  remove: () => {},
  updateQty: () => {},
  clear: () => {},
  count: 0,
  has: () => false,
})

export function useCart() {
  return useContext(CartContext)
}

const STORAGE_KEY = 'lumiere-cart'

function cartKey(item: { productId: string; color: string; size: string }) {
  return `${item.productId}__${item.color}__${item.size}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, loaded])

  const add = useCallback((productId: string, color: string, size: string, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => cartKey(i) === cartKey({ productId, color, size }))
      if (existing) {
        return prev.map(i =>
          cartKey(i) === cartKey({ productId, color, size })
            ? { ...i, quantity: Math.min(10, i.quantity + quantity) }
            : i
        )
      }
      return [...prev, { productId, color, size, quantity }]
    })
  }, [])

  const remove = useCallback((productId: string, color: string, size: string) => {
    setItems(prev => prev.filter(i => cartKey(i) !== cartKey({ productId, color, size })))
  }, [])

  const updateQty = useCallback((productId: string, color: string, size: string, delta: number) => {
    setItems(prev =>
      prev.map(i =>
        cartKey(i) === cartKey({ productId, color, size })
          ? { ...i, quantity: Math.max(1, Math.min(10, i.quantity + delta)) }
          : i
      )
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const has = useCallback((productId: string) => items.some(i => i.productId === productId), [items])

  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, count, has }}>
      {children}
    </CartContext.Provider>
  )
}
