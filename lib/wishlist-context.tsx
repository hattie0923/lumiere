'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface WishlistContextType {
  items: string[]            // array of product IDs
  toggle: (id: string) => void
  has: (id: string) => boolean
  count: number
  clear: () => void
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  toggle: () => {},
  has: () => false,
  count: 0,
  clear: () => {},
})

export function useWishlist() {
  return useContext(WishlistContext)
}

const STORAGE_KEY = 'lumiere-wishlist'

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, loaded])

  const toggle = useCallback((id: string) => {
    setItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }, [])

  const has = useCallback((id: string) => items.includes(id), [items])

  const clear = useCallback(() => setItems([]), [])

  return (
    <WishlistContext.Provider value={{ items, toggle, has, count: items.length, clear }}>
      {children}
    </WishlistContext.Provider>
  )
}
