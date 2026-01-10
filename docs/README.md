# AIMake 设计文档索引

> AI 语音内容生成平台 - 完整技术文档
>
> 最后更新: 2026-01-09

---

## 快速导航

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AIMake 开发全流程                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │ 产品规划  │ → │ 技术设计  │ → │ 开发实施  │ → │ 测试验证  │ → │ 部署上线  │  │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘  │
│       ↓              ↓              ↓              ↓              ↓         │
│  product-plan   api-design    automation-    release-      deployment-     │
│                 database      plan          verification  architecture     │
│                 frontend                                                    │
│                 auth/payment                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 一、产品与规划

开始开发前必读，了解产品定位和方向。

| 文档                                                                            | 说明                                                        | 适合谁看       |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------- |
| [product-plan.md](./planning/product-plan.md)                                   | 产品定位、目标用户、功能规划、定价策略、开发计划            | PM、全员       |
| [content-generation-directions.md](./planning/content-generation-directions.md) | 内容类型探索、用户群体分析、竞品参考                        | PM、产品       |
| **[ai-providers-overview.md](./planning/ai-providers-overview.md)**             | **🎯 AI 供应商选型总览** - TTS/LLM/ASR 快速决策表、成本估算 | **后端、架构** |
| [tts-free-providers.md](./planning/tts-free-providers.md)                       | TTS 免费供应商快速接入、代码示例                            | 后端           |
| [tts-providers-comparison.md](./planning/tts-providers-comparison.md)           | TTS 供应商深度对比、多供应商架构策略                        | 后端、架构     |
| [llm-asr-providers.md](./planning/llm-asr-providers.md)                         | LLM & ASR 供应商快速接入、免费额度、成本估算                | 后端、架构     |

**AI Coding 提示**: 开发新功能前，先查阅 `product-plan.md` 确认功能优先级和需求描述。

---

## 二、技术设计

核心技术文档，开发时的主要参考。

### 2.1 系统设计

| 文档                                              | 说明                                      | 包含内容                   |
| ------------------------------------------------- | ----------------------------------------- | -------------------------- |
| [design-research.md](./design/design-research.md) | **设计总览** - 系统架构、流程图、技术选型 | 架构图、用户旅程、TTS 流程 |

### 2.2 后端设计

| 文档                                                        | 说明             | 包含内容                                         |
| ----------------------------------------------------------- | ---------------- | ------------------------------------------------ |
| [backend-architecture.md](./design/backend-architecture.md) | **后端架构**     | 项目结构、中间件、服务层、Bindings               |
| [api-design.md](./design/api-design.md)                     | **API 接口设计** | RESTful 接口定义、TypeScript 类型、Hono 路由示例 |
| [database-schema.md](./design/database-schema.md)           | **数据库设计**   | ER 图、表结构、SQL、索引、查询示例               |
| [auth-design.md](./design/auth-design.md)                   | **登录鉴权**     | Clerk 集成、JWT 验证、Webhook 同步               |
| [payment-integration.md](./design/payment-integration.md)   | **支付集成**     | Stripe Checkout、订阅管理、Webhook 处理          |
| [prompt-engineering.md](./design/prompt-engineering.md)     | **Prompt 工程**  | 播客生成 Prompt 模板、LLM 调用流程               |
| [error-handling.md](./design/error-handling.md)             | **错误处理**     | 错误码定义、中间件、前后端处理规范               |

**AI Coding 提示**:

- 开发 API 时参考 `api-design.md` 的接口定义和类型
- 数据库操作参考 `database-schema.md` 的表结构
- 错误处理统一使用 `error-handling.md` 的错误码

### 2.3 前端设计

| 文档                                                          | 说明                | 包含内容                                      |
| ------------------------------------------------------------- | ------------------- | --------------------------------------------- |
| [frontend-architecture.md](./design/frontend-architecture.md) | **前端架构**        | 项目结构、组件设计、Hooks、状态管理、API 调用 |
| [ui-ux-design.md](./design/ui-ux-design.md)                   | **UI/UX 设计**      | 色彩、字体、组件规范、页面布局、交互规范      |
| [pages-design.md](./design/pages-design.md)                   | **页面设计**        | 所有页面线框图、认证页、设置页、错误页        |
| [landing-page-design.md](./design/landing-page-design.md)     | **主页设计**        | Landing Page 结构、响应式、FAQ、社会证明      |
| [i18n-design.md](./design/i18n-design.md)                     | **国际化**          | 多语言支持、react-i18next 配置、翻译文件      |
| [seo-analytics.md](./design/seo-analytics.md)                 | **SEO 与分析**      | Meta 标签、结构化数据、事件埋点、A/B 测试     |
| [figma-integration.md](./design/figma-integration.md)         | **Figma 集成**      | Figma MCP、v0.dev、设计转代码工作流           |
| [user-guide-pages.md](./design/user-guide-pages.md)           | **用户导向页面**    | 功能介绍、教程、帮助中心、定价、用例          |
| [brand-identity.md](./design/brand-identity.md)               | **品牌视觉识别**    | Logo 规范、配色系统、字体系统、资源生成       |
| [app-design.md](./design/app-design.md)                       | **移动端 APP 设计** | Flutter 架构、技术选型、UI/UX、开发计划       |

**AI Coding 提示**:

- 新建组件参考 `frontend-architecture.md` 的组件结构
- 页面布局参考 `pages-design.md` 的线框图
- 用户导向页面参考 `user-guide-pages.md` 的结构
- 多语言文案使用 `i18n-design.md` 的翻译 Key

---

## 三、开发与运维

开发环境搭建、自动化工具、部署配置。

| 文档                                                                   | 说明           | 包含内容                               |
| ---------------------------------------------------------------------- | -------------- | -------------------------------------- |
| [env-config.md](./development/env-config.md)                           | **环境配置**   | 环境变量清单、密钥管理、本地开发设置   |
| [automation-plan.md](./development/automation-plan.md)                 | **自动化开发** | AI 工具矩阵、MCP 配置、测试自动化      |
| [deployment-architecture.md](./development/deployment-architecture.md) | **部署架构**   | Vercel + Cloudflare、CI/CD、监控告警   |
| [release-verification.md](./development/release-verification.md)       | **上线验证**   | 冒烟测试、回归测试、发布流程、回滚脚本 |

**AI Coding 提示**:

- 配置环境变量参考 `env-config.md`
- 写测试参考 `automation-plan.md` 的测试模板
- 部署前检查 `release-verification.md` 的清单

---

## 四、技术栈速查

### 前端

```
React 18 + TypeScript + Vite + Tailwind CSS + Zustand
```

| 技术         | 用途     | 文档                       |
| ------------ | -------- | -------------------------- |
| React 18     | UI 框架  | frontend-architecture.md   |
| TypeScript   | 类型安全 | api-design.md (类型定义)   |
| Vite         | 构建工具 | deployment-architecture.md |
| Tailwind CSS | 样式     | frontend-architecture.md   |
| Zustand      | 状态管理 | frontend-architecture.md   |
| React Query  | 数据请求 | frontend-architecture.md   |
| Clerk        | 认证     | auth-design.md             |

### 后端

```
Cloudflare Workers + Hono + D1 + R2
```

| 技术               | 用途     | 文档                       |
| ------------------ | -------- | -------------------------- |
| Cloudflare Workers | 运行时   | deployment-architecture.md |
| Hono               | Web 框架 | api-design.md              |
| D1                 | 数据库   | database-schema.md         |
| R2                 | 对象存储 | deployment-architecture.md |
| Clerk              | 认证验证 | auth-design.md             |
| Stripe             | 支付     | payment-integration.md     |

### 外部服务

| 服务       | 用途     | 文档                        |
| ---------- | -------- | --------------------------- |
| OpenAI TTS | 语音合成 | tts-providers-comparison.md |
| Clerk      | 用户认证 | auth-design.md              |
| Stripe     | 支付订阅 | payment-integration.md      |
| Vercel     | 前端托管 | deployment-architecture.md  |
| Sentry     | 错误监控 | error-handling.md           |

---

## 五、开发流程

### 5.1 新功能开发

```
1. 查阅 product-plan.md 确认需求
2. 参考 api-design.md 设计接口
3. 参考 database-schema.md 设计数据表
4. 参考 frontend-architecture.md 设计组件
5. 参考 error-handling.md 处理错误
6. 参考 automation-plan.md 编写测试
7. 参考 release-verification.md 验证上线
```

### 5.2 Bug 修复

```
1. 查看 Sentry 错误详情
2. 参考 error-handling.md 理解错误码
3. 修复并添加测试
4. 参考 release-verification.md 验证
```

### 5.3 新成员入职

```
必读顺序:
1. README.md (本文档)
2. product-plan.md (产品理解)
3. design-research.md (架构理解)
4. env-config.md (环境搭建)
5. 对应模块的技术文档
```

---

## 六、AI Coding 指南

### 6.1 Claude/Cursor 使用提示

```markdown
在开发 AIMake 时，请参考以下文档:

## 后端开发

- API 接口: docs/api-design.md
- 数据库: docs/database-schema.md
- 认证: docs/auth-design.md
- 支付: docs/payment-integration.md
- 错误处理: docs/error-handling.md

## 前端开发

- 组件架构: docs/frontend-architecture.md
- API 调用: docs/api-design.md (前端部分)

## 规范

- 错误码使用 error-handling.md 定义的格式
- 环境变量参考 env-config.md
- 测试参考 automation-plan.md
```

### 6.2 常见开发场景

| 场景            | 参考文档                                               |
| --------------- | ------------------------------------------------------ |
| 添加新 API 接口 | api-design.md → database-schema.md → error-handling.md |
| 添加新页面      | frontend-architecture.md → api-design.md               |
| 添加新音色      | database-schema.md (voices 表)                         |
| 处理支付        | payment-integration.md                                 |
| 添加新错误类型  | error-handling.md                                      |
| 配置新环境变量  | env-config.md                                          |
| 写测试          | automation-plan.md                                     |
| 部署上线        | deployment-architecture.md → release-verification.md   |

### 6.3 代码生成提示模板

**生成 API 路由:**

```
参考 docs/api-design.md 的路由结构，为 [功能] 创建 API 路由。
使用 docs/error-handling.md 的错误处理规范。
数据库操作参考 docs/database-schema.md。
```

**生成 React 组件:**

```
参考 docs/frontend-architecture.md 的组件结构，创建 [组件名] 组件。
使用文档中定义的 Hooks 模式和 Store 结构。
```

**生成测试:**

```
参考 docs/automation-plan.md 的测试模板，为 [模块] 编写测试。
单元测试使用 Vitest，E2E 使用 Playwright。
```

---

## 七、文档维护

### 更新原则

1. **代码变更同步更新文档** - 接口变更必须更新 api-design.md
2. **新功能先写文档** - 设计文档先行，代码实现跟进
3. **保持示例代码可运行** - 文档中的代码示例应该是可以直接使用的

### 文档模板

新增文档时参考现有格式：

- 标题 + 创建日期
- 目录结构清晰
- 包含代码示例
- 提供检查清单

---

## 八、文档目录结构

```
docs/
├── README.md                    # 索引导航 (本文档)
│
├── planning/                    # 产品与规划
│   ├── product-plan.md          # 产品规划
│   ├── content-generation-directions.md  # 方向探索
│   ├── ai-providers-overview.md # 🎯 AI 供应商选型总览（必读）
│   ├── tts-free-providers.md    # TTS 免费供应商快速接入
│   ├── tts-providers-comparison.md  # TTS 供应商深度对比
│   └── llm-asr-providers.md     # LLM & ASR 供应商快速接入
│
├── design/                      # 技术设计
│   ├── design-research.md       # 设计总览
│   ├── backend-architecture.md  # 后端架构
│   ├── api-design.md            # API 接口设计
│   ├── database-schema.md       # 数据库设计
│   ├── frontend-architecture.md # 前端架构
│   ├── ui-ux-design.md          # UI/UX 设计规范
│   ├── pages-design.md          # 页面设计（所有页面）
│   ├── landing-page-design.md   # 主页设计
│   ├── i18n-design.md           # 国际化方案
│   ├── seo-analytics.md         # SEO 与数据分析
│   ├── figma-integration.md     # Figma 集成与 AI 代码生成
│   ├── user-guide-pages.md      # 用户导向页面设计
│   ├── auth-design.md           # 登录鉴权
│   ├── payment-integration.md   # 支付集成
│   ├── prompt-engineering.md    # Prompt 工程
│   └── error-handling.md        # 错误处理
│
└── development/                 # 开发与运维
    ├── env-config.md            # 环境配置
    ├── automation-plan.md       # 自动化开发
    ├── deployment-architecture.md # 部署架构
    └── release-verification.md  # 上线验证
```

**总计: 26 个文档，覆盖完整开发流程**

---

_让 AI 和开发者都能快速上手！_
