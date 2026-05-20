# LUMIÈRE AI

> **版本:** v1.0 | **更新日期:** 2026-03-11
>
> **公网地址:** https://lumiere-tryon.vercel.app/
>
> **技术栈:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion，部署在 Vercel

## 一、产品概述

LUMIÈRE 是一款 AI 驱动的时尚电商平台，核心卖点是 **AI 虚拟试穿**。用户可以上传自己的全身照片，系统通过 OpenClaw 多智能体协同 + 双 VTON 模型自动选择，实时渲染试穿效果。

### 核心能力

| **能力** | **技术实现** | **用户价值** |
|---|---|---|
| **AI 虚拟试穿** | FASHN VTON v1.5 + Flux Klein 9B | 上传照片即可看到穿搭效果 |
| **智能路由** | OpenClaw Engineer Agent | 自动选择最优模型，用户无需了解技术 |
| **AI 导购与顾问** | OpenClaw Agent | 全站浮窗随时咨询，产品推荐 |
| **电商全流程** | Next.js + React Context | 包含浏览、搜索、收藏、购物车、试穿的完整交易闭环 |

## 二、系统架构与数据总览

![系统架构图](media/image1.jpeg)

## 三、Agent 技能矩阵与模型选型

系统采用了异构大模型策略，根据任务复杂度分配最佳模型，以平衡成本与效果。

### 3.1 核心大模型配置

| **Model** | **作用** | **应用** |
|---|---|---|
| **DeepSeek v3.2** | 逻辑明确的简单任务 | Engineer Agent 负责的路由决策 |
| **Kimi-2.5** | 复杂语境理解 | 作为 Main Agent 和 Stylist Agent 的基础模型，负责用户交互和搭配建议 |
| **FASHN** | 虚拟试穿渲染 | 专注于上装 |
| **Flux-2** | 虚拟生成 | 专注于下装、裙装及套装 |

### 3.2 Agent 和 Skill 矩阵

![Agent和Skill矩阵](media/image2.png)

**点击图片可查看完整电子表格**

> **note：** 当前架构实现了硬隔离。main 仅注册视觉质检 (pose-analyzer) 与路由分发 (tryon-router) 等前置技能。面对用户的试穿诉求，main 只能输出标准的 JSON 协议将任务移交。engineer 则作为"无状态的执行车间"，接管具体的 VTON API 权限，它无需处理冗长的用户聊天上下文，专注且极致地完成单次渲染任务。

## 四、虚拟试穿工作流

### 4.1 双模型策略

| **场景** | **路由到** | **模型** | **原因** |
|---|---|---|---|
| **上装 (top)** | fashn-tryon | FASHN VTON v1.5 | 像素级精确，logo/印花保真度最高 |
| **下装 (bottom)** | flux-klein-tryon | Flux Klein 9B | 语义生成，保留裤长/裙长/轮廓 |
| **连衣裙 (dress)** | flux-klein-tryon | Flux Klein 9B | 需要全身生成 |
| **上+下组合 (full_outfit)** | flux-klein-tryon | Flux Klein 9B | 原生支持 3 图输入 (人+上+下) |

### 4.2 完整试穿流程

![完整试穿流程](media/image3.jpeg)

### 4.3 模型评测标准

#### 维度一：图像生成质量

**面容一致性 (Facial Identity Preservation)**：生成后的照片，脸和原图是否一模一样？

**人体背景保留 (Background & Hand Preservation)**：
- 放到身侧、叉腰或挡在胸前的手指有没有变成"6根手指"或者被直接切掉？
- 复杂的背景有没有因为换衣服而扭曲（Warping）模糊？

**分辨率与清晰度 (Output Resolution)**：最终给前端页面的图模糊吗？能看清衣服细节吗？

#### 维度二：衣物还原度与变形率

**上衣 (Tops - 测试重点：褶皱与版型)**：
- **测试点**：模型能不能识别出"松垮衣物"自带的空间感？当换上一件极具设计感的上衣（比如带大Logo或条纹），Logo 会不会拉伸变形？

**裤子 (Bottoms - 测试重点：腰线与接缝)**：
- **测试点**：高腰裤和低腰裤的衔接。原图是穿裙子，换成裤装时，两条腿的轮廓剥离效果自不自然？

**裙子 (Dresses - 测试重点：连贯性与布料下垂)**：
- **测试点**：大面积布料（比如丝绸）的下垂感（Draping）真实吗？光影和高光有没有正确打在布料上？

#### 维度三：极端 Case 适应性

**姿态与角度稳健性 (Pose Robustness)**：
- 用"45度严重俯视"图片测试，衣服的上半部分应该会有强烈的透视收缩
- 用"侧身 90 度"测试，能不能正确呈现出衣服的侧面剪裁？

**发型遮挡处理 (Hair Occlusion)**：
- 用"披发"照片试试。高质量的模型应该让衣服穿在头发的**下面**（或者让头发自然垂在衣服上），而劣质模型可能会一刀切掉那把头发。

#### 维度四：工程与商业化落地

**API 响应耗时 (Latency/Speed)**：
- 测试单次请求（图片上传 -> 服务器响应完图片链接）需要几秒？

**商业落地成本 (API Pricing)**：
- 每生成一张照片要大约多少钱？

#### 评分表

| **Model** | **面容一致性** | **人体背景保留** | **分辨率与清晰度** | **Tops** | **Bottoms** | **Dresses** | **Pose Robustness** | **Hair Occlusion** | **Latency** | **Pricing** | **Total Score /50** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Seedream** | 1 (画面横纵向拉伸) | 4 | 5 (2k) | 1 | 1 (拖地裤边8分裤) | 1 | 4 | 3 | 2 (29s) | 3 | 23 |
| **FASHN VTON** | 5 | 5 | 3 | 4 | 2 | 3 | 5 | 4 | 4 | 2 | 37 |
| **IDM-VTON** | 1 | 5 | 5 | 4 | 4 | 4 | | | | | |
| **Flux-2** | 3 | 5 | 5 | 4 | 4 | 4 | 2 | 2 | 3 | 4 | 34 |
| **OOTDiffusion** | 5 | 4 | 3 | 3 | 2 | 3 | 3 | 3 | 3 | 1 | 27 |

### 4.4 模型边界限制

评测发现，市面上模型大多面向B端商家，模特图对应纯色背景的商品图，output贴合度高。而C端用户的input是商品图和图片质量不可控的自身图，对模型能力要求高，尤其是裤子，模型很难按照裤子版型贴合用户身体。

FASHN 支持上衣、下装、连衣裙和外套，但**泳装和内衣被排除在训练数据之外**。

饰品（珠宝、围巾、帽子）需要不同的渲染技术，因为它们的位置和材质各异。鞋子不被支持，因为鞋子需要多角度视图，而衣服只需一张参考图即可。

## 五、技术栈详情

### 5.1 前端

| 技术 | 版本 | 用途 |
|---|---|---|
| Next.js | 14.2.x | App Router, SSR/SSG, API Routes |
| React | 18.3.x | UI 组件 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.4.x | 原子化样式 |
| Framer Motion | 11.3.x | 动画 (页面过渡/hover/弹窗) |
| Lucide React | 0.400.x | 图标 |
| clsx | 2.1.x | 条件 className |

### 5.2 AI 模型

| 模型 | 提供商 | 用途 | 调用方式 |
|---|---|---|---|
| Kimi K2.5 | Moonshot | Concierge + Stylist Agent | OpenClaw CLI → Moonshot API |
| DeepSeek V3.2 | BytePlus ModelArk | Engineer Agent (路由决策) | OpenClaw CLI → BytePlus API |
| FASHN VTON v1.5 | FASHN AI | 上装虚拟试穿 | REST API (异步队列) |
| Flux Klein 9B | fal.ai | 下装/裙/套装虚拟试穿 | REST API (异步队列) |

### 5.3 部署

| 组件 | 平台 | 配置 |
|---|---|---|
| 前端 + API Routes | Vercel (Hobby, 免费) | 区域: hkg1 (香港) |
| try-on API | Vercel Serverless | maxDuration: 180s |
| chat API | Vercel Serverless | maxDuration: 60s |

## 六、用户操作流程 (End-to-End)

### 流程 A: 浏览购买 + 试穿

![浏览购买+试穿流程](media/image4.jpeg)

### 流程 B: Virtual Studio 完整试穿

![Virtual Studio完整试穿流程](media/image5.jpeg)

### 流程 C: AI 导购咨询

![AI导购咨询流程](media/image6.jpeg)

## 十二、设计规范

| 元素 | 值 |
|---|---|
| 主色 (Accent) | `#8B5CF6` (紫色) |
| 背景色 | `#FFFFFF` (白色) |
| 前景色 | `#1a1a1a` |
| 展示字体 | Oswald (大标题, 全大写) |
| 正文字体 | Inter |
| 等宽字体 | System monospace (技术标签) |
| 卡片阴影 | `0 2px 20px rgba(0,0,0,0.06)` |
| 圆角 | 按钮: 0 / 卡片: sm-xl / 聊天: 2xl |
| 动画库 | Framer Motion |
