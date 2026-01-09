# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# AIMake - AI 语音内容生成平台

> 用 AI 快速生成播客、有声书、配音、教育内容

## 项目状态

**当前阶段**: 规划期 - 设计文档完成，代码未开始开发
- 只有 `landing-page.html` 和 `docs/` 目录
- 没有 `frontend/`、`api/` 等代码目录

---

## 技术栈

### 前端 (计划)
```
React 18 + TypeScript + Vite + Tailwind CSS + Zustand + React Query
```

### 后端 (计划)
```
Cloudflare Workers + Hono + D1 (SQLite) + R2 (存储) + KV (缓存)
```

### 第三方服务
| 服务 | 用途 | 文档 |
|------|------|------|
| Clerk | 用户认证 | `docs/design/auth-design.md` |
| Stripe | 支付订阅 | `docs/design/payment-integration.md` |
| TTS | 语音合成 | `docs/planning/tts-free-providers.md` |
| LLM | 播客脚本生成 | `docs/planning/llm-asr-providers.md` |
| ASR | 语音识别 | `docs/planning/llm-asr-providers.md` |
| Vercel | 前端托管 | `docs/development/deployment-architecture.md` |

---

## 项目结构 (计划)

```
aimake/
├── frontend/                  # React 前端 (未创建)
│   ├── src/
│   │   ├── components/        # UI 组件
│   │   ├── pages/             # 页面
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── stores/            # Zustand 状态
│   │   ├── services/          # API 调用
│   │   └── i18n/              # 国际化
│   └── package.json
│
├── api/                       # Cloudflare Workers 后端 (未创建)
│   ├── src/
│   │   ├── index.ts           # Hono 入口
│   │   ├── routes/            # API 路由
│   │   ├── middleware/        # 中间件 (auth, rateLimit)
│   │   ├── services/          # 业务逻辑 (TTS, Storage)
│   │   └── db/                # Drizzle ORM
│   └── wrangler.toml
│
├── docs/                      # 📚 设计文档 (已完成)
│   ├── README.md              # 文档索引 (必读)
│   ├── planning/              # 产品规划 (7 个文档)
│   │   ├── product-plan.md
│   │   ├── ai-providers-overview.md      # 🎯 AI 供应商选型总览
│   │   ├── tts-free-providers.md         # TTS 快速接入
│   │   ├── llm-asr-providers.md          # LLM & ASR 快速接入
│   │   └── ...
│   ├── design/                # 技术设计 (14 个文档)
│   └── development/           # 开发运维 (4 个文档)
│
├── landing-page.html          # 静态落地页
├── .env.example               # 环境变量模板
└── README.md
```

---

## 核心设计文档

开发前必须阅读的文档：

| 优先级 | 文档 | 用途 |
|--------|------|------|
| ⭐⭐⭐⭐⭐ | `docs/README.md` | **文档索引** - 完整导航 |
| ⭐⭐⭐⭐⭐ | `docs/planning/ai-providers-overview.md` | **AI 供应商选型** - TTS/LLM/ASR 快速决策 |
| ⭐⭐⭐⭐⭐ | `docs/design/api-design.md` | API 接口定义、TypeScript 类型 |
| ⭐⭐⭐⭐⭐ | `docs/design/database-schema.md` | D1 数据库表结构、Drizzle schema |
| ⭐⭐⭐⭐ | `docs/design/frontend-architecture.md` | 组件结构、Hooks、Store |
| ⭐⭐⭐⭐ | `docs/design/backend-architecture.md` | Hono 路由、中间件、服务层 |
| ⭐⭐⭐⭐ | `docs/design/error-handling.md` | 错误码定义、处理规范 |
| ⭐⭐⭐ | `docs/planning/product-plan.md` | 功能规划、定价策略 |

---

## 开发命令 (未来)

项目开始开发后将使用以下命令：

```bash
# 环境配置
cp .env.example .env           # 复制环境变量模板

# 前端开发
cd frontend
npm install
npm run dev                    # http://localhost:5173
npm run build                  # 生产构建
npm run lint                   # ESLint 检查

# 后端开发
cd api
npm install
npm run dev                    # http://localhost:8787 (wrangler dev)
npm run deploy                 # 部署到 Cloudflare Workers

# 数据库
npx wrangler d1 migrations apply aimake-db  # 应用迁移

# 测试
npm run test                   # Vitest 单元测试
npm run test:e2e               # Playwright E2E 测试
```

---

## AI Coding 参考

### 添加新 API 接口
1. 接口定义 → `docs/design/api-design.md`
2. 数据库表 → `docs/design/database-schema.md`
3. 错误码 → `docs/design/error-handling.md`
4. 路由结构 → `api/src/routes/`

### 添加新页面
1. 页面线框 → `docs/design/pages-design.md`
2. 组件结构 → `docs/design/frontend-architecture.md`
3. UI 规范 → `docs/design/ui-ux-design.md`
4. 页面目录 → `frontend/src/pages/`

### 多语言文案
1. 翻译 Key → `docs/design/i18n-design.md`
2. 翻译文件 → `frontend/src/i18n/locales/`

---

## 约定

### 代码风格
- TypeScript 严格模式
- 函数式组件 + Hooks
- Tailwind CSS 样式
- 错误码使用 `docs/design/error-handling.md` 定义的格式

### 禁止事项
- 不要创建冗余文档 (SETUP.md, CONTRIBUTING.md 等)
- 不要猜测 API URLs
- 不要在代码中硬编码密钥
- 当前是规划期，除非用户明确要求开始开发

---

## 环境变量

完整配置见 `.env.example` 和 `docs/development/env-config.md`

**前端必需**:
```
VITE_API_URL
VITE_CLERK_PUBLISHABLE_KEY
```

**后端必需**:
```
CLERK_SECRET_KEY
STRIPE_SECRET_KEY

# TTS (选一个)
TENCENT_SECRET_ID + TENCENT_SECRET_KEY  # 推荐: 800万字符免费
OPENAI_API_KEY                          # 备选: $15/百万字符

# LLM (播客脚本生成)
LLM_API_KEY                             # 硅基流动: 2000万 tokens 免费
LLM_BASE_URL=https://api.siliconflow.cn/v1
LLM_MODEL=Qwen/Qwen2.5-7B-Instruct
```

详见 `docs/planning/ai-providers-overview.md` 的零成本启动方案。

---

**最后更新**: 2026-01-09
**文档总数**: 25 个设计文档 (planning: 7, design: 14, development: 4)
