# LUMIÈRE ✨

> AI 虚拟试穿时尚电商 — 基于 Next.js 14 + OpenClaw 多智能体编排的 VTON 试穿平台

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://lumiere-tryon.vercel.app/)

LUMIÈRE 是一个将**生成式 AI**引入时尚电商的演示项目。用户上传全身照后,系统会自动渲染换装预览;同时配备 AI 导购(Concierge)和搭配师(Stylist)两个对话智能体,覆盖"浏览 → 搜索 → 收藏 → 购物车 → 试穿"的完整交易闭环。

核心亮点是使用 **OpenClaw 多智能体**编排两套 VTON 模型,而非写死的 if/else 路由 —— 上装走 **FASHN VTON v1.5**(像素级精度,擅长 logo/印花),下装/连衣裙/全身走 **Flux Klein 9B**(语义生成,支持人+上衣+下装三图输入)。

---

## 🌟 核心特性

- **🎨 双模型智能试穿路由** — 由 Engineer 智能体根据商品类型自动选模型,而非硬编码判断
- **🤖 三智能体协作** — Concierge(导购)、Stylist(搭配师)、Engineer(试穿工程师)分工明确、硬隔离
- **💬 浮窗 AI 对话** — 带会话记忆的购物助手,支持多轮上下文与 `[[product_id]]` 商品引用
- **🧩 完整电商闭环** — 商品浏览 / 详情 / 购物车 / 心愿单 / 试穿工作室
- **🛟 三级降级容错** — OpenClaw 网关 → Kimi 直连 → 静态兜底,保证服务可用性
- **📸 照片质检预处理** — `inspect` / `photo_qc` / `enhance` 三动作管线,评估用户照片是否适合试穿

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 3 + Inter / Oswald / Cormorant 字体 |
| 动效 | Framer Motion |
| 部署 | Vercel Serverless(`hkg1` 区域) |

---

## 🔌 API 信息

项目对外暴露 **4 个 Next.js API Route**,并调用 **4 个外部服务**。

### 对内 API Routes

| 方法 | 路径 | 说明 | 超时 |
|------|------|------|------|
| `POST` | `/api/try-on` | 核心试穿接口。入参 `userImage`、`garmentImage`、`garmentType`(`top`/`bottom`/`dress`/`full_outfit`),返回 `rendered_image_url`、`model_used` 等 | 180s |
| `POST` | `/api/openclaw/chat` | AI 对话接口。入参 `message`、可选 `agent`、`sessionId`、`history`,三级降级链返回回复 | 60s |
| `POST` | `/api/openclaw/tryon` | 试穿预处理。按 `action`(`inspect` / `photo_qc` / `enhance`)做照片质检与增强 | — |

**`/api/try-on` 请求 / 响应示例:**

```jsonc
// Request
{ "userImage": "data:image/...", "garmentImage": "data:image/...", "garmentType": "top" }

// Response (200)
{
  "success": true,
  "data": {
    "rendered_image_url": "https://...",
    "model_used": "FASHN VTON v1.5",
    "garment_type": "top",
    "category": "tops"
  }
}
```

### 外部服务调用

| 服务 | 用途 | 端点 | 鉴权 | 调用方式 |
|------|------|------|------|----------|
| **FASHN VTON v1.5** | 上装试穿 | `POST https://api.fashn.ai/v1/run` + 轮询 `GET /v1/status/{jobId}` | `Bearer FASHN_API_KEY` | 异步队列,最多轮询 18 次 ×3s |
| **Flux Klein 9B (fal.ai)** | 下装/裙装/全身试穿 | `https://queue.fal.run/...` | `FAL_KEY` | 异步队列,120s,直传 base64 |
| **OpenClaw Gateway** | 多智能体编排 | `POST {OPENCLAW_GATEWAY_URL}/v1/chat/completions` | `Bearer OPENCLAW_GATEWAY_TOKEN` + `x-openclaw-agent-id` 头 | OpenAI 兼容协议 |
| **Moonshot Kimi** | 直连兜底对话 | `POST https://api.moonshot.ai/v1/chat/completions` | `Bearer MOONSHOT_API_KEY` | OpenAI 兼容协议,`kimi-k2.5` |

### 智能体模型矩阵

| 智能体 | 模型 | 供应商 | 职责 |
|--------|------|--------|------|
| Main / Concierge | Kimi K2.5 | Moonshot | 用户交互、通用问答 |
| Stylist | Kimi K2.5 | Moonshot | 搭配建议、色彩理论 |
| Engineer | DeepSeek V3.2 | BytePlus ModelArk | 试穿路由决策、提示词工程 |

---

## 📁 项目结构

```
lumiere/
├── app/
│   ├── api/
│   │   ├── try-on/route.ts          # 核心试穿接口 → FASHN
│   │   └── openclaw/
│   │       ├── chat/route.ts        # AI 对话(三级降级)
│   │       └── tryon/route.ts        # 照片质检预处理
│   ├── page.tsx                     # 首页
│   ├── products/[id]/page.tsx       # 商品详情
│   ├── try-on/page.tsx              # 试穿工作室
│   ├── cart/page.tsx                # 购物车
│   └── wishlist/page.tsx           # 心愿单
├── components/                      # AIConcierge / ProductCard / Navigation 等
├── lib/
│   ├── data.ts                      # 商品数据(27 个 SKU)
│   ├── openclaw-http.ts             # OpenClaw Gateway 客户端
│   ├── kimi.ts                      # Moonshot 直连客户端
│   └── *-context.tsx                # 购物车 / 心愿单( localStorage )
├── public/products/                 # 商品图(按性别/品类组织)
├── docs/LUMIE_RE_AI.md              # AI 设计文档
├── ARCHITECTURE.md                  # 架构文档
└── vercel.json
```

---

## 🚀 本地运行

### 1. 安装依赖

```bash
git clone https://github.com/hattie0923/lumiere.git
cd lumiere
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local`:

```bash
# FASHN 试穿(上装)
FASHN_API_KEY=your_fashn_key

# fal.ai 试穿(下装/裙装/全身)
FAL_KEY=your_fal_key

# Moonshot Kimi(对话直连兜底)
MOONSHOT_API_KEY=your_moonshot_key

# OpenClaw Gateway(多智能体编排)
OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
OPENCLAW_GATEWAY_TOKEN=your_gateway_token
```

> OpenClaw 智能体凭据(Moonshot、BytePlus)单独配置在 `~/.openclaw/openclaw.json`。

### 3. 启动开发服务器

```bash
npm run dev
# 打开 http://localhost:3000
```

### 4. 构建

```bash
npm run build && npm start
```

---

## 📐 架构设计要点

- **为何用 OpenClaw 而非硬编码路由** — Engineer 智能体执行的是**提示词优化**,而不仅是 if/else;它读取技能定义后返回 JSON 路由决策
- **为何 API 调用在 Node.js 而非 shell** — 多 MB 的 base64 图像数据已在内存中,通过 CLI 参数传递不现实
- **为何 base64 直传 fal.ai** — 省去单独的 CDN 上传步骤
- **为何三级降级** — OpenClaw 是本地/隧道服务,可能不可用;Kimi 直连作为轻量兜底,最后是静态提示
- **Vercel `maxDuration`** — try-on 设为 180s(Vercel Pro 上限),chat 设为 60s

---

## 📊 模型选型评估

项目对 5 个 VTON 模型在 10 个维度(面部一致性、背景/手部保留、分辨率、上/下/裙装保真、姿态鲁棒性、头发遮挡、延迟、价格)上做了基准测试:

- **FASHN VTON v1.5** — 37/50,综合最优(上装首选)
- **Flux-2** — 34/50(次优)

**已知限制:** FASHN 训练数据排除了泳装/内衣;配饰(珠宝/围巾/帽子)因位置材质多变需特殊处理;鞋类不支持(需多角度视图)。

---

## 📄 文档

- [ARCHITECTURE.md](./ARCHITECTURE.md) — 系统架构详解
- [docs/LUMIE_RE_AI.md](./docs/LUMIE_RE_AI.md) — AI 功能与模型选型设计文档

---

## 📝 License

MIT
