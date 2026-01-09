# AIMake 环境变量与配置管理

> 创建日期: 2026-01-09
> 策略: 分环境配置 + 密钥安全管理
>
> **快速开始**: 复制根目录的 `.env.example` 文件并按照注释填写

---

## 📋 快速配置

### 环境变量模板文件

项目根目录提供了完整的环境变量模板文件：

📄 **[.env.example](../../.env.example)**

包含以下完整配置：
- ✅ 前端环境变量（Vite）
- ✅ 后端环境变量（Cloudflare Workers）
- ✅ TTS 供应商配置（腾讯云、Google、Azure、OpenAI、MiniMax、ElevenLabs）
- ✅ LLM 供应商配置（硅基流动、智谱、DeepSeek、Moonshot、阿里云）
- ✅ ASR 供应商配置（腾讯云、讯飞、火山引擎、阿里云）
- ✅ 认证与支付（Clerk、Stripe）
- ✅ 存储、缓存、监控等

### 快速开始步骤

```bash
# 1. 复制模板文件
cp .env.example .env

# 2. 编辑 .env 填入实际值
# 参考文件中的注释说明

# 3. 前端开发（复制到前端目录）
cp .env frontend/.env.local

# 4. 后端开发（Cloudflare Workers）
# 复制敏感变量到 api/.dev.vars
# 或使用 wrangler secret put 命令
```

---

## 一、环境概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        环境配置架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   开发环境    │  │   预发环境    │  │   生产环境    │          │
│  │ development  │  │   staging    │  │  production  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│        │                  │                  │                  │
│        ▼                  ▼                  ▼                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  .env.local  │  │ .env.staging │  │  Secrets     │          │
│  │  (本地文件)   │  │  (Git 忽略)   │  │ (平台管理)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、前端环境变量

### 2.1 变量清单

```bash
# .env.example (提交到 Git)
# ================================================
# AIMake 前端环境变量
# 复制此文件为 .env.local 并填入实际值
# ================================================

# ========== 环境 ==========
VITE_ENV=development
# development | staging | production

# ========== API ==========
VITE_API_URL=http://localhost:8787/api
# 开发: http://localhost:8787/api
# 预发: https://api-staging.aimake.cc/api
# 生产: https://api.aimake.cc/api

# ========== 认证 (Clerk) ==========
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
# 从 Clerk Dashboard 获取

# ========== 支付 (Stripe) ==========
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
# 从 Stripe Dashboard 获取

# ========== 分析 (可选) ==========
VITE_SENTRY_DSN=
VITE_GA_ID=

# ========== 功能开关 ==========
VITE_FEATURE_PODCAST=true
VITE_FEATURE_VOICE_CLONE=false
```

### 2.2 环境文件

```bash
# 文件结构
frontend/
├── .env.example      # 模板 (提交)
├── .env.local        # 本地开发 (不提交)
├── .env.staging      # 预发环境 (不提交)
└── .env.production   # 生产环境 (不提交，用 Vercel 管理)
```

### 2.3 TypeScript 类型定义

```typescript
// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: 'development' | 'staging' | 'production';
  readonly VITE_API_URL: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_GA_ID?: string;
  readonly VITE_FEATURE_PODCAST: string;
  readonly VITE_FEATURE_VOICE_CLONE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 2.4 配置读取

```typescript
// src/config/index.ts

export const config = {
  env: import.meta.env.VITE_ENV,
  isDev: import.meta.env.VITE_ENV === 'development',
  isProd: import.meta.env.VITE_ENV === 'production',
  
  api: {
    baseUrl: import.meta.env.VITE_API_URL,
  },
  
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  },
  
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  },
  
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
  },
  
  features: {
    podcast: import.meta.env.VITE_FEATURE_PODCAST === 'true',
    voiceClone: import.meta.env.VITE_FEATURE_VOICE_CLONE === 'true',
  },
} as const;

// 验证必需变量
const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_CLERK_PUBLISHABLE_KEY',
];

for (const key of requiredEnvVars) {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}
```

### 2.5 Vercel 环境变量配置

```bash
# Vercel CLI 设置
vercel env add VITE_ENV production
vercel env add VITE_API_URL production
vercel env add VITE_CLERK_PUBLISHABLE_KEY production
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
vercel env add VITE_SENTRY_DSN production

# 或在 Vercel Dashboard 设置:
# Project Settings → Environment Variables
```

---

## 三、后端环境变量

### 3.1 变量清单

```toml
# wrangler.toml

name = "aimake-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# ========== 开发环境变量 ==========
[vars]
ENV = "development"
CORS_ORIGIN = "http://localhost:5173"
LOG_LEVEL = "debug"

# ========== 生产环境变量 ==========
[env.production.vars]
ENV = "production"
CORS_ORIGIN = "https://aimake.cc"
LOG_LEVEL = "info"

# ========== D1 数据库 ==========
[[d1_databases]]
binding = "DB"
database_name = "aimake-db"
database_id = "xxx"  # 从 wrangler d1 create 获取

# ========== KV 存储 ==========
[[kv_namespaces]]
binding = "KV"
id = "xxx"  # 从 wrangler kv:namespace create 获取

# ========== R2 存储 ==========
[[r2_buckets]]
binding = "R2"
bucket_name = "aimake-audio"
```

### 3.2 Secrets 管理

```bash
# ================================================
# Cloudflare Workers Secrets
# 使用 wrangler secret put 设置
# 这些值不会出现在 wrangler.toml 中
# ================================================

# ========== 认证 ==========
wrangler secret put CLERK_SECRET_KEY
# 输入: sk_test_xxx (从 Clerk Dashboard 获取)

wrangler secret put CLERK_WEBHOOK_SECRET
# 输入: whsec_xxx (从 Clerk Webhook 设置获取)

# ========== 支付 ==========
wrangler secret put STRIPE_SECRET_KEY
# 输入: sk_test_xxx (从 Stripe Dashboard 获取)

wrangler secret put STRIPE_WEBHOOK_SECRET
# 输入: whsec_xxx (从 Stripe Webhook 设置获取)

# ========== TTS API ==========
wrangler secret put OPENAI_API_KEY
# 输入: sk-xxx (从 OpenAI 获取)

wrangler secret put ELEVENLABS_API_KEY
# 输入: xxx (从 ElevenLabs 获取)

wrangler secret put TENCENT_SECRET_ID
wrangler secret put TENCENT_SECRET_KEY

# ========== 其他 ==========
wrangler secret put SENTRY_DSN
# 输入: https://xxx@sentry.io/xxx
```

### 3.3 TypeScript 类型定义

```typescript
// src/types/env.d.ts

export interface Env {
  // ========== 环境变量 ==========
  ENV: 'development' | 'staging' | 'production';
  CORS_ORIGIN: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  
  // ========== Bindings ==========
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  
  // ========== Secrets ==========
  CLERK_SECRET_KEY: string;
  CLERK_WEBHOOK_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  OPENAI_API_KEY: string;
  ELEVENLABS_API_KEY?: string;
  TENCENT_SECRET_ID?: string;
  TENCENT_SECRET_KEY?: string;
  SENTRY_DSN?: string;
}
```

### 3.4 配置读取

```typescript
// src/config/index.ts

import { Env } from '@/types/env';

export function createConfig(env: Env) {
  return {
    env: env.ENV,
    isDev: env.ENV === 'development',
    isProd: env.ENV === 'production',
    
    cors: {
      origin: env.CORS_ORIGIN.split(','),
    },
    
    clerk: {
      secretKey: env.CLERK_SECRET_KEY,
      webhookSecret: env.CLERK_WEBHOOK_SECRET,
    },
    
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
    
    tts: {
      openai: {
        apiKey: env.OPENAI_API_KEY,
      },
      elevenlabs: env.ELEVENLABS_API_KEY ? {
        apiKey: env.ELEVENLABS_API_KEY,
      } : null,
      tencent: env.TENCENT_SECRET_ID ? {
        secretId: env.TENCENT_SECRET_ID,
        secretKey: env.TENCENT_SECRET_KEY,
      } : null,
    },
    
    logging: {
      level: env.LOG_LEVEL,
    },
  };
}

// 使用
const config = createConfig(c.env);
```

---

## 四、本地开发配置

### 4.1 完整的本地开发设置

```bash
#!/bin/bash
# scripts/setup-dev.sh

echo "🚀 AIMake 开发环境设置"

# 1. 前端环境变量
echo "设置前端环境变量..."
if [ ! -f frontend/.env.local ]; then
  cp frontend/.env.example frontend/.env.local
  echo "✅ 创建 frontend/.env.local"
  echo "⚠️  请编辑 frontend/.env.local 填入实际值"
else
  echo "✅ frontend/.env.local 已存在"
fi

# 2. 后端 D1 数据库
echo "创建本地 D1 数据库..."
cd api
wrangler d1 create aimake-db --local
wrangler d1 execute aimake-db --local --file=./migrations/0001_init.sql
echo "✅ D1 数据库初始化完成"

# 3. 后端 KV
echo "创建本地 KV..."
wrangler kv:namespace create CACHE --preview
echo "✅ KV 创建完成"

# 4. 本地 Secrets
echo "设置开发 Secrets..."
cat > .dev.vars << EOF
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
OPENAI_API_KEY=sk-xxx
EOF
echo "⚠️  请编辑 api/.dev.vars 填入实际值"

cd ..
echo "🎉 开发环境设置完成！"
echo ""
echo "下一步:"
echo "1. 编辑 frontend/.env.local 填入 Clerk 和 Stripe 密钥"
echo "2. 编辑 api/.dev.vars 填入后端密钥"
echo "3. 运行 npm run dev 启动开发服务器"
```

### 4.2 本地开发启动

```json
// package.json (根目录)
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:api\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:api": "cd api && npm run dev",
    "setup": "./scripts/setup-dev.sh"
  }
}
```

```json
// frontend/package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

```json
// api/package.json
{
  "scripts": {
    "dev": "wrangler dev --local --persist",
    "deploy": "wrangler deploy",
    "deploy:staging": "wrangler deploy --env staging"
  }
}
```

---

## 五、生产环境配置

### 5.1 Cloudflare Workers 部署

```bash
# 设置生产 Secrets
wrangler secret put CLERK_SECRET_KEY --env production
wrangler secret put CLERK_WEBHOOK_SECRET --env production
wrangler secret put STRIPE_SECRET_KEY --env production
wrangler secret put STRIPE_WEBHOOK_SECRET --env production
wrangler secret put OPENAI_API_KEY --env production

# 部署
wrangler deploy --env production
```

### 5.2 Vercel 部署

```bash
# 设置生产环境变量
vercel env add VITE_ENV production << EOF
production
EOF

vercel env add VITE_API_URL production << EOF
https://api.aimake.cc/api
EOF

vercel env add VITE_CLERK_PUBLISHABLE_KEY production
# 交互式输入

vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# 交互式输入

# 部署
vercel --prod
```

### 5.3 GitHub Actions Secrets

```yaml
# .github/workflows/deploy.yml

# 需要在 GitHub Secrets 中设置:
# - CLOUDFLARE_API_TOKEN
# - VERCEL_TOKEN
# - VERCEL_ORG_ID
# - VERCEL_PROJECT_ID

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Cloudflare
        run: |
          cd api
          npx wrangler deploy --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        run: |
          cd frontend
          vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
          vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 六、密钥获取指南

### 6.1 Clerk

```markdown
## Clerk 密钥获取

1. 登录 https://dashboard.clerk.com
2. 选择应用 "AIMake"
3. 左侧菜单 → API Keys

### Publishable Key (前端)
- 格式: pk_test_xxx 或 pk_live_xxx
- 用途: 前端 ClerkProvider

### Secret Key (后端)
- 格式: sk_test_xxx 或 sk_live_xxx
- 用途: 后端 JWT 验证

### Webhook Secret
- 左侧菜单 → Webhooks
- 创建 Endpoint 后获取
- 格式: whsec_xxx
```

### 6.2 Stripe

```markdown
## Stripe 密钥获取

1. 登录 https://dashboard.stripe.com
2. 右上角切换 Test/Live 模式

### Publishable Key (前端)
- Developers → API keys → Publishable key
- 格式: pk_test_xxx 或 pk_live_xxx

### Secret Key (后端)
- Developers → API keys → Secret key
- 格式: sk_test_xxx 或 sk_live_xxx

### Webhook Secret
- Developers → Webhooks → 添加 Endpoint
- 创建后点击 Reveal → Signing secret
- 格式: whsec_xxx

### Price IDs
- Products → 选择产品 → 价格 → API ID
- 格式: price_xxx
```

### 6.3 OpenAI

```markdown
## OpenAI API Key 获取

1. 登录 https://platform.openai.com
2. 右上角头像 → API keys
3. Create new secret key
4. 格式: sk-xxx

### 注意事项
- 创建后只显示一次，请妥善保存
- 建议为不同环境创建不同的 key
- 设置 Usage limits 防止超额
```

### 6.4 腾讯云 TTS

```markdown
## 腾讯云密钥获取

1. 登录 https://console.cloud.tencent.com
2. 右上角 → 访问管理 → 访问密钥 → API密钥管理
3. 新建密钥

### SecretId
- 格式: AKIDxxx
- 用途: 身份标识

### SecretKey
- 格式: xxx
- 用途: 签名计算

### 注意事项
- 建议使用子账号密钥
- 开启 TTS 服务: 语音合成控制台
```

---

## 七、安全最佳实践

### 7.1 安全清单

```markdown
## 环境变量安全清单

### 代码层面
- [ ] .env.local 已加入 .gitignore
- [ ] .dev.vars 已加入 .gitignore
- [ ] 无硬编码的 API Key
- [ ] 敏感变量使用 Secrets 管理

### 密钥管理
- [ ] 开发/生产使用不同密钥
- [ ] 定期轮换密钥
- [ ] 限制 API Key 权限
- [ ] 启用 API 使用限制

### 访问控制
- [ ] Cloudflare Secrets 仅管理员可访问
- [ ] Vercel 环境变量设置访问权限
- [ ] GitHub Secrets 限制仓库访问

### 监控
- [ ] 启用 API 使用告警
- [ ] 监控异常调用
- [ ] 日志脱敏处理
```

### 7.2 .gitignore

```gitignore
# 环境变量
.env
.env.local
.env.*.local
.env.development
.env.staging
.env.production

# Wrangler
.dev.vars
.wrangler/

# 密钥文件
*.pem
*.key
credentials.json
```

### 7.3 密钥轮换脚本

```bash
#!/bin/bash
# scripts/rotate-secrets.sh

echo "🔐 密钥轮换脚本"
echo "⚠️  请在执行前确保已获取新密钥"

read -p "确认轮换生产环境密钥? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "已取消"
  exit 0
fi

# 1. 更新 Stripe 密钥
echo "更新 Stripe Secret Key..."
wrangler secret put STRIPE_SECRET_KEY --env production

# 2. 更新 OpenAI 密钥
echo "更新 OpenAI API Key..."
wrangler secret put OPENAI_API_KEY --env production

# 3. 验证
echo "验证新密钥..."
curl -s https://api.aimake.cc/api/health | jq .

echo "✅ 密钥轮换完成"
echo "请验证所有功能正常工作"
```

---

## 八、配置验证

### 8.1 启动时验证

```typescript
// src/utils/validateEnv.ts

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(env: Env): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // 必需变量
  const required = [
    'CLERK_SECRET_KEY',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY',
  ];
  
  for (const key of required) {
    if (!env[key]) {
      missing.push(key);
    }
  }
  
  // 可选但推荐
  if (!env.SENTRY_DSN) {
    warnings.push('SENTRY_DSN not set - error tracking disabled');
  }
  
  if (!env.ELEVENLABS_API_KEY) {
    warnings.push('ELEVENLABS_API_KEY not set - premium voices disabled');
  }
  
  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

// 使用
const result = validateEnv(env);
if (!result.valid) {
  throw new Error(`Missing env vars: ${result.missing.join(', ')}`);
}
result.warnings.forEach(w => console.warn(w));
```

### 8.2 健康检查包含配置状态

```typescript
// GET /health 响应
{
  "status": "ok",
  "config": {
    "clerk": "configured",
    "stripe": "configured",
    "tts": {
      "openai": "configured",
      "elevenlabs": "not_configured",
      "tencent": "configured"
    }
  }
}
```

---

## 九、快速参考

### 9.1 环境变量速查表

| 变量 | 位置 | 类型 | 说明 |
|------|------|------|------|
| `VITE_API_URL` | 前端 | 公开 | API 地址 |
| `VITE_CLERK_PUBLISHABLE_KEY` | 前端 | 公开 | Clerk 公钥 |
| `VITE_STRIPE_PUBLISHABLE_KEY` | 前端 | 公开 | Stripe 公钥 |
| `CLERK_SECRET_KEY` | 后端 | Secret | Clerk 私钥 |
| `STRIPE_SECRET_KEY` | 后端 | Secret | Stripe 私钥 |
| `OPENAI_API_KEY` | 后端 | Secret | OpenAI 密钥 |

### 9.2 常用命令

```bash
# 查看 Cloudflare Secrets
wrangler secret list

# 添加 Secret
wrangler secret put SECRET_NAME

# 删除 Secret
wrangler secret delete SECRET_NAME

# 查看 Vercel 环境变量
vercel env ls

# 添加 Vercel 环境变量
vercel env add VAR_NAME

# 拉取 Vercel 环境变量到本地
vercel env pull .env.local
```

---

*完整的环境配置管理方案！*
