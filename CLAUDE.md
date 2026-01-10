# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

---

# AIMake - AI 语音内容生成平台

> 用 AI 快速生成播客、有声书、配音、教育内容

## 项目状态

**当前阶段**: 规划期 - 设计文档完成,代码未开始开发

- ✅ 完整的设计文档体系 (26 个文档)
- ✅ Website (`website/`)
- ✅ 项目配置��件 (ESLint, Prettier, wrangler.toml)
- ⏳ 前端 React 应用 (待创建 `frontend/`)
- ⏳ 后端 Cloudflare Workers (待创建 `api/`)

---

## 技术栈

### 前端

```
React 18 + TypeScript + Vite + Tailwind CSS + Zustand + React Query
```

### 后端

```
Cloudflare Workers + Hono + D1 (SQLite) + R2 (存储) + KV (缓存)
```

### 第三方服务

| 服务               | 用途         | 免费额度/成本         | 文档                                          |
| ------------------ | ------------ | --------------------- | --------------------------------------------- |
| 腾讯云 TTS         | 语音合成     | 800 万字符免费 (3 年) | `docs/planning/tts-free-providers.md`         |
| 硅基流动 LLM       | 播客脚本生成 | 2000 万 tokens 免费   | `docs/planning/llm-asr-providers.md`          |
| Clerk              | 用户认证     | 5,000 月活用户免费    | `docs/design/auth-design.md`                  |
| Stripe             | 支付订阅     | 按交易抽成            | `docs/design/payment-integration.md`          |
| Cloudflare Pages   | 前端托管     | 无限请求免费          | `docs/development/deployment-architecture.md` |
| Cloudflare Workers | 后端运行时   | 100,000 请求/天免费   | `docs/development/deployment-architecture.md` |

**零成本启动**: 详见 `docs/planning/ai-providers-overview.md`

---

## 项目结构

```
aimake/
├── docs/                      # 📚 设计文档 (26 个)
│   ├── README.md              # 文档索引 (必读)
│   ├── planning/              # 产品规划 (7 个)
│   │   ├── product-plan.md
│   │   ├── ai-providers-overview.md      # 🎯 AI 供应商选型总览
│   │   ├── tts-free-providers.md         # TTS 快速接入
│   │   └── llm-asr-providers.md          # LLM & ASR 快速接入
│   ├── design/                # 技术设计 (15 个)
│   │   ├── api-design.md               # API 接口定义、TypeScript 类型
│   │   ├── database-schema.md          # D1 数据库表结构、Drizzle schema
│   │   ├── backend-architecture.md     # Hono 路由、中间件、服务层
│   │   ├── frontend-architecture.md    # 组件结构、Hooks、Store
│   │   ├── auth-design.md              # Clerk 集成、JWT 验证
│   │   ├── payment-integration.md      # Stripe Checkout、订阅管理
│   │   └── error-handling.md           # 错误码定义、处理规范
│   └── development/           # 开发运维 (4 个)
│       ├── env-config.md               # 环境变量完整清单
│       ├── automation-plan.md          # AI 工具矩阵、测试自动化
│       ├── deployment-architecture.md  # Vercel + Cloudflare 部署
│       └── release-verification.md     # 上线验证清单
│
├── website/                   # Landing Page (已完成)
│   ├── index.html
│   ├── assets/
│   └── README.md
│
├── scripts/                   # ���具脚本
│   └── generate-demo-audio.py # Python 音频生成脚本
│
├── .env.example               # 环境变量模板
├── wrangler.toml              # Cloudflare 配置
├── package.json               # 根 package.json (代码质量工具)
└── README.md
```

**待创建目录**:

- `frontend/` - React 前端应用
- `api/` - Cloudflare Workers 后端

---

## 核心设计文档

开发前必读的优先级文档:

| 优先级     | 文档                                     | 关键内容                                      |
| ---------- | ---------------------------------------- | --------------------------------------------- |
| ⭐⭐⭐⭐⭐ | `docs/README.md`                         | **文档索引** - 完整导航                       |
| ⭐⭐⭐⭐⭐ | `docs/planning/ai-providers-overview.md` | **AI 供应商选型** - TTS/LLM/ASR 快速决策表    |
| ⭐⭐⭐⭐⭐ | `docs/design/api-design.md`              | **RESTful 接口** - 路由定义、TypeScript 类型  |
| ⭐⭐⭐⭐⭐ | `docs/design/database-schema.md`         | **D1 数据库** - ER 图、表结构、Drizzle schema |
| ⭐⭐⭐⭐   | `docs/design/backend-architecture.md`    | Hono 中间件链、服务层、Bindings               |
| ⭐⭐⭐⭐   | `docs/design/frontend-architecture.md`   | 组件设计、Hooks 模式、Zustand Store 结构      |
| ⭐⭐⭐⭐   | `docs/design/error-handling.md`          | 错误码定义 (`ERR_TTS_XXX`)、处理规范          |
| ⭐⭐⭐⭐   | `docs/development/env-config.md`         | **环境变量** - 前后端完整配置清单             |
| ⭐⭐⭐     | `docs/planning/product-plan.md`          | 功能规划、定价策略、MVP 范围                  |

---

## 开发命令

### 当前可用 (根目录)

```bash
# 代码质量检查
npm run lint              # ESLint + Stylelint + Markdownlint
npm run lint:js           # 仅 ESLint (website/**/*.js)
npm run lint:css          # 仅 Stylelint (website/**/*.css)
npm run lint:md           # 仅 Markdownlint
npm run format            # Prettier 格式化
npm run format:check      # Prettier 检查

# 部署 Landing Page
npx wrangler pages publish landing  # 发布到 Cloudflare Pages
```

### 前端开发 (frontend/ 目录,待创建)

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
npm run build              # 生产构建
npm run preview            # 预览构建产物
npm run lint               # ESLint + TypeScript 检查
```

### 后端开发 (api/ 目录,待创建)

```bash
cd api
npm install
npm run dev                # http://localhost:8787 (wrangler dev)
npm run deploy             # 部署到 Cloudflare Workers

# 数据库迁移
npx wrangler d1 migrations apply aimake-db --local
npx wrangler d1 migrations apply aimake-db       # 生产环境
```

### 测试 (待配置)

```bash
npm run test               # Vitest 单元测试
npm run test:e2e           # Playwright E2E 测试
npm run test:coverage      # 测试覆盖率
```

---

## 架构概览

### 后端架构 (Hono + Cloudflare Workers)

```
请求 → Middleware → Routes → Services → Bindings
       [认证/限流]   [路由]   [业务逻辑]  [D1/R2/KV]
```

**关键设计**:

- **Middleware 链**: `auth.ts` → `rateLimit.ts` → `logger.ts` → `errorHandler.ts`
- **服务层**: `tts.ts` (TTS 生成) / `podcast.ts` (LLM 脚本 + TTS) / `storage.ts` (R2 上传)
- **数据库**: Drizzle ORM, D1 (SQLite), 表结构见 `database-schema.md`
- **错误处理**: 统一格式 `{ code: "ERR_TTS_XXX", message: "...", details: {...} }`

### 前端架构 (React + Zustand)

```
Pages → Components → Hooks → Stores → Services
       [UI 层]     [逻辑]  [状态]   [API 调用]
```

**关键设计**:

- **状态管理**: Zustand stores (`authStore`, `audioStore`, `uiStore`)
- **数据请求**: React Query (`useQuery` / `useMutation`)
- **组件结构**: `components/ui/` (基础) / `components/audio/` (音频) / `components/layout/` (布局)
- **API 调用**: 统一 axios 实例,自动注入 Clerk JWT token

### 数据流 (TTS 生成示例)

```
用户输入文本
  → 前端: TTSForm 组件
  → API: POST /api/tts
  → Middleware: auth (验证 JWT) + rateLimit (检查额度)
  → Service: TTSService.generateText()
  → External: 腾讯云 TTS API
  → Storage: R2 上传音频文件
  → Database: 保存 audio 记录 (D1)
  → Response: 返回音频 URL
  → 前端: AudioPlayer 播放
```

---

## AI Coding 参考指南

### 添加新 API 接口

**参考文档顺序**:

1. `api-design.md` - 定义路由路径、请求/响应类型
2. `database-schema.md` - 确认相关表结构
3. `error-handling.md` - 选择错误码 (`ERR_XXX_YYY`)
4. `backend-architecture.md` - 理解中间件和服务层模式

**代码位置**:

- 路由: `api/src/routes/`
- 服务: `api/src/services/`
- 类型定义: `api/src/types/`

### 添加新页面

**参考文档顺序**:

1. `pages-design.md` - 查看页面线框图
2. `frontend-architecture.md` - 理解组件结构
3. `ui-ux-design.md` - 遵循 UI 规范
4. `i18n-design.md` - 添加多语言 Key (如需)

**代码位置**:

- 页面组件: `frontend/src/pages/`
- 可复用组件: `frontend/src/components/`
- 路由配置: `frontend/src/App.tsx`

### 多语言文案

1. 添加翻译 Key 到 `frontend/src/i18n/locales/zh-CN.json`
2. 同步到 `en.json`
3. 组件中使用 `useTranslation()` hook

详见 `i18n-design.md`

### 数据库变更

1. 更新 `docs/design/database-schema.md` 的表结构
2. 生成 Drizzle migration: `npx drizzle-kit generate`
3. 应用迁移: `npx wrangler d1 migrations apply aimake-db`

---

## 环境变量配置

### 必需环境变量

**前端 (frontend/.env.local)**:

```
VITE_API_URL=http://localhost:8787/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

**后端 (wrangler secret put)**:

```
CLERK_SECRET_KEY=sk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# TTS (选一个)
TENCENT_SECRET_ID=xxx
TENCENT_SECRET_KEY=xxx

# LLM (播客脚本生成)
LLM_API_KEY=sk-xxx          # 硅基流动
LLM_BASE_URL=https://api.siliconflow.cn/v1
LLM_MODEL=Qwen/Qwen2.5-7B-Instruct
```

完整清单见 `docs/development/env-config.md` 和 `.env.example`

### 密钥管理

```bash
# Cloudflare Workers Secrets (后端)
npx wrangler secret put CLERK_SECRET_KEY
npx wrangler secret put TENCENT_SECRET_ID

# 本地开发使用 .dev.vars (不要提交到 Git)
cp .env.example .dev.vars
```

---

## 代码规范

### TypeScript

- 严格模式 (`strict: true`)
- 优先使用 `interface` over `type`
- 函数组件 + Hooks (禁止 Class 组件)
- 避免使用 `any`, 使用 `unknown` 或具体类型

### 样式

- Tailwind CSS 工具类优先
- 响应式设计: `sm:`, `md:`, `lg:`, `xl:` 断点
- 禁止内联样式 (除非动态计算值)

### 错误处理

- 使用 `docs/design/error-handling.md` 定义的错误码
- 前端: Error Boundary + Toast 提示
- 后端: 统一错误响应格式

---

## 禁止事项

- ❌ 不要创建冗余文档 (SETUP.md, CONTRIBUTING.md 等)
- ❌ 不要猜测 API URLs,所有接口必须在 `api-design.md` 中定义
- ❌ 不要硬编码密钥 (使用环境变量)
- ❌ 不要跳过错误处理
- ❌ 当前是规划期,除非用户明确要求开始开发

---

## 常见开发场景

| 任务                | 参考文档                                                 |
| ------------------- | -------------------------------------------------------- |
| 集成新的 TTS 供应商 | `tts-free-providers.md` → `backend-architecture.md`      |
| 添加新的播客模板    | `prompt-engineering.md` → `api-design.md`                |
| 修改定价策略        | `product-plan.md` → `payment-integration.md`             |
| 添加新的音色        | `database-schema.md` (voices 表)                         |
| 配置新的环境变量    | `env-config.md`                                          |
| 写测试              | `automation-plan.md`                                     |
| 部署到生产环境      | `deployment-architecture.md` → `release-verification.md` |

---

**最后更新**: 2026-01-10 **文档总数**: 26 个设计文档 (planning: 7, design: 15, development: 4)
