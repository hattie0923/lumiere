'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, Upload, Shirt, Zap, Terminal } from 'lucide-react';
import { products } from '@/lib/data';
import Navigation from '@/components/Navigation';
import ProductCard from '@/components/ProductCard';
import TryOnFloat from '@/components/TryOnFloat';
import Footer from '@/components/Footer';
import type { Product } from '@/lib/data';

const marqueeItems = [
  'NEW ARRIVALS', 'SS26 COLLECTION', 'AI VIRTUAL TRY-ON', 'FREE SHIPPING OVER £330',
  'LUMIÈRE', 'OPENCLAW POWERED', 'SUB-MILLIMETER PRECISION', 'NEURAL DRAPING',
];

/* ── Clip-masked text reveal ── */
function RevealLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ── Scroll-triggered reveal ── */
function ScrollReveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [navTheme, setNavTheme] = useState<'light' | 'dark'>('light');
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);

  const darkSectionRef = useRef<HTMLDivElement>(null);
  const darkInView = useInView(darkSectionRef, { amount: 0.3 });
  const lightSectionRef = useRef<HTMLDivElement>(null);
  const lightInView = useInView(lightSectionRef, { amount: 0.3 });

  /* Mouse parallax for hero */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX - innerWidth / 2) / innerWidth * 20);
    mouseY.set((clientY - innerHeight / 2) / innerHeight * 20);
  }, [mouseX, mouseY]);

  /* Scroll transforms */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 0.6], [1, 1.1]);
  const heroTextY = useTransform(heroScroll, [0, 0.5], [0, -60]);

  /* Horizontal scroll text */
  const editorialRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: editorialScroll } = useScroll({ target: editorialRef, offset: ['start end', 'end start'] });
  const editorialX = useTransform(editorialScroll, [0, 1], ['10%', '-40%']);

  useEffect(() => {
    if (darkInView) setNavTheme('light');
    else if (lightInView) setNavTheme('dark');
    else setNavTheme('light');
  }, [darkInView, lightInView]);

  const newInProducts = products.filter(p => p.badge === 'NEW' || p.badge === 'HOT').slice(0, 8);

  return (
    <main className="relative w-full bg-white min-h-screen selection:bg-accent selection:text-white">
      <Navigation theme={navTheme} />

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Cinematic Full-Bleed (landonorris.com inspired)
      ═══════════════════════════════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
      >
        {/* Full-bleed video background */}
        <motion.div
          style={{ scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <video
            autoPlay loop muted playsInline
            className="w-full h-full object-cover"
          >
            <source src="/vedio1.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-[1] hero-gradient" />

        {/* Accent glow at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] z-[1] hero-glow animate-glow-pulse" />

        {/* Hero content */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroTextY }}
          className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-20"
        >
          {/* HUD Elements — same container structure as Navigation for alignment */}
          <div className="absolute bottom-8 left-0 right-0 z-20 hidden md:block">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 flex justify-between items-end">
              <div className="text-white/50 font-mono text-[10px] tracking-widest leading-relaxed text-left">
                <p>// LMRE-SYS-01</p>
                <p>LAT: 48.8566° N</p>
                <p>LON: 2.3522° E</p>
                <p className="mt-2 text-[#8B5CF6]">NEURAL DRAPING ACTIVE</p>
              </div>
              <div className="text-white/50 font-mono text-[10px] tracking-widest leading-relaxed text-right">
                <p>VIRTUAL ATELIER</p>
                <p>VER. 2026.1.0</p>
                <p>PARIS / GLOBAL</p>
              </div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/80 font-mono uppercase tracking-[0.5em] text-[10px] md:text-sm mb-4"
          >
            // The Next Generation
          </motion.p>

          <h1 className="font-display text-[22vw] md:text-[18vw] lg:text-[15vw] leading-[0.75] tracking-tighter uppercase text-white m-0 p-0 mix-blend-overlay opacity-90">
            <RevealLine delay={0.3}>
              <span className="block">Digital</span>
            </RevealLine>
            <RevealLine delay={0.4}>
              <span className="block text-gradient relative z-20" style={{ WebkitTextFillColor: 'transparent' }}>Fashion</span>
            </RevealLine>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-12 text-white/70 max-w-xl mx-auto text-lg md:text-2xl font-serif italic font-light tracking-wide leading-relaxed text-center"
          >
            "Redefining the boundaries of haute couture through sub-millimeter neural rendering."
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/products" className="group relative glass px-8 py-4 font-display uppercase tracking-widest text-sm text-white text-center overflow-hidden rounded-full">
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Shop Collection</span>
              <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out rounded-full" />
            </Link>
            <Link href="/try-on" className="glass px-8 py-4 font-display uppercase tracking-widest text-sm text-white hover:bg-white/20 transition-all duration-300 text-center flex items-center justify-center gap-2 rounded-full">
              <Sparkles size={14} /> Try On Now
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">Scroll</span>
          <div className="w-px h-8 bg-white/20" />
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════
          MARQUEE — Enhanced with topography
      ═══════════════════════════════════════════════════════════════ */}
      <div className="border-y border-foreground/10 py-5 overflow-hidden bg-background bg-topo">
        <div className="marquee-track flex whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-8 text-sm font-display uppercase tracking-[0.25em] text-foreground/20 flex items-center gap-5">
              {item}
              <span className="w-2 h-2 rounded-full bg-accent/30" />
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BRAND STATEMENT — Asymmetric Editorial
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={lightSectionRef} className="py-24 md:py-36 bg-background overflow-hidden relative">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left — bold statement */}
            <div className="lg:col-span-7">
              <ScrollReveal>
                <p className="text-accent font-mono text-xs uppercase tracking-[0.3em] font-bold mb-6">// Our Vision</p>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tighter font-bold leading-[0.9]">
                  Where{' '}
                  <span className="text-gradient" style={{ WebkitTextFillColor: 'transparent' }}>AI</span>
                  <br />
                  Meets Haute
                  <br />
                  Couture
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="mt-8 text-foreground/50 max-w-lg text-lg font-light tracking-wide leading-relaxed border-l-2 border-accent pl-6">
                  LUMIÈRE bridges the gap between digital innovation and luxury fashion.
                  Our multi-agent AI system creates photorealistic virtual try-on experiences
                  that transform how you discover and wear fashion.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="mt-10 flex items-center gap-6">
                  <Link href="/try-on" className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-accent hover:text-foreground transition-colors">
                    Experience Now
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                  <div className="h-px flex-1 bg-foreground/10 max-w-[200px]" />
                </div>
              </ScrollReveal>
            </div>

            {/* Right — AI Neural Viewport */}
            <motion.div
              style={{ x: smoothX, y: smoothY }}
              className="lg:col-span-5 relative"
            >
              <ScrollReveal delay={0.2}>
                <div className="relative group">
                  {/* Glow backdrop */}
                  <div className="absolute -inset-6 bg-gradient-to-br from-accent/20 via-transparent to-accent/10 rounded-3xl -z-10 blur-xl group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-700" />

                  {/* Main viewport frame */}
                  <div className="relative overflow-hidden rounded-2xl aspect-[3/4] border border-white/10 group-hover:border-accent/30 transition-colors duration-500">

                    {/* Video */}
                    <video
                      autoPlay loop muted playsInline
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    >
                      <source src="/video0.mp4" type="video/mp4" />
                    </video>

                    {/* Scan line animation */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/60 to-transparent animate-scan" />
                    </div>

                    {/* Corner brackets — viewfinder style */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/40 rounded-tl-sm" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/40 rounded-tr-sm" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white/40 rounded-bl-sm" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white/40 rounded-br-sm" />

                    {/* Top-right HUD readout */}
                    <div className="absolute top-5 right-5 text-right font-mono text-[8px] tracking-widest text-white/50 leading-relaxed">
                      <p>REC <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-1 align-middle" /></p>
                      <p className="mt-1">1080p · 60fps</p>
                      <p>NEURAL MESH</p>
                    </div>

                    {/* Bottom gradient overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Glass tag — upgraded */}
                    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                      <div className="backdrop-blur-md bg-white/10 border border-white/15 px-5 py-3 rounded-xl">
                        <span className="block font-display text-2xl text-accent leading-none">AI</span>
                        <span className="block font-mono text-[9px] uppercase font-bold tracking-widest mt-1 text-white/70">Powered Try-On</span>
                      </div>
                      <div className="font-mono text-[8px] text-white/40 tracking-widest text-right leading-relaxed mb-1">
                        <p>DRAPE v2.6</p>
                        <p>ACCURACY 99.7%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          NEW IN — Product Grid with curved divider
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-28 bg-surface/50 bg-topo">
        {/* Curved divider at top */}
        <div className="absolute -top-[60px] left-0 right-0 h-[60px] bg-surface/50 bg-topo" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />

        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <ScrollReveal>
              <div>
                <p className="text-accent font-mono text-xs uppercase tracking-[0.3em] font-bold mb-2">// Fresh Drops</p>
                <h2 className="font-display text-5xl md:text-6xl uppercase tracking-tighter font-bold">New In</h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Link href="/products" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-accent transition-colors group">
                View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newInProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={product} index={i} onTryOn={() => setTryOnProduct(product)} />
              </motion.div>
            ))}
          </div>

          <div className="md:hidden text-center mt-8">
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent">
              View All Collection <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Curved divider at bottom to transition out naturally */}
        <div className="absolute -bottom-[59px] left-0 right-0 h-[60px] bg-surface/50 bg-topo pointer-events-none z-10" style={{ clipPath: 'ellipse(55% 100% at 50% 0%)' }} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS — Cinematic Numbered Steps
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-36 bg-background relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <ScrollReveal className="text-center mb-20">
            <p className="text-accent font-mono text-xs uppercase tracking-[0.3em] font-bold mb-4">// How It Works</p>
            <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tighter font-bold">
              Try Before<br />You Buy
            </h2>
          </ScrollReveal>

          <div className="space-y-16 md:space-y-24">
            {[
              { icon: Upload, step: '01', title: 'Upload Your Photo', desc: 'Take a full-body photo or upload one from your gallery. Our AI ensures privacy-first processing with on-device analysis.', align: 'left' as const },
              { icon: Shirt, step: '02', title: 'Choose Garments', desc: 'Browse our curated collection and select any piece. Mix and match tops and bottoms freely across our entire catalog.', align: 'right' as const },
              { icon: Zap, step: '03', title: 'Instant Try-On', desc: 'Identity-preserving rendering with sub-millimeter precision. Your face, your body shape, new clothes — rendered in seconds.', align: 'left' as const },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 0.1}>
                <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}>
                  {/* Number + icon */}
                  <div className="relative flex-shrink-0">
                    <span className="font-display text-[120px] md:text-[180px] leading-none font-bold text-foreground/[0.04] select-none">
                      {item.step}
                    </span>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                      <item.icon size={32} className="text-accent" />
                    </div>
                  </div>
                  {/* Content */}
                  <div className={`max-w-md ${item.align === 'right' ? 'md:text-right' : ''}`}>
                    <h3 className="font-display text-2xl md:text-3xl uppercase tracking-tight font-bold mb-4">{item.title}</h3>
                    <p className="text-foreground/50 text-base leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.2} className="text-center mt-16">
            <Link href="/try-on" className="inline-flex items-center gap-3 bg-accent text-white px-10 py-5 font-display uppercase tracking-widest text-sm hover:bg-accent/90 transition-colors rounded-full shadow-glow hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] transition-shadow duration-500">
              <Sparkles size={16} /> Experience Virtual Try-On <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WOMEN / MEN — Editorial Staggered Layout
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={darkSectionRef} className="bg-foreground text-background relative pb-24 md:pb-40 pt-20 md:pt-32">
        {/* Curved divider at top */}
        <div className="absolute -top-[50px] left-0 right-0 h-[50px] bg-foreground" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />

        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <ScrollReveal className="text-center mb-16 md:mb-24 relative z-10">
            <p className="text-accent font-mono text-xs uppercase tracking-[0.3em] font-bold mb-4">// Explore Categories</p>
            <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tighter font-bold text-white">
              Choose Your<br />Dimension
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-24 items-start">
            {/* Women's Card */}
            <ScrollReveal>
              <Link href="/products?category=women" className="relative group block">
                <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[3rem] aspect-[3/4] bg-white/5 border border-white/5 shadow-2xl">
                  <Image
                    src="/women12.webp"
                    alt="Women's Collection"
                    fill
                    className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:opacity-90 grayscale-[20%] group-hover:grayscale-0"
                  />
                  {/* Vignette & Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Text Content */}
                  <div className="absolute inset-fit p-8 md:p-12 flex flex-col justify-end w-full h-full">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-4 block">// Series 01</span>
                      <h3 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tighter text-white font-bold leading-none">Women</h3>
                      <div className="mt-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors duration-500">
                        <span className="relative overflow-hidden">
                          <span className="inline-block transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">Shop Collection</span>
                        </span>
                        <ArrowRight size={14} className="text-accent transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* Men's Card - Staggered offset */}
            <ScrollReveal delay={0.2}>
              <Link href="/products?category=men" className="relative group block md:mt-32">
                <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[3rem] aspect-[3/4] bg-white/5 border border-white/5 shadow-2xl">
                  <Image
                    src="/men12.jpeg"
                    alt="Men's Collection"
                    fill
                    className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:opacity-90 grayscale-[20%] group-hover:grayscale-0"
                  />
                  {/* Vignette & Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Text Content */}
                  <div className="absolute inset-fit p-8 md:p-12 flex flex-col justify-end w-full h-full">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-4 block">// Series 02</span>
                      <h3 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tighter text-white font-bold leading-none">Men</h3>
                      <div className="mt-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors duration-500">
                        <span className="relative overflow-hidden">
                          <span className="inline-block transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">Shop Collection</span>
                        </span>
                        <ArrowRight size={14} className="text-accent transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MULTI-AGENT — Dark Section with Topography + Glass
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40 bg-foreground text-white overflow-hidden relative bg-topo-dark">
        {/* Accent glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] hero-glow opacity-20" />

        <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal className="text-center mb-20">
            <p className="text-accent font-mono text-xs uppercase tracking-[0.3em] font-bold mb-4">// Technology</p>
            <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tighter font-bold">
              Multi-Agent<br />Intelligence
            </h2>
            <p className="text-white/40 mt-6 max-w-lg mx-auto text-lg font-light">
              Powered by OpenClaw&apos;s multi-agent architecture — three specialized AI agents working in concert.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { agent: 'Concierge', model: 'Kimi K2.5', step: '01', desc: 'Answers questions, discovers products, and guides your shopping journey with expert fashion knowledge.' },
              { agent: 'Stylist', model: 'Kimi K2.5', step: '02', desc: 'Curates personalized outfit combinations based on occasion, color theory, and your personal style.' },
              { agent: 'Engineer', model: 'DeepSeek V3.2', step: '03', desc: 'Intelligently routes to the optimal virtual try-on model and optimizes rendering parameters.' },
            ].map((item, i) => (
              <ScrollReveal key={item.agent} delay={i * 0.15}>
                <div className="glass rounded-2xl p-8 group hover:bg-white/12 transition-all duration-500 hover:shadow-glass h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:text-white text-accent transition-all duration-300">
                      <Sparkles size={24} />
                    </div>
                    <span className="font-mono text-3xl font-bold text-white/10">{item.step}</span>
                  </div>
                  <h3 className="font-display text-xl uppercase tracking-tight font-bold mb-1">{item.agent}</h3>
                  <span className="inline-block text-[10px] font-mono text-white/30 mb-4">{item.model}</span>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Tech bar */}
          <ScrollReveal delay={0.3} className="mt-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl glass">
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                {['OpenClaw', 'FASHN VTON v1.5', 'Kimi K2.5', 'DeepSeek V3.2'].map(tech => (
                  <span key={tech} className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-white/40 border border-white/10 rounded-full hover:border-accent/50 hover:text-accent transition-all duration-300">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-xs text-white/30">
                  Try it — click the <span className="inline-flex items-center gap-1 text-accent font-semibold"><Sparkles size={10} />sparkle</span> button
                </p>
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-glow animate-pulse">
                  <Sparkles size={14} />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA BANNER — Statement
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40 bg-background relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] hero-glow opacity-30 animate-glow-pulse" />

        <div className="max-w-[900px] mx-auto px-4 text-center relative z-10">
          <ScrollReveal>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tighter font-bold mb-8 leading-[0.9]">
              Ready to
              <br />
              <span className="text-gradient" style={{ WebkitTextFillColor: 'transparent' }}>Experience</span>
              <br />
              the Future?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-foreground/40 text-lg max-w-lg mx-auto mb-12 font-light">
              Upload your photo and try on any garment from our collection.
              No signup required. Instant results.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.25}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/try-on" className="inline-flex items-center justify-center gap-3 bg-accent text-white px-10 py-5 font-display uppercase tracking-widest text-sm hover:bg-accent/90 transition-all duration-300 rounded-full shadow-glow hover:shadow-[0_0_60px_rgba(139,92,246,0.4)]">
                <Sparkles size={16} /> Start Virtual Try-On
              </Link>
              <Link href="/products" className="inline-flex items-center justify-center gap-3 border-2 border-foreground text-foreground px-10 py-5 font-display uppercase tracking-widest text-sm hover:bg-foreground hover:text-background transition-all duration-300 rounded-full">
                Browse Collection <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />

      {tryOnProduct && (
        <TryOnFloat product={tryOnProduct} onClose={() => setTryOnProduct(null)} />
      )}
    </main>
  );
}
