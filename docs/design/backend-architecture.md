# AIMake 后端架构设计

> 创建日期: 2026-01-09
> 技术栈: Cloudflare Workers + Hono + D1 + R2

---

## 一、架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐                                            │
│  │   Hono App  │                                            │
│  └──────┬──────┘                                            │
│         │                                                    │
│  ┌──────▼──────┐                                            │
│  │  Middleware │  auth → rateLimit → logger → errorHandler  │
│  └──────┬──────┘                                            │
│         │                                                    │
│  ┌──────▼──────┐                                            │
│  │   Routes    │  /health, /auth, /tts, /audios, /user...  │
│  └──────┬──────┘                                            │
│         │                                                    │
│  ┌──────▼──────┐                                            │
│  │  Services   │  TTSService, PodcastService, StorageService│
│  └──────┬──────┘                                            │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │  Bindings   │  D1 (数据库)  │  R2 (存储)  │  KV (缓存) │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌─────────┐     ┌─────────┐     ┌─────────┐
        │  Clerk  │     │ Stripe  │     │ OpenAI  │
        │  认证    │     │  支付   │     │  TTS    │
        └─────────┘     └─────────┘     └─────────┘
```

---

## 二、项目结构

```
api/
├── src/
│   ├── index.ts              # 入口，Hono app
│   │
│   ├── routes/               # 路由层
│   │   ├── health.ts
│   │   ├── auth.ts
│   │   ├── voices.ts
│   │   ├── tts.ts
│   │   ├── audios.ts
│   │   ├── podcasts.ts
│   │   ├── user.ts
│   │   ├── subscription.ts
│   │   └── webhook.ts
│   │
│   ├── middleware/           # 中间件
│   │   ├── auth.ts           # Clerk JWT 验证
│   │   ├── rateLimit.ts      # 速率限制
│   │   └── errorHandler.ts   # 错误处理
│   │
│   ├── services/             # 业务逻辑层
│   │   ├── tts.ts            # TTS 生成
│   │   ├── podcast.ts        # 播客生成
│   │   ├── storage.ts        # R2 存储
│   │   └── quota.ts          # 额度管理
│   │
│   ├── db/                   # 数据库层
│   │   ├── schema.ts         # Drizzle schema
│   │   └── queries.ts        # 常用查询
│   │
│   ├── lib/                  # 工具库
│   │   ├── openai.ts         # OpenAI 客户端
│   │   ├── clerk.ts          # Clerk 验证
│   │   └── stripe.ts         # Stripe 客户端
│   │
│   └── types/                # 类型定义
│       └── index.ts
│
├── wrangler.toml             # Workers 配置
├── package.json
└── tsconfig.json
```

---

## 三、入口文件

```typescript
// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';

import health from './routes/health';
import auth from './routes/auth';
import voices from './routes/voices';
import tts from './routes/tts';
import audios from './routes/audios';
import podcasts from './routes/podcasts';
import user from './routes/user';
import subscription from './routes/subscription';
import webhook from './routes/webhook';

import { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// 全局中间件
app.use('*', logger());
app.use('*', cors({
  origin: ['https://aimake.cc', 'http://localhost:5173'],
  credentials: true,
}));
app.use('*', errorHandler());

// 公开路由
app.route('/api/health', health);
app.route('/api/voices', voices);
app.route('/api/webhook', webhook);

// 需认证路由
app.use('/api/*', authMiddleware());
app.use('/api/*', rateLimiter());
app.route('/api/auth', auth);
app.route('/api/tts', tts);
app.route('/api/audios', audios);
app.route('/api/podcasts', podcasts);
app.route('/api/user', user);
app.route('/api/subscription', subscription);

export default app;
```

---

## 四、类型定义

```typescript
// src/types/index.ts

// Cloudflare Bindings
export interface Env {
  // 数据库
  DB: D1Database;
  // 缓存
  KV: KVNamespace;
  // 存储
  R2: R2Bucket;
  
  // Secrets
  CLERK_SECRET_KEY: string;
  STRIPE_SECRET_KEY: string;
  OPENAI_API_KEY: string;
  
  // 环境变量
  ENV: 'development' | 'production';
  CORS_ORIGIN: string;
}

// 用户 (注入到 Context)
export interface User {
  id: string;
  clerkId: string;
  email: string;
  plan: 'free' | 'pro' | 'team';
  quotaLimit: number;
  quotaUsed: number;
}

// Hono Context 扩展
declare module 'hono' {
  interface ContextVariableMap {
    user: User;
    requestId: string;
  }
}
```

---

## 五、中间件

### 5.1 认证中间件

```typescript
// src/middleware/auth.ts
import { createMiddleware } from 'hono/factory';
import { verifyToken } from '@clerk/backend';
import { Errors } from '../lib/errors';

export const authMiddleware = () => {
  return createMiddleware(async (c, next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw Errors.authRequired();
    }
    
    try {
      const payload = await verifyToken(token, {
        secretKey: c.env.CLERK_SECRET_KEY,
      });
      
      // 从 D1 获取用户
      const user = await c.env.DB
        .prepare('SELECT * FROM users WHERE clerk_id = ?')
        .bind(payload.sub)
        .first();
      
      if (!user) {
        throw Errors.userNotFound();
      }
      
      c.set('user', user as User);
      await next();
    } catch {
      throw Errors.tokenInvalid();
    }
  });
};
```

### 5.2 速率限制

```typescript
// src/middleware/rateLimit.ts
import { createMiddleware } from 'hono/factory';
import { Errors } from '../lib/errors';

export const rateLimiter = (limit = 60) => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user');
    const key = `rate:${user.id}`;
    
    const count = await c.env.KV.get(key);
    const current = count ? parseInt(count) : 0;
    
    if (current >= limit) {
      throw Errors.rateLimited(60);
    }
    
    await c.env.KV.put(key, String(current + 1), { expirationTtl: 60 });
    await next();
  });
};
```

---

## 六、服务层

### 6.1 TTS 服务

```typescript
// src/services/tts.ts
import OpenAI from 'openai';
import { Env, User } from '../types';
import { Errors } from '../lib/errors';

export class TTSService {
  private openai: OpenAI;
  private env: Env;
  
  constructor(env: Env) {
    this.env = env;
    this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  
  async generate(params: {
    text: string;
    voiceId: string;
    speed?: number;
    user: User;
  }) {
    const { text, voiceId, speed = 1, user } = params;
    
    // 检查额度
    const cost = Math.ceil(text.length / 200); // 预估秒数
    if (user.quotaUsed + cost > user.quotaLimit) {
      throw Errors.quotaExceeded({ limit: user.quotaLimit, used: user.quotaUsed });
    }
    
    // 调用 OpenAI TTS
    const voice = voiceId.replace('openai-', '') as 'alloy' | 'echo' | 'nova';
    const response = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice,
      input: text,
      speed,
    });
    
    // 上传到 R2
    const audioId = crypto.randomUUID();
    const audioBuffer = await response.arrayBuffer();
    await this.env.R2.put(`audios/${audioId}.mp3`, audioBuffer, {
      httpMetadata: { contentType: 'audio/mpeg' },
    });
    
    // 保存记录
    await this.env.DB
      .prepare(`
        INSERT INTO audios (id, user_id, text, voice_id, duration, url)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(audioId, user.id, text, voiceId, cost, `audios/${audioId}.mp3`)
      .run();
    
    // 扣减额度
    await this.env.DB
      .prepare('UPDATE users SET quota_used = quota_used + ? WHERE id = ?')
      .bind(cost, user.id)
      .run();
    
    return {
      id: audioId,
      url: `https://audio.aimake.cc/${audioId}.mp3`,
      duration: cost,
    };
  }
}
```

### 6.2 存储服务

```typescript
// src/services/storage.ts
import { Env } from '../types';

export class StorageService {
  constructor(private env: Env) {}
  
  async upload(key: string, data: ArrayBuffer, contentType: string) {
    await this.env.R2.put(key, data, {
      httpMetadata: { contentType },
    });
    return `https://audio.aimake.cc/${key}`;
  }
  
  async delete(key: string) {
    await this.env.R2.delete(key);
  }
  
  async getSignedUrl(key: string) {
    // R2 presigned URL (需要配置)
    return `https://audio.aimake.cc/${key}`;
  }
}
```

---

## 七、路由示例

```typescript
// src/routes/tts.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { TTSService } from '../services/tts';
import { Env } from '../types';

const tts = new Hono<{ Bindings: Env }>();

const generateSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string(),
  speed: z.number().min(0.5).max(2).default(1),
});

tts.post('/generate', zValidator('json', generateSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  
  const service = new TTSService(c.env);
  const result = await service.generate({ ...body, user });
  
  return c.json({ success: true, data: result });
});

export default tts;
```

---

## 八、数据库查询

```typescript
// src/db/queries.ts
import { Env, User } from '../types';

export async function getUserByClerkId(db: D1Database, clerkId: string) {
  return db
    .prepare('SELECT * FROM users WHERE clerk_id = ?')
    .bind(clerkId)
    .first<User>();
}

export async function getAudiosByUser(db: D1Database, userId: string, limit = 20) {
  return db
    .prepare('SELECT * FROM audios WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
    .bind(userId, limit)
    .all();
}

export async function updateUserQuota(db: D1Database, userId: string, amount: number) {
  return db
    .prepare('UPDATE users SET quota_used = quota_used + ? WHERE id = ?')
    .bind(amount, userId)
    .run();
}

export async function resetMonthlyQuota(db: D1Database) {
  return db
    .prepare('UPDATE users SET quota_used = 0 WHERE quota_reset_at < datetime("now")')
    .run();
}
```

---

## 九、wrangler.toml

```toml
name = "aimake-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENV = "development"
CORS_ORIGIN = "http://localhost:5173"

[env.production.vars]
ENV = "production"
CORS_ORIGIN = "https://aimake.cc"

[[d1_databases]]
binding = "DB"
database_name = "aimake-db"
database_id = "xxx"

[[kv_namespaces]]
binding = "KV"
id = "xxx"

[[r2_buckets]]
binding = "R2"
bucket_name = "aimake-audio"
```

---

## 十、本地开发

```bash
# 安装依赖
cd api && npm install

# 创建本地数据库
wrangler d1 create aimake-db --local
wrangler d1 execute aimake-db --local --file=migrations/0001_init.sql

# 启动开发服务器
wrangler dev --local --persist

# 部署
wrangler deploy
```

---

## 十一、相关文档

| 文档 | 说明 |
|------|------|
| [api-design.md](./api-design.md) | 详细接口定义 |
| [database-schema.md](./database-schema.md) | 数据库表结构 |
| [auth-design.md](./auth-design.md) | Clerk 认证详情 |
| [payment-integration.md](./payment-integration.md) | Stripe 支付详情 |
| [error-handling.md](./error-handling.md) | 错误处理规范 |

---

*简洁的后端架构，专注核心功能！*
