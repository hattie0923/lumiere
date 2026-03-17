# LUMIERE — Project Architecture Document

> AI-Powered Fashion E-Commerce with OpenClaw Multi-Agent Virtual Try-On

---

## 1. Project Overview

**LUMIERE** is a Next.js 14 fashion e-commerce平台, integrating OpenClaw multi-agent system for智能虚拟试穿 (Virtual Try-On) and AI styling consultation. The platform orchestrates two specialized VTON models through OpenClaw's skill-based routing, providing a seamless try-on experience for different garment types.

| Item | Detail |
|------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| AI Orchestration | OpenClaw 2026.3.7 |
| VTON Models | FASHN VTON v1.5, Flux Klein 9B (fal.ai) |
| LLM Providers | Kimi K2.5 (Moonshot), DeepSeek V3.2 (BytePlus) |

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                      │
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
│  │ Homepage │  │ Products │  │  Virtual   │  │ Cart/Wishlist│  │
│  │  /       │  │ /products│  │  Studio    │  │ /cart        │  │
│  │          │  │ /[id]    │  │  /try-on   │  │ /wishlist    │  │
│  └──────────┘  └────┬─────┘  └─────┬──────┘  └──────────────┘  │
│                     │              │                            │
│              ┌──────┴──────┐       │       ┌────────────────┐  │
│              │ TryOnFloat  │       │       │  AIConcierge   │  │
│              │ (侧边面板)   │       │       │  (全局浮窗)     │  │
│              └──────┬──────┘       │       └───────┬────────┘  │
│                     │              │               │           │
└─────────────────────┼──────────────┼───────────────┼───────────┘
                      │              │               │
                      ▼              ▼               ▼
              ┌──────────────┐  ┌──────────────┐
              │ POST         │  │ POST         │
              │ /api/try-on  │  │ /api/openclaw│
              │              │  │ /chat        │
              └──────┬───────┘  └──────┬───────┘
                     │                 │
         ┌───────────┼─────────────────┼───────────────┐
         │           ▼                 ▼               │
         │  ┌─────────────── OpenClaw Gateway ──────┐  │
         │  │                                       │  │
         │  │  ┌─────────┐  ┌──────────┐  ┌──────┐ │  │
         │  │  │engineer │  │ stylist  │  │ main │ │  │
         │  │  │DeepSeek │  │ Kimi K2.5│  │Kimi  │ │  │
         │  │  │V3.2     │  │          │  │K2.5  │ │  │
         │  │  └────┬────┘  └──────────┘  └──────┘ │  │
         │  │       │                               │  │
         │  │  ┌────┴────────────────────┐          │  │
         │  │  │       Skills            │          │  │
         │  │  │  ┌──────────────────┐   │          │  │
         │  │  │  │ fashn-tryon      │   │          │  │
         │  │  │  │ (Upper Body)     │   │          │  │
         │  │  │  └──────────────────┘   │          │  │
         │  │  │  ┌──────────────────┐   │          │  │
         │  │  │  │ flux-klein-tryon │   │          │  │
         │  │  │  │ (Lower/Dress)    │   │          │  │
         │  │  │  └──────────────────┘   │          │  │
         │  │  └─────────────────────────┘          │  │
         │  └───────────────────────────────────────┘  │
         │                                             │
         │           ▼                    ▼            │
         │   ┌──────────────┐   ┌──────────────────┐  │
         │   │  FASHN API   │   │  fal.ai Queue    │  │
         │   │  api.fashn.ai│   │  queue.fal.run   │  │
         │   └──────────────┘   └──────────────────┘  │
         └─────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
1demo/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Providers + AIConcierge)
│   ├── page.tsx                  # Homepage
│   ├── globals.css               # CSS variables & utilities
│   ├── components/
│   │   └── Hero.tsx              # Landing page hero (3-section)
│   ├── products/
│   │   ├── page.tsx              # Product listing with filters
│   │   └── [id]/page.tsx         # Product detail page
│   ├── try-on/
│   │   └── page.tsx              # Virtual Studio (cart/upload modes)
│   ├── cart/page.tsx             # Shopping cart
│   ├── wishlist/page.tsx         # Wishlist
│   └── api/
│       ├── try-on/route.ts       # VTON API (OpenClaw routing)
│       └── openclaw/chat/route.ts# AI chat API
│
├── components/                   # Shared UI components
│   ├── Navigation.tsx            # Global nav bar
│   ├── ProductCard.tsx           # Product grid card
│   ├── TryOnFloat.tsx            # Product page try-on panel
│   └── AIConcierge.tsx           # Global AI chat widget
│
├── lib/                          # Core utilities
│   ├── data.ts                   # Product catalog (27 SKUs)
│   ├── openclaw.ts               # OpenClaw CLI wrapper
│   ├── cart-context.tsx          # Cart state (Context + localStorage)
│   └── wishlist-context.tsx      # Wishlist state (Context + localStorage)
│
├── backend/                      # OpenClaw agent/skill definitions (reference)
│   ├── agents/
│   │   ├── fashion_consultant.json
│   │   └── try_on_engineer.json
│   └── skills/
│       └── virtual_try_on_renderer.js
│
├── public/
│   ├── hero1.png, hero2.png, hero3.png
│   ├── video0.mp4                # Hero background video
│   └── products/                 # 27 product images
│       ├── women/{top,bottom,dress}/
│       └── men/{top,bottom}/
│
├── next.config.js
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## 4. OpenClaw Multi-Agent Architecture

### 4.1 Agent Topology

| Agent | ID | Model | Role |
|-------|----|-------|------|
| **LUMIERE Concierge** | `main` | Kimi K2.5 (Moonshot) | Entry point, general Q&A, dispatches to sub-agents |
| **Fashion Stylist** | `stylist` | Kimi K2.5 (Moonshot) | Fashion advice, outfit recommendations, cross-sell |
| **Try-On Engineer** | `engineer` | DeepSeek V3.2 (BytePlus) | VTON skill routing, prompt engineering, model selection |

### 4.2 Agent Configuration

Agents are configured in `~/.openclaw/openclaw.json`:

```
agents.list[]:
  main     → default agent, entry for AIConcierge chat
  stylist  → workspace: ~/.openclaw/workspace-stylist/
             skill: fashion-advisor (styling advice)
  engineer → workspace: ~/.openclaw/workspace-engineer/
             skills: fashn-tryon, flux-klein-tryon
```

### 4.3 Skill Definitions

#### `fashn-tryon` (Engineer Skill)

| Property | Value |
|----------|-------|
| Purpose | Upper body garment try-on |
| API | FASHN VTON v1.5 (api.fashn.ai) |
| Input | Person photo + garment image + category |
| Flow | Submit job → Poll status → Return result |
| Timeout | 60 seconds |
| Env | `FASHN_API_KEY` |

#### `flux-klein-tryon` (Engineer Skill)

| Property | Value |
|----------|-------|
| Purpose | Lower body, dresses, full outfits |
| API | Flux 2 LoRA Gallery (fal.ai queue) |
| Input | `image_urls[]` + prompt + params |
| Flow | Submit to queue → Poll `request_id` → Fetch result |
| Timeout | 120 seconds |
| Env | `FAL_KEY` |
| Key feature | **Prompt engineering** — engineer agent generates optimized prompts including garment length, fit, material, color |

#### `fashion-advisor` (Stylist Skill)

| Property | Value |
|----------|-------|
| Purpose | Fashion styling advice and product recommendations |
| Trigger | User asks for outfit pairing, styling tips, trend info |
| Output | Structured recommendations with product names, prices, reasons |

### 4.4 Routing Flow (Virtual Try-On)

```
Frontend sends: { userImage, garmentImage, garmentType, garmentDescription }
                              │
                              ▼
                    /api/try-on (Node.js)
                              │
            ┌─────────────────┼─────────────────┐
            │   Step 1: Ask OpenClaw Engineer    │
            │                                    │
            │   Message to engineer agent:       │
            │   "Garment type: top               │
            │    Details: Lace-Trim Blouse,      │
            │    100% Cotton..."                 │
            │                                    │
            │   Engineer reads skills →          │
            │   Returns JSON decision:           │
            │   {                                │
            │     "skill": "fashn-tryon",        │
            │     "category": "tops",            │
            │     "prompt": "...",               │
            │     "lora_scale": 1.2              │
            │   }                                │
            └─────────────────┼─────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │   Step 2: Execute Chosen Skill     │
            │                                    │
            │   fashn-tryon:                     │
            │     POST api.fashn.ai/v1/run       │
            │     → Poll /v1/status/{id}         │
            │     → Return output URL            │
            │                                    │
            │   flux-klein-tryon:                │
            │     POST queue.fal.run/...         │
            │     → Poll /requests/{id}/status   │
            │     → GET /requests/{id}           │
            │     → Return images[0].url         │
            └─────────────────┼─────────────────┘
                              │
                              ▼
                    Return to frontend:
                    { rendered_image_url, model_used,
                      skill_used, routed_by: "OpenClaw" }
```

**Fallback**: If OpenClaw Gateway is unreachable, deterministic routing kicks in (top → FASHN, others → Flux Klein) with default prompts.

---

## 5. Frontend Architecture

### 5.1 Page Map

| Route | Component | Features |
|-------|-----------|----------|
| `/` | `Hero` | 3-section landing (fashion showcase, precision tech, OpenClaw intro) |
| `/products` | Products grid | Category/type filters, search, try-on from cards |
| `/products/[id]` | Product detail | Images, colors, sizes, add to cart, `TryOnFloat` panel |
| `/try-on` | Virtual Studio | Two modes: **Cart** (select from cart items) / **Upload** (custom garment) |
| `/cart` | Shopping cart | Quantity controls, order summary, shipping calc |
| `/wishlist` | Wishlist | Heart-toggled items, quick actions |

### 5.2 Virtual Studio (`/try-on`) Modes

**Cart Mode**: Select garments from shopping cart → mix & match top + bottom → OpenClaw routes.

**Upload Mode**: Upload a custom garment image → select type (Upper/Lower/Dress) → OpenClaw routes.

**Pipeline Status** (4 steps):
1. Analyzing — preparing images
2. OpenClaw Routing — engineer agent selecting skill
3. AI Rendering — FASHN or Flux Klein processing
4. Complete — result displayed in comparison modal

### 5.3 Global Components

| Component | Location | Function |
|-----------|----------|----------|
| `Navigation` | All pages | Sticky nav, cart/wishlist badges, mobile menu |
| `AIConcierge` | `layout.tsx` (global) | Floating chat button → OpenClaw main agent |
| `TryOnFloat` | Product pages | Slide-in panel for single-product try-on |

### 5.4 State Management

| State | Method | Persistence |
|-------|--------|-------------|
| Cart | React Context (`CartProvider`) | `localStorage` |
| Wishlist | React Context (`WishlistProvider`) | `localStorage` |
| Try-on UI | Component `useState` | Session only |
| AI Chat | Component `useState` + OpenClaw `sessionId` | Session only |

---

## 6. API Routes

### 6.1 `POST /api/try-on`

Virtual try-on endpoint, orchestrated by OpenClaw engineer agent.

**Request Body:**
```typescript
{
  userImage: string          // Base64 data URI (user's full-body photo)
  garmentImage: string       // Base64 data URI or local path (/products/...)
  garmentImage2?: string     // Optional second garment (for full outfit)
  garmentType: 'top' | 'bottom' | 'dress' | 'full_outfit'
  garmentDescription?: string // Product details for engineer prompt optimization
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    rendered_image_url: string   // URL of the generated try-on image
    model_used: string           // "FASHN VTON v1.5" | "Flux Klein 9B"
    skill_used: string           // "fashn-tryon" | "flux-klein-tryon"
    garment_type: string
    routed_by: "OpenClaw Engineer"
  }
}
```

**Routing Logic:**
| Garment Type | Skill | Model | API |
|-------------|-------|-------|-----|
| `top` | `fashn-tryon` | FASHN VTON v1.5 | `api.fashn.ai` |
| `bottom` | `flux-klein-tryon` | Flux Klein 9B | `queue.fal.run` |
| `dress` | `flux-klein-tryon` | Flux Klein 9B | `queue.fal.run` |
| `full_outfit` | `flux-klein-tryon` | Flux Klein 9B | `queue.fal.run` (3 images) |

### 6.2 `POST /api/openclaw/chat`

AI concierge chat endpoint.

**Request Body:**
```typescript
{
  message: string
  agent?: string      // Default: "main"
  sessionId?: string  // For conversation continuity
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    reply: string
    sessionId?: string
    model?: string
    durationMs?: number
  }
}
```

---

## 7. External API Integration

### 7.1 FASHN VTON v1.5

- **Endpoint**: `https://api.fashn.ai/v1/run` (submit), `/v1/status/{id}` (poll)
- **Auth**: `Bearer $FASHN_API_KEY`
- **Category mapping**: top→`tops`, bottom→`bottoms`, dress→`one-pieces`
- **Input**: Accepts base64 data URIs directly
- **Poll interval**: 3 seconds, max 60 seconds
- **Best for**: Upper body garments (texture/logo/pattern preservation)

### 7.2 Flux Klein 9B (fal.ai)

- **Queue submit**: `POST https://queue.fal.run/fal-ai/flux-2-lora-gallery/virtual-tryon`
- **Status poll**: `GET .../requests/{request_id}/status`
- **Result fetch**: `GET .../requests/{request_id}`
- **Auth**: `Key $FAL_KEY`
- **Input**: `image_urls[]` accepts base64 data URIs
- **Key params**: `guidance_scale: 2.5`, `num_inference_steps: 40`, `lora_scale: 1.2`
- **Poll interval**: 3 seconds, max 120 seconds
- **Best for**: Lower body garments, dresses, full outfits (preserves garment length & silhouette)
- **Prompt engineering is critical** — the engineer agent generates optimized prompts including garment length, fit, material

### 7.3 OpenClaw CLI

- **Binary**: `openclaw` (resolved via PATH or `OPENCLAW_BIN` env var)
- **Command**: `openclaw agent --agent <id> --message <text> --json --timeout <seconds>`
- **Gateway**: Local mode, token-based auth
- **Wrapper**: `lib/openclaw.ts` → `callAgent()` using `child_process.execFile`

---

## 8. Data Model

### 8.1 Product

```typescript
interface Product {
  id: string                    // e.g., "wt01", "mb03"
  name: string
  brand: string                 // "LUMIERE" | "LUMIERE SPORT"
  price: number                 // in CNY
  originalPrice?: number        // for SALE items
  category: 'women' | 'men'
  subcategory: string           // "Tops", "Trousers", "Dresses", etc.
  garmentType: GarmentType      // Determines VTON model routing
  colors: { name: string; hex: string }[]
  sizes: string[]
  badge?: 'NEW' | 'SALE' | 'HOT' | 'LIMITED'
  rating: number
  reviewCount: number
  images: string[]              // Local paths: /products/women/top/top01.jpg
  description: string
  details: string[]
  material: string
  inStock: boolean
}

type GarmentType = 'top' | 'bottom' | 'dress' | 'full_outfit'
```

### 8.2 Product Catalog Summary

| Category | Type | Count | Price Range |
|----------|------|-------|-------------|
| Women | Tops | 5 | ¥890 - ¥2,890 |
| Women | Bottoms | 5 | ¥1,590 - ¥2,190 |
| Women | Dresses | 5 | ¥1,890 - ¥3,690 |
| Men | Tops | 5 | ¥890 - ¥2,290 |
| Men | Bottoms | 5 | ¥1,390 - ¥2,490 |
| **Total** | | **27** | **¥890 - ¥3,690** |

---

## 9. Design System

### 9.1 Colors

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#ffffff` | Page background |
| `foreground` | `#050505` | Primary text |
| `accent` | `#8B5CF6` | Brand purple (buttons, highlights, links) |
| `surface` | `#F4F4F5` | Card/section backgrounds |

### 9.2 Typography

| Token | Font |
|-------|------|
| `sans` | Inter (Google Fonts) |
| `display` | Oswald (Google Fonts, CSS var `--font-oswald`) |

### 9.3 Key UI Patterns

- **Pipeline Status Bar**: 4-step progress with animated icons
- **Comparison Modal**: Side-by-side original vs. AI try-on result
- **Route Indicator**: Shows `OpenClaw → skill-name` for transparency
- **Product Mini Cards**: Compact grid selector for cart-based try-on
- **Floating Chat**: Bottom-right AI concierge with session memory

---

## 10. Environment Variables

| Variable | Service | Used By |
|----------|---------|---------|
| `FASHN_API_KEY` | FASHN AI | `/api/try-on` (fashn-tryon skill) |
| `FAL_KEY` | fal.ai | `/api/try-on` (flux-klein-tryon skill) |

OpenClaw agents use their own credentials configured in `~/.openclaw/openclaw.json`:
- Moonshot API key (Kimi K2.5)
- BytePlus API key (DeepSeek V3.2)

---

## 11. Deployment Notes

### Prerequisites

- Node.js 22+
- OpenClaw CLI installed and gateway running (`openclaw daemon start`)
- FASHN API key and fal.ai key configured in `.env.local`
- OpenClaw agents configured (`openclaw agents list` to verify)

### Commands

```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm run start    # Production server
```

### Remote Image Domains (next.config.js)

- `images.unsplash.com` — Hero/placeholder images
- `plus.unsplash.com` — Hero images
- `v3b.fal.media` — Flux Klein rendered results
- `fal.media` — fal.ai CDN

---

## 12. Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **OpenClaw for routing (not hardcoded if/else)** | Engineer agent reads skill definitions to make routing decisions + generates optimized prompts for Flux Klein. Prompt engineering is critical for garment fidelity. |
| **Node.js executes API calls (not shell scripts)** | Base64 image data is already in memory on the server; passing multi-MB data through CLI args is impractical. Node.js handles binary data efficiently. |
| **Fallback routing when OpenClaw unavailable** | Deterministic fallback (top→FASHN, others→Flux) ensures the app works even if the gateway is down. |
| **Base64 data URIs to fal.ai (no CDN upload)** | fal.ai accepts base64 data URIs directly in `image_urls`. Eliminates the need for a separate upload step. |
| **localStorage for cart/wishlist** | Simple, no backend needed for demo. Data persists across page refreshes. |
| **AIConcierge as global component** | Mounted in `layout.tsx`, available on every page for seamless AI assistance. |
