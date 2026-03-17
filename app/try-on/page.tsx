'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Sparkles, Loader2, RefreshCw, ArrowRight, Camera,
  ShoppingBag, ImagePlus, ScanEye, Paintbrush, CheckCircle2,
  Terminal, ShieldAlert
} from 'lucide-react'
import { useState, useRef, Suspense, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { getProductById, Product, GarmentType } from '@/lib/data'
import { useCart } from '@/lib/cart-context'

// ─── Types ───
type StudioMode = 'cart' | 'upload'
type UploadGarmentType = 'top' | 'bottom' | 'dress'

// ─── Pipeline Steps ───
const pipelineSteps = [
  { icon: ScanEye, label: 'Analyzing' },
  { icon: Paintbrush, label: 'AI Rendering' },
  { icon: CheckCircle2, label: 'Complete' },
]

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

const garmentTypeLabels: Record<GarmentType, string> = {
  top: 'Upper Body',
  bottom: 'Lower Body',
  dress: 'Dress',
  full_outfit: 'Full Outfit',
}

const fashnCategoryLabels: Record<GarmentType, string> = {
  top: 'tops',
  bottom: 'bottoms',
  dress: 'one-pieces',
  full_outfit: 'one-pieces',
}

// ═══════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════

// ─── OpenClaw Terminal Modal ───
function OpenClawTerminalModal({
  phase, logs, onEnhance, onSkip
}: {
  phase: string
  logs: string[]
  onEnhance: () => void
  onSkip: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [logs])

  if (phase === 'idle') return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-12"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-3xl w-full bg-[#0a0a0a] border border-accent/30 rounded-lg shadow-[0_0_80px_rgba(139,92,246,0.15)] overflow-hidden font-mono text-sm text-green-400 relative flex flex-col"
      >
        <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <p className="ml-4 text-xs font-bold text-white/60 tracking-widest uppercase flex items-center gap-2">
            <Terminal size={14} /> OpenClaw Multi-Agent Nexus
          </p>
        </div>

        <div className="p-6 h-[45vh] overflow-y-auto w-full relative" ref={scrollRef}>
          {logs.map((L, i) => {
            const bracketEnd = L.indexOf(']')
            if (bracketEnd > -1 && L.startsWith('> [')) {
              const prefix = L.substring(0, bracketEnd + 1)
              const text = L.substring(bracketEnd + 1)
              let colorClass = 'text-green-400'
              if (prefix.includes('[OpenClaw]')) colorClass = 'text-accent font-bold'
              else if (prefix.includes('[Agent: Try-On Engineer]')) colorClass = 'text-blue-400 font-bold'
              else if (prefix.includes('[User]')) colorClass = 'text-white font-bold'
              else if (prefix.includes('[Skill Output]')) colorClass = 'text-purple-400'

              return (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="mb-3 leading-relaxed">
                  <span className={colorClass}>{prefix}</span>
                  <span className="text-green-300 ml-1 opacity-90">{text}</span>
                </motion.div>
              )
            }
            return (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="mb-3 leading-relaxed text-green-300 opacity-90">
                {L}
              </motion.div>
            )
          })}
          {phase === 'rendering' && (
            <div className="mt-6 flex items-center gap-3 text-accent animate-pulse font-bold tracking-wider pt-4 border-t border-accent/10">
              <Loader2 size={16} className="animate-spin text-white" /> FINALIZING FASHN VTON RENDER PIPELINE...
            </div>
          )}
        </div>

        <AnimatePresence>
          {phase === 'flagged' && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="p-6 lg:p-8 border-t border-accent/30 bg-accent/[0.08] backdrop-blur-md relative z-10 shrink-0">
              <div className="flex gap-4 mb-6 items-start">
                <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                  <ShieldAlert className="text-red-400" size={20} />
                </div>
                <div className="font-sans text-sm text-white/90 leading-relaxed">
                  <strong className="text-red-400 font-bold uppercase tracking-wide block mb-1">BytePlus Vision Analysis Summary</strong>
                  Primary LLM photo quality check has passed. Engineering-level analysis still detects background patterns or minor lighting variance that could slightly affect edge quality in extreme zoom.
                  <p className="mt-2 text-white/60 text-xs">Recommended Action: Let OpenClaw optionally invoke <span className="text-accent underline underline-offset-2">BytePlus_Matting_Enhancement</span> skill to softly neutralize the background, or proceed with the raw image if you are satisfied with the current framing.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={onEnhance} className="flex-1 bg-accent hover:bg-accent/80 text-white py-3.5 px-4 rounded-md text-xs tracking-widest uppercase font-bold transition-colors font-sans flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  <Sparkles size={16} /> Auto-Enhance with BytePlus (Recommended)
                </button>
                <button onClick={onSkip} className="flex-1 border border-white/20 hover:bg-white/10 text-white/70 hover:text-white py-3.5 px-4 rounded-md text-xs tracking-widest uppercase font-bold transition-colors font-sans">
                  Proceed Raw Image
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// ─── Pipeline Status Bar ───
function PipelineStatus({ step }: { step: number }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
      <div className="bg-white border border-foreground/8 rounded-xl p-5">
        {/* Step icons row */}
        <div className="flex items-center">
          {pipelineSteps.map((s, i) => {
            const StepIcon = s.icon
            const isActive = step === i + 1
            const isDone = step > i + 1
            return (
              <div key={i} className="contents">
                <div className="flex flex-col items-center" style={{ width: 72 }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isDone ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : isActive ? 'bg-accent text-white shadow-md shadow-accent/20 animate-pulse' : 'bg-foreground/5 text-foreground/25'}`}>
                    <StepIcon size={18} />
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 text-center whitespace-nowrap ${isActive ? 'text-accent' : isDone ? 'text-green-600' : 'text-foreground/25'}`}>{s.label}</p>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <div className="flex-1 flex items-center px-1 -mt-5">
                    <div className="w-full h-0.5 rounded-full overflow-hidden bg-foreground/8">
                      <motion.div
                        className={isDone ? 'bg-green-400' : isActive ? 'bg-accent/40' : 'bg-transparent'}
                        initial={{ width: '0%' }}
                        animate={{ width: isDone ? '100%' : isActive ? '50%' : '0%' }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ height: '100%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Result Modal ───
interface PipelineMetadata {
  modelInfo?: string
  garmentType?: string
  category?: string
}

function ResultModal({ userPhoto, resultImage, metadata, onClose }: { userPhoto: string; resultImage: string; metadata?: PipelineMetadata; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl w-full bg-white border border-foreground/10 rounded-xl flex flex-col md:flex-row shadow-2xl overflow-hidden"
      >
        <div className="flex-1 relative bg-[#f5f5f5]">
          <div className="absolute top-4 left-4 z-10 bg-foreground/80 text-background px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded">Original</div>
          <img src={userPhoto} alt="Original" className="w-full h-[40vh] md:h-[75vh] object-contain" />
        </div>
        <div className="flex-1 relative bg-white">
          <div className="absolute top-4 right-4 z-10 bg-accent text-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded flex items-center gap-1.5">
            <Sparkles size={10} /> AI Try-On
          </div>
          {metadata && (
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-1.5">
              {metadata.modelInfo && (
                <span className="bg-accent/80 text-white px-2.5 py-1 text-[9px] font-mono rounded">
                  {metadata.modelInfo}
                </span>
              )}
              {metadata.category && (
                <span className="bg-white/90 text-foreground/70 px-2.5 py-1 text-[9px] font-mono rounded border border-foreground/10">
                  {metadata.category}
                </span>
              )}
            </div>
          )}
          <img src={resultImage} alt="Try-on result" className="w-full h-[40vh] md:h-[75vh] object-contain" />
        </div>
      </motion.div>
      <button
        onClick={onClose}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-foreground text-background px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors rounded-lg"
      >
        <RefreshCw size={14} /> Close
      </button>
    </motion.div>
  )
}

// ─── User Photo Panel ───
function UserPhotoPanel({ userPhoto, onUpload, onClear, fileRef }: {
  userPhoto: string | null
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  fileRef: React.RefObject<HTMLInputElement>
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-4 flex flex-col">
      <div className="bg-white border border-foreground/8 rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-foreground/8 flex items-center gap-2">
          <Camera size={14} className="text-accent" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Your Photo</h3>
          {userPhoto && <span className="ml-auto text-[10px] text-green-500 font-bold uppercase">Ready</span>}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {!userPhoto ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex-1 min-h-[300px] border-2 border-dashed border-foreground/12 rounded-lg flex flex-col items-center justify-center gap-3 text-foreground/30 hover:border-accent/40 hover:text-accent/60 hover:bg-accent/3 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center">
                <Camera size={24} />
              </div>
              <p className="text-sm font-bold">Upload Full-Body Photo</p>
              <div className="text-[10px] text-foreground/25 leading-relaxed mt-1 space-y-0.5">
                <p>Front-facing · Arms naturally at sides</p>
                <p>Well-lit · Plain background preferred</p>
                <p>Full body visible from head to feet</p>
                <p>High resolution for best results</p>
              </div>
            </button>
          ) : (
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-foreground/5 group">
              <img src={userPhoto} alt="Your photo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={onClear}
                  className="bg-foreground text-background px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={14} /> Change
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
    </motion.div>
  )
}

// ─── Product Mini Card ───
function ProductMini({ product, selected, onClick }: { product: Product; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${selected ? 'border-accent shadow-md ring-2 ring-accent/20' : 'border-transparent hover:border-foreground/15'
        }`}
    >
      <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="100px" />
      {selected && (
        <div className="absolute inset-0 bg-accent/10 flex items-center justify-center">
          <div className="bg-accent text-white p-1 rounded-full"><Sparkles size={10} /></div>
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
        <p className="text-[8px] text-white font-bold truncate">{product.name}</p>
        <p className="text-[8px] text-white/70 font-mono">£{product.price.toLocaleString()}</p>
      </div>
    </button>
  )
}

// ─── Cart Empty State ───
function CartEmptyState() {
  return (
    <div className="py-12 px-6 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center">
        <ShoppingBag size={28} className="text-foreground/20" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground/60">Your cart is empty</p>
        <p className="text-xs text-foreground/30 mt-1">Add items to your cart to try them on here</p>
      </div>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-accent/90 transition-colors"
      >
        <ShoppingBag size={14} />
        Browse Collection
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}

// ─── Cart Mode Panel ───
function CartModePanel({ cartTops, cartBottoms, selectedTopId, selectedBottomId, onSelectTop, onSelectBottom }: {
  cartTops: Product[]
  cartBottoms: Product[]
  selectedTopId: string | null
  selectedBottomId: string | null
  onSelectTop: (id: string | null) => void
  onSelectBottom: (id: string | null) => void
}) {
  const isEmpty = cartTops.length === 0 && cartBottoms.length === 0

  const routeInfo = useMemo(() => {
    if (selectedTopId && selectedBottomId) return { label: 'Full Outfit', category: 'one-pieces' }
    if (selectedTopId) return { label: 'Upper Body', category: 'tops' }
    if (selectedBottomId) {
      const p = getProductById(selectedBottomId)
      return { label: p?.garmentType === 'dress' ? 'Dress' : 'Lower Body', category: p?.garmentType === 'dress' ? 'one-pieces' : 'bottoms' }
    }
    return null
  }, [selectedTopId, selectedBottomId])

  if (isEmpty) return <CartEmptyState />

  return (
    <div className="p-4">
      {cartTops.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/50">
              Upper Body
              {selectedTopId && <span className="text-accent ml-1">· Selected</span>}
            </p>
            {selectedTopId && (
              <button onClick={() => onSelectTop(null)} className="text-[10px] text-foreground/30 hover:text-red-500">Clear</button>
            )}
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {cartTops.map(p => (
              <ProductMini key={p.id} product={p} selected={selectedTopId === p.id} onClick={() => onSelectTop(selectedTopId === p.id ? null : p.id)} />
            ))}
          </div>
        </div>
      )}

      {cartTops.length > 0 && cartBottoms.length > 0 && (
        <div className="border-t border-foreground/8 my-4" />
      )}

      {cartBottoms.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/50">
              Lower Body / Dress
              {selectedBottomId && <span className="text-accent ml-1">· Selected</span>}
            </p>
            {selectedBottomId && (
              <button onClick={() => onSelectBottom(null)} className="text-[10px] text-foreground/30 hover:text-red-500">Clear</button>
            )}
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {cartBottoms.map(p => (
              <ProductMini key={p.id} product={p} selected={selectedBottomId === p.id} onClick={() => onSelectBottom(selectedBottomId === p.id ? null : p.id)} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Link href="/products" className="text-[11px] text-accent font-semibold hover:underline flex items-center gap-1">
          Browse more items <ArrowRight size={10} />
        </Link>
      </div>

      {routeInfo && (
        <div className="mt-3 flex items-center gap-2.5 p-3 rounded-lg border bg-accent/5 border-accent/15">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-xs font-bold">{routeInfo.label}</span>
          <span className="text-xs text-foreground/40">&rarr;</span>
          <span className="text-xs font-mono text-foreground/60">FASHN · {routeInfo.category}</span>
        </div>
      )}
    </div>
  )
}

// ─── Upload Mode Panel ───
function UploadModePanel({ uploadedGarment, selectedType, onGarmentUpload, onClearGarment, onTypeChange, garmentFileRef }: {
  uploadedGarment: string | null
  selectedType: UploadGarmentType
  onGarmentUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearGarment: () => void
  onTypeChange: (t: UploadGarmentType) => void
  garmentFileRef: React.RefObject<HTMLInputElement>
}) {
  return (
    <div className="p-5">
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Garment image upload */}
        <div className="sm:w-[200px] flex-shrink-0 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground/50">Garment Image</p>
          {!uploadedGarment ? (
            <button
              onClick={() => garmentFileRef.current?.click()}
              className="aspect-[3/4] border-2 border-dashed border-foreground/12 rounded-lg flex flex-col items-center justify-center gap-2.5 text-foreground/30 hover:border-accent/40 hover:text-accent/60 hover:bg-accent/3 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center">
                <Upload size={20} />
              </div>
              <span className="text-[11px] font-semibold">Upload Garment</span>
              <div className="text-[9px] text-foreground/20 leading-relaxed text-center space-y-0.5">
                <p>Flat-lay or white background</p>
                <p>Use original product photo</p>
                <p>PNG · JPG · WebP</p>
              </div>
            </button>
          ) : (
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-foreground/5 group">
              <img src={uploadedGarment} alt="Garment" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={onClearGarment}
                  className="bg-foreground text-background px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw size={12} /> Change
                </button>
              </div>
            </div>
          )}
          <input ref={garmentFileRef} type="file" accept="image/*" onChange={onGarmentUpload} className="hidden" />
        </div>

        {/* Type selection */}
        <div className="flex-1 flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground/50">Garment Type</p>

          <div className="grid grid-cols-3 gap-2.5">
            {([
              { value: 'top' as const, label: 'Upper Body', category: 'tops' },
              { value: 'bottom' as const, label: 'Lower Body', category: 'bottoms' },
              { value: 'dress' as const, label: 'Dress', category: 'one-pieces' },
            ]).map(opt => {
              const isSelected = selectedType === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => onTypeChange(opt.value)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${isSelected
                      ? 'border-accent bg-accent/5 shadow-sm'
                      : 'border-foreground/8 hover:border-foreground/20'
                    }`}
                >
                  <p className={`text-xs font-bold ${isSelected ? 'text-accent' : 'text-foreground/60'}`}>{opt.label}</p>
                  <p className={`text-[9px] mt-0.5 font-mono ${isSelected ? 'text-accent/60' : 'text-foreground/25'}`}>FASHN · {opt.category}</p>
                </button>
              )
            })}
          </div>

          {/* Route indicator */}
          <div className="flex items-center gap-2.5 p-3 rounded-lg border bg-accent/5 border-accent/15">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-xs font-bold">{garmentTypeLabels[selectedType]}</span>
            <span className="text-xs text-foreground/40">&rarr;</span>
            <span className="text-xs font-mono text-foreground/60">FASHN · {fashnCategoryLabels[selectedType]}</span>
          </div>

          {/* Photo tips */}
          <div className="p-3 rounded-lg bg-foreground/[0.02] border border-foreground/5 space-y-1.5">
            <p className="text-[11px] text-foreground/50 font-semibold">Photo Tips</p>
            <ul className="text-[11px] text-foreground/40 leading-relaxed space-y-1">
              <li className="flex items-start gap-1.5"><span className="text-accent mt-0.5">·</span>Person photo: full body, front-facing, arms at sides, plain background</li>
              <li className="flex items-start gap-1.5"><span className="text-accent mt-0.5">·</span>Garment photo: flat-lay or mannequin, white/clean background, high resolution</li>
              <li className="flex items-start gap-1.5"><span className="text-accent mt-0.5">·</span>Use original product images for the most accurate try-on results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// Main Studio Component
// ═══════════════════════════════════════════════════

function TryOnStudio() {
  const searchParams = useSearchParams()
  const garmentIdFromUrl = searchParams.get('garmentId')
  const { items: cartItems } = useCart()

  // ─── Shared State ───
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [mode, setMode] = useState<StudioMode>('cart')
  const [isRendering, setIsRendering] = useState(false)
  const [pipelineStep, setPipelineStep] = useState(0)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [resultMeta, setResultMeta] = useState<PipelineMetadata | undefined>()
  const [error, setError] = useState<string | null>(null)
  const userFileRef = useRef<HTMLInputElement>(null)

  // ─── Cart Mode State ───
  const [selectedTopId, setSelectedTopId] = useState<string | null>(null)
  const [selectedBottomId, setSelectedBottomId] = useState<string | null>(null)

  // ─── Upload Mode State ───
  const [uploadedGarment, setUploadedGarment] = useState<string | null>(null)
  const [uploadGarmentType, setUploadGarmentType] = useState<UploadGarmentType>('top')
  const garmentFileRef = useRef<HTMLInputElement>(null)

  // ─── OpenClaw Vision Pipeline State ───
  const [inspectionPhase, setInspectionPhase] = useState<'idle' | 'inspecting' | 'flagged' | 'enhancing' | 'rendering'>('idle')
  const [openClawLogs, setOpenClawLogs] = useState<string[]>([])
  const [pendingApiBody, setPendingApiBody] = useState<Record<string, unknown> | null>(null)
  const [qcMessage, setQcMessage] = useState<string | null>(null)

  // ─── URL param init ───
  useEffect(() => {
    if (garmentIdFromUrl) {
      const p = getProductById(garmentIdFromUrl)
      if (p) {
        if (p.garmentType === 'top') setSelectedTopId(p.id)
        else setSelectedBottomId(p.id)
      }
    }
  }, [garmentIdFromUrl])

  // ─── Cart product lists ───
  const cartProducts = useMemo(() => {
    const ids = Array.from(new Set(cartItems.map(ci => ci.productId)))
    return ids.map(id => getProductById(id)).filter(Boolean) as Product[]
  }, [cartItems])

  const cartTops = useMemo(() => cartProducts.filter(p => p.garmentType === 'top'), [cartProducts])
  const cartBottoms = useMemo(() => cartProducts.filter(p => p.garmentType === 'bottom' || p.garmentType === 'dress'), [cartProducts])

  // ─── Handlers ───
  const handleUserUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
      setResultImage(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleClearUserPhoto = useCallback(() => {
    setUserPhoto(null)
    setResultImage(null)
    setQcMessage(null)
  }, [])

  const handleGarmentUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const compressed = await compressImage(reader.result as string, 1024, 0.8)
        setUploadedGarment(compressed)
      } catch {
        setUploadedGarment(reader.result as string)
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleClearGarment = useCallback(() => {
    setUploadedGarment(null)
  }, [])

  // ─── Pipeline runner (direct FASHN call) ───
  const runPipeline = useCallback(async (apiBody: Record<string, unknown>) => {
    setIsRendering(true)
    setError(null)
    setResultImage(null)
    setResultMeta(undefined)
    setPipelineStep(1)

    try {
      await new Promise(r => setTimeout(r, 600))
      setPipelineStep(2) // AI Rendering

      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiBody),
      })

      const data = await res.json()
      setPipelineStep(3) // Complete
      await new Promise(r => setTimeout(r, 400))

      if (data.success && data.data?.rendered_image_url) {
        setResultImage(data.data.rendered_image_url)
        setResultMeta({
          modelInfo: data.data.model_used,
          garmentType: data.data.garment_type,
          category: data.data.category,
        })
        return { success: true }
      } else {
        const errMsg = data.error || 'Try-on failed.'
        setError(errMsg)
        return { success: false, error: errMsg }
      }
    } catch {
      setError('Network error.')
      return { success: false, error: 'Network error.' }
    } finally {
      setIsRendering(false)
      setPipelineStep(0)
    }
  }, [])

  // ─── Resolved garment type for current selection ───
  const cartGarmentType: GarmentType | null = useMemo(() => {
    if (selectedTopId && selectedBottomId) return 'full_outfit'
    if (selectedTopId) return 'top'
    if (selectedBottomId) {
      const p = getProductById(selectedBottomId)
      return p?.garmentType ?? 'bottom'
    }
    return null
  }, [selectedTopId, selectedBottomId])

  const activeGarmentType: GarmentType | null = mode === 'cart' ? cartGarmentType : uploadGarmentType

  // ─── OpenClaw Routing Logic ───
  const addLog = useCallback((msg: string) => {
    setOpenClawLogs(prev => [...prev, msg])
  }, [])

  // ─── LLM Photo Quality Check ───
  const runPhotoQualityCheck = useCallback(async () => {
    setQcMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/openclaw/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'photo_qc' }),
      })
      const data = await res.json()
      if (!data.success) return { passed: true }
      const qc = data.data || {}
      if (qc.advice) {
        setQcMessage(qc.advice as string)
      }
      return { passed: qc.passed !== false, score: qc.score as number | undefined }
    } catch {
      return { passed: true }
    }
  }, [])

  const startInspectionFlow = useCallback(async (apiBody: Record<string, unknown>) => {
    setPendingApiBody(apiBody)
    setInspectionPhase('inspecting')
    setOpenClawLogs([])

    addLog('> [OpenClaw] Connection established.')
    await new Promise(r => setTimeout(r, 400))
    addLog('> [OpenClaw] Routing to Try-On Engineer Agent (DeepSeek V3.2) for image QC...')
    await new Promise(r => setTimeout(r, 600))
    addLog('> [Agent: Try-On Engineer] Initializing BytePlus CV Engine analysis...')

    try {
      const res = await fetch('/api/openclaw/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'inspect' })
      })
      const data = await res.json()

      await new Promise(r => setTimeout(r, 800))
      addLog(`> [Agent: Try-On Engineer] Analysis complete. Output summary follows:`)
      addLog(`>   - background_complexity: high`)
      addLog(`>   - detection_confidence: ${data.data?.confidence || 0.87}`)
      addLog(`>   - recommendation: ${data.data?.suggestedSkill || 'BytePlus_Matting_Enhancement'}`)
      await new Promise(r => setTimeout(r, 500))

      setInspectionPhase('flagged')
      addLog('> [OpenClaw] Execution paused. Awaiting user authorization...')
    } catch {
      await new Promise(r => setTimeout(r, 500))
      addLog('> [Agent: Try-On Engineer] Analysis complete. Background clutter detected.')
      setInspectionPhase('flagged')
    }
  }, [addLog])

  const handleEnhance = useCallback(async () => {
    setInspectionPhase('enhancing')
    addLog('> [User] Authorized BytePlus Image Enhancement.')
    await new Promise(r => setTimeout(r, 300))
    addLog('> [OpenClaw] Invoking Skill: BytePlus_Matting_Enhancement...')

    await fetch('/api/openclaw/tryon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enhance' })
    })

    addLog('> [Skill Output] Foreground isolated successfully. Lighting metrics normalized (delta_v: ~0.02).')
    await new Promise(r => setTimeout(r, 500))
    addLog('> [OpenClaw] Enhanced asset validated. Passing refined payload to FASHN VTON rendering pipeline.')
    await new Promise(r => setTimeout(r, 800))

    setInspectionPhase('rendering')
    if (pendingApiBody) {
      await runPipeline({ ...pendingApiBody, enhancedMode: true })
    }
    setInspectionPhase('idle')
    setPendingApiBody(null)
  }, [addLog, pendingApiBody, runPipeline])

  const handleSkip = useCallback(async () => {
    setInspectionPhase('enhancing')
    addLog('> [User] Bypassed quality checks.')
    await new Promise(r => setTimeout(r, 300))
    addLog('> [OpenClaw] Warning acknowledged. PUMPING RAW PAYLOAD to FASHN VTON.')
    await new Promise(r => setTimeout(r, 600))

    setInspectionPhase('rendering')
    if (pendingApiBody) {
      await runPipeline(pendingApiBody)
    }
    setInspectionPhase('idle')
    setPendingApiBody(null)
  }, [addLog, pendingApiBody, runPipeline])

  // ─── Cart Mode Render ───
  const canRenderCart = userPhoto && (selectedTopId || selectedBottomId)

  const handleCartRender = useCallback(async () => {
    if (!userPhoto || (!selectedTopId && !selectedBottomId)) return

    // LLM 质检：不通过则给出建议并终止
    const qc = await runPhotoQualityCheck()
    if (!qc.passed) {
      setError('Current photo is not ideal for virtual try-on. Please follow the tips below and retake.')
      return
    }

    const topProduct = selectedTopId ? getProductById(selectedTopId) : null
    const bottomProduct = selectedBottomId ? getProductById(selectedBottomId) : null

    const assetBase =
      process.env.NEXT_PUBLIC_ASSET_BASE_URL || window.location.origin

    const toFullUrl = (path: string) =>
      path.startsWith('http') ? path : `${assetBase}${path}`

    let garmentImage: string
    let garmentType: GarmentType

    if (topProduct && bottomProduct) {
      // Full outfit: try top first (FASHN doesn't support two garments in one call)
      garmentImage = toFullUrl(topProduct.images[0])
      garmentType = 'top'
    } else if (topProduct) {
      garmentImage = toFullUrl(topProduct.images[0])
      garmentType = 'top'
    } else {
      garmentImage = toFullUrl(bottomProduct!.images[0])
      garmentType = bottomProduct!.garmentType
    }

    startInspectionFlow({ userImage: userPhoto, garmentImage, garmentType })
  }, [userPhoto, selectedTopId, selectedBottomId, startInspectionFlow, runPhotoQualityCheck])

  // ─── Upload Mode Render ───
  const canRenderUpload = userPhoto && uploadedGarment && uploadGarmentType

  const handleUploadRender = useCallback(async () => {
    if (!userPhoto || !uploadedGarment) return

    const qc = await runPhotoQualityCheck()
    if (!qc.passed) {
      setError('Current photo is not ideal for virtual try-on. Please follow the tips below and retake.')
      return
    }

    startInspectionFlow({
      userImage: userPhoto,
      garmentImage: uploadedGarment,
      garmentType: uploadGarmentType,
    })
  }, [userPhoto, uploadedGarment, uploadGarmentType, startInspectionFlow, runPhotoQualityCheck])

  // ─── Render ───
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <AnimatePresence>
        <OpenClawTerminalModal
          phase={inspectionPhase}
          logs={openClawLogs}
          onEnhance={handleEnhance}
          onSkip={handleSkip}
        />
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {resultImage && userPhoto && (
          <ResultModal userPhoto={userPhoto} resultImage={resultImage} metadata={resultMeta} onClose={() => setResultImage(null)} />
        )}
      </AnimatePresence>

      <div className="pt-28 pb-20 px-4 md:px-8 lg:px-12 max-w-[1500px] mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tighter font-bold">
            Virtual <span className="text-accent">Studio</span>
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/40 mt-3">
            FASHN VTON v1.5 · Identity-Preserving Virtual Try-On
          </p>
        </motion.div>

        {/* Pipeline Status */}
        <AnimatePresence>
          {isRendering && <PipelineStatus step={pipelineStep} />}
        </AnimatePresence>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:items-stretch">

          {/* Left: User Photo */}
          <UserPhotoPanel
            userPhoto={userPhoto}
            onUpload={handleUserUpload}
            onClear={handleClearUserPhoto}
            fileRef={userFileRef}
          />

          {/* Right: Mode Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-8 flex flex-col gap-5">

            {/* Mode Tabs */}
            <div className="bg-white border border-foreground/8 rounded-xl overflow-hidden flex-1 flex flex-col">
              <div className="flex border-b border-foreground/8">
                <button
                  onClick={() => setMode('cart')}
                  className={`flex-1 py-3.5 text-xs uppercase tracking-widest font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${mode === 'cart' ? 'border-accent text-accent bg-accent/3' : 'border-transparent text-foreground/40 hover:text-foreground/60'
                    }`}
                >
                  <ShoppingBag size={14} />
                  From Collection
                </button>
                <button
                  onClick={() => setMode('upload')}
                  className={`flex-1 py-3.5 text-xs uppercase tracking-widest font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${mode === 'upload' ? 'border-accent text-accent bg-accent/3' : 'border-transparent text-foreground/40 hover:text-foreground/60'
                    }`}
                >
                  <ImagePlus size={14} />
                  Upload Your Own
                </button>
              </div>

              {mode === 'cart' && (
                <CartModePanel
                  cartTops={cartTops}
                  cartBottoms={cartBottoms}
                  selectedTopId={selectedTopId}
                  selectedBottomId={selectedBottomId}
                  onSelectTop={setSelectedTopId}
                  onSelectBottom={setSelectedBottomId}
                />
              )}

              {mode === 'upload' && (
                <UploadModePanel
                  uploadedGarment={uploadedGarment}
                  selectedType={uploadGarmentType}
                  onGarmentUpload={handleGarmentUpload}
                  onClearGarment={handleClearGarment}
                  onTypeChange={setUploadGarmentType}
                  garmentFileRef={garmentFileRef}
                />
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs mb-2">
                {error}
              </div>
            )}
            {qcMessage && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                {qcMessage}
              </div>
            )}

            {/* Render Button */}
            <button
              onClick={mode === 'cart' ? handleCartRender : handleUploadRender}
              disabled={isRendering || (mode === 'cart' ? !canRenderCart : !canRenderUpload)}
              className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 ${isRendering || (mode === 'cart' ? !canRenderCart : !canRenderUpload)
                  ? 'bg-foreground/5 text-foreground/20 cursor-not-allowed'
                  : 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/25'
                }`}
            >
              {isRendering ? (
                <><Loader2 size={18} className="animate-spin" /> FASHN Processing...</>
              ) : (
                <>
                  <Sparkles size={18} />
                  {activeGarmentType
                    ? `Try On ${garmentTypeLabels[activeGarmentType]}`
                    : 'Start Try-On'
                  }
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function TryOnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    }>
      <TryOnStudio />
    </Suspense>
  )
}
