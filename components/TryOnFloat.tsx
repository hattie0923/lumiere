'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { X, Upload, Sparkles, Loader2, Camera, RotateCcw } from 'lucide-react'
import { Product, GarmentType } from '@/lib/data'

// Resize image to max dimension, return compressed base64 data URL
function compressImage(dataUrl: string, maxDim = 1024, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not supported'))
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

const garmentTypeLabel: Record<GarmentType, string> = {
  top: 'Upper Body',
  bottom: 'Lower Body',
  dress: 'Dress',
  full_outfit: 'Full Outfit',
}

const garmentTypeSkill: Record<GarmentType, string> = {
  top: 'FASHN · tops',
  bottom: 'FASHN · bottoms',
  dress: 'FASHN · one-pieces',
  full_outfit: 'FASHN · one-pieces',
}

interface TryOnFloatProps {
  product: Product
  onClose: () => void
}

export default function TryOnFloat({ product, onClose }: TryOnFloatProps) {
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const selectedType = product.garmentType
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const compressed = await compressImage(reader.result as string, 1024, 0.8)
        setUserPhoto(compressed)
      } catch {
        setUserPhoto(reader.result as string)
      }
    }
    reader.readAsDataURL(file)
    setResult(null)
    setError(null)
  }, [])

  const handleTryOn = async () => {
    if (!userPhoto) return
    setIsProcessing(true)
    setError(null)
    setResult(null)

    const assetBase =
      process.env.NEXT_PUBLIC_ASSET_BASE_URL || window.location.origin

    try {
      const garmentUrl = product.images[0].startsWith('http')
        ? product.images[0]
        : `${assetBase}${product.images[0]}`
      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImage: userPhoto,
          garmentImage: garmentUrl,
          garmentType: selectedType,
          garmentDescription: `${product.name} (${product.category}, ${product.material}, ${product.description})`,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.data.rendered_image_url)
      } else {
        setError(data.error || 'Try-on failed. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setUserPhoto(null)
    setResult(null)
    setError(null)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/10">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              Virtual Try-On
            </h2>
            <p className="text-xs text-foreground/40 mt-0.5">AI-powered fitting room</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Garment Info */}
          <div className="flex gap-3 p-5 border-b border-foreground/5">
            <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-foreground/5">
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex flex-col justify-center gap-1.5 min-w-0">
              <p className="text-[10px] font-semibold tracking-widest text-foreground/30 uppercase">{product.brand}</p>
              <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
              <p className="font-mono text-sm font-bold text-accent">£{product.price.toLocaleString()}</p>
            </div>
          </div>

          {/* Garment Type & Routing Info */}
          <div className="mx-5 mt-4 mb-3 flex items-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/15">
            <Sparkles size={14} className="text-accent flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-accent">{garmentTypeLabel[selectedType]}</span>
              <span className="text-foreground/40 mx-1.5">&rarr;</span>
              <span className="text-foreground/50 font-mono">OpenClaw &rarr; {garmentTypeSkill[selectedType]}</span>
            </div>
          </div>

          {/* Upload Area */}
          <div className="px-5 py-3">
            <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Your Photo</label>

            {!userPhoto ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-2 w-full border-2 border-dashed border-foreground/15 rounded-xl py-10 flex flex-col items-center gap-3 text-foreground/35 hover:border-accent/40 hover:text-accent/70 hover:bg-accent/3 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center">
                  <Camera size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Upload a full-body photo</p>
                  <p className="text-[10px] mt-2 text-foreground/25 leading-relaxed">Front-facing · Arms naturally at sides<br />Well-lit · Plain background preferred<br />Full body visible from head to feet</p>
                </div>
              </button>
            ) : (
              <div className="mt-2 relative">
                <div className="relative w-full rounded-xl overflow-hidden bg-foreground/5" style={{ aspectRatio: '3/4' }}>
                  {result ? (
                    <Image src={result} alt="Try-on result" fill className="object-cover" sizes="400px" />
                  ) : (
                    <Image src={userPhoto} alt="Your photo" fill className="object-cover" sizes="400px" />
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                      <Loader2 size={32} className="animate-spin text-accent" />
                      <p className="text-sm font-medium text-foreground/60">AI is dressing you up...</p>
                      <p className="text-[11px] text-foreground/30">Using {garmentTypeSkill[selectedType]}</p>
                    </div>
                  )}

                  {result && (
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider">
                        Try-On Complete
                      </span>
                    </div>
                  )}
                </div>

                {/* Reset */}
                <button
                  onClick={reset}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          {error && (
            <div className="mx-5 mt-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-foreground/10 space-y-2.5">
          <button
            onClick={userPhoto ? handleTryOn : () => fileRef.current?.click()}
            disabled={isProcessing}
            className={`w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              isProcessing
                ? 'bg-foreground/10 text-foreground/30 cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/25'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : userPhoto ? (
              <>
                <Sparkles size={16} />
                {result ? 'Try Again' : 'Start Try-On'}
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload Your Photo
              </>
            )}
          </button>

          {result && (
            <button className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all">
              Add to Cart
            </button>
          )}
        </div>
      </motion.div>
    </>
  )
}
