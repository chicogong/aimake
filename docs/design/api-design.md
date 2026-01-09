# AIMake API 接口设计

> 创建日期: 2026-01-09
> 后端: Cloudflare Workers + Hono
> 风格: RESTful + JSON

---

## 一、API 概览

### 1.1 基础信息

```yaml
Base URL:
  开发环境: http://localhost:8787/api
  生产环境: https://api.aimake.cc/api

认证方式: Bearer Token (Clerk JWT)
内容类型: application/json
```

### 1.2 接口清单

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| **健康检查** | | | |
| | GET | /health | 服务健康检查 |
| **认证** | | | |
| | GET | /auth/me | 获取当前用户 |
| | POST | /webhook/clerk | Clerk Webhook |
| **音色** | | | |
| | GET | /voices | 获取音色列表 |
| | GET | /voices/:id/preview | 获取音色预览 |
| **TTS** | | | |
| | POST | /tts/generate | 生成音频 |
| | GET | /tts/status/:jobId | 查询生成状态 |
| **音频** | | | |
| | GET | /audios | 获取音频列表 |
| | GET | /audios/:id | 获取音频详情 |
| | DELETE | /audios/:id | 删除音频 |
| | GET | /audios/:id/download | 下载音频 |
| **播客** | | | |
| | POST | /podcasts/generate | 生成播客 |
| | GET | /podcasts | 获取播客列表 |
| | GET | /podcasts/:id | 获取播客详情 |
| | DELETE | /podcasts/:id | 删除播客 |
| **用户** | | | |
| | GET | /user/quota | 获取用量额度 |
| | GET | /user/usage | 获取使用记录 |
| **订阅** | | | |
| | GET | /subscription | 获取订阅状态 |
| | POST | /subscription/checkout | 创建支付会话 |
| | POST | /webhook/stripe | Stripe Webhook |

---

## 二、通用规范

### 2.1 请求头

```typescript
// 所有请求必须包含
interface RequestHeaders {
  'Content-Type': 'application/json';
  'Authorization'?: `Bearer ${string}`;  // Clerk JWT，需登录的接口必须
}
```

### 2.2 响应格式

```typescript
// 成功响应
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

// 错误响应
interface ErrorResponse {
  success: false;
  error: {
    code: string;        // 错误码，如 'QUOTA_EXCEEDED'
    message: string;     // 用户可读消息
    details?: unknown;   // 详细错误信息（仅开发环境）
  };
}
```

### 2.3 分页参数

```typescript
// Query 参数
interface PaginationParams {
  page?: number;      // 页码，默认 1
  pageSize?: number;  // 每页数量，默认 20，最大 100
  sortBy?: string;    // 排序字段
  sortOrder?: 'asc' | 'desc';  // 排序方向
}
```

---

## 三、接口详细定义

### 3.1 健康检查

#### GET /health

检查服务状态，无需认证。

```typescript
// 响应
interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  timestamp: string;
  services: {
    database: 'connected' | 'error';
    redis: 'connected' | 'error';
    tts: 'available' | 'error';
  };
}
```

**示例:**

```bash
curl https://api.aimake.cc/api/health
```

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "timestamp": "2026-01-09T10:00:00Z",
    "services": {
      "database": "connected",
      "redis": "connected",
      "tts": "available"
    }
  }
}
```

---

### 3.2 认证接口

#### GET /auth/me

获取当前登录用户信息。

```typescript
// 请求头
Authorization: Bearer <clerk_jwt>

// 响应
interface UserResponse {
  id: string;           // 用户 ID (UUID)
  clerkId: string;      // Clerk 用户 ID
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: 'free' | 'pro' | 'team';
  quota: {
    limit: number;      // 额度上限（秒）
    used: number;       // 已用额度（秒）
    resetAt: string;    // 重置时间 (ISO 8601)
  };
  createdAt: string;
}
```

#### POST /webhook/clerk

Clerk Webhook，用于同步用户数据。

```typescript
// 请求头
svix-id: string;
svix-timestamp: string;
svix-signature: string;

// 请求体 (Clerk Webhook Event)
interface ClerkWebhookEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
}

// 响应
{ success: true }
```

---

### 3.3 音色接口

#### GET /voices

获取可用音色列表。

```typescript
// Query 参数
interface VoicesQuery {
  provider?: 'openai' | 'elevenlabs' | 'azure' | 'tencent';
  gender?: 'male' | 'female';
  language?: 'zh' | 'en' | 'ja';
  premium?: boolean;  // 是否仅显示高级音色
}

// 响应
interface Voice {
  id: string;           // 如 'openai-alloy'
  name: string;         // 显示名称
  nameZh: string;       // 中文名称
  provider: string;     // 供应商
  gender: 'male' | 'female' | 'neutral';
  language: string[];   // 支持的语言
  style: string;        // 风格描述
  previewUrl: string;   // 预览音频 URL
  isPremium: boolean;   // 是否高级音色
  tags: string[];       // 标签
}

type VoicesResponse = Voice[];
```

**示例:**

```bash
curl https://api.aimake.cc/api/voices?language=zh
```

```json
{
  "success": true,
  "data": [
    {
      "id": "openai-alloy",
      "name": "Alloy",
      "nameZh": "合金",
      "provider": "openai",
      "gender": "neutral",
      "language": ["zh", "en"],
      "style": "平稳、专业",
      "previewUrl": "https://cdn.aimake.cc/voices/openai-alloy.mp3",
      "isPremium": false,
      "tags": ["通用", "新闻"]
    }
  ]
}
```

---

### 3.4 TTS 接口

#### POST /tts/generate

生成语音音频。

```typescript
// 请求体
interface TTSGenerateRequest {
  text: string;         // 待转换文本，最大 5000 字符
  voiceId: string;      // 音色 ID
  speed?: number;       // 语速 0.5-2.0，默认 1.0
  pitch?: number;       // 音调 -10 到 10，默认 0
  format?: 'mp3' | 'wav';  // 输出格式，默认 mp3
}

// 响应
interface TTSGenerateResponse {
  jobId: string;        // 任务 ID
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedTime?: number;  // 预计完成时间（秒）
}
```

**示例:**

```bash
curl -X POST https://api.aimake.cc/api/tts/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好，欢迎使用 AIMake！",
    "voiceId": "openai-alloy",
    "speed": 1.0
  }'
```

```json
{
  "success": true,
  "data": {
    "jobId": "job_abc123",
    "status": "processing",
    "estimatedTime": 5
  }
}
```

#### GET /tts/status/:jobId

查询生成任务状态。

```typescript
// 响应
interface TTSStatusResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;    // 0-100
  audio?: {
    id: string;
    url: string;
    duration: number;   // 秒
    size: number;       // 字节
  };
  error?: {
    code: string;
    message: string;
  };
}
```

---

### 3.5 音频接口

#### GET /audios

获取用户的音频列表。

```typescript
// Query 参数
interface AudiosQuery extends PaginationParams {
  type?: 'tts' | 'podcast';
  search?: string;
}

// 响应
interface Audio {
  id: string;
  title: string;
  type: 'tts' | 'podcast';
  text: string;         // 原始文本（截断）
  voiceId: string;
  voiceName: string;
  duration: number;     // 秒
  size: number;         // 字节
  url: string;          // 音频 URL
  createdAt: string;
}

interface AudiosResponse {
  items: Audio[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### GET /audios/:id

获取音频详情。

```typescript
interface AudioDetailResponse extends Audio {
  text: string;         // 完整文本
  settings: {
    speed: number;
    pitch: number;
    format: string;
  };
  usage: {
    characters: number;
    cost: number;       // 消耗额度（秒）
  };
}
```

#### DELETE /audios/:id

删除音频。

```typescript
// 响应
{ success: true }
```

#### GET /audios/:id/download

下载音频文件。

```typescript
// 响应头
Content-Type: audio/mpeg
Content-Disposition: attachment; filename="audio.mp3"

// 响应体: 音频二进制流
```

---

### 3.6 播客接口

#### POST /podcasts/generate

生成播客对话。

```typescript
// 请求体
interface PodcastGenerateRequest {
  source: {
    type: 'text' | 'url';
    content: string;    // 文本内容或 URL
  };
  settings: {
    duration: 5 | 10 | 15 | 20;  // 目标时长（分钟）
    style: 'casual' | 'professional' | 'debate';
    hostVoiceId: string;
    guestVoiceId: string;
    language?: 'zh' | 'en';
  };
  title?: string;       // 可选标题
}

// 响应
interface PodcastGenerateResponse {
  jobId: string;
  status: 'pending' | 'analyzing' | 'scripting' | 'synthesizing' | 'completed' | 'failed';
  estimatedTime: number;
}
```

#### GET /podcasts/:id

获取播客详情。

```typescript
interface PodcastDetailResponse {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  source: {
    type: 'text' | 'url';
    content: string;
    summary?: string;
  };
  script?: {
    segments: Array<{
      speaker: 'host' | 'guest';
      text: string;
      startTime: number;
      endTime: number;
    }>;
  };
  audio?: {
    url: string;
    duration: number;
    size: number;
  };
  settings: {
    duration: number;
    style: string;
    hostVoice: Voice;
    guestVoice: Voice;
  };
  usage: {
    characters: number;
    llmTokens: number;
    cost: number;
  };
  createdAt: string;
}
```

---

### 3.7 用户接口

#### GET /user/quota

获取用户额度信息。

```typescript
interface QuotaResponse {
  plan: 'free' | 'pro' | 'team';
  quota: {
    limit: number;      // 总额度（秒）
    used: number;       // 已用（秒）
    remaining: number;  // 剩余（秒）
    resetAt: string;    // 重置时间
  };
  usage: {
    today: number;      // 今日使用（秒）
    thisMonth: number;  // 本月使用（秒）
  };
}
```

#### GET /user/usage

获取使用记录。

```typescript
// Query 参数
interface UsageQuery extends PaginationParams {
  startDate?: string;   // ISO 8601
  endDate?: string;
  type?: 'tts' | 'podcast';
}

// 响应
interface UsageRecord {
  id: string;
  type: 'tts' | 'podcast';
  audioId: string;
  title: string;
  characters: number;
  duration: number;
  cost: number;
  createdAt: string;
}

interface UsageResponse {
  items: UsageRecord[];
  summary: {
    totalCharacters: number;
    totalDuration: number;
    totalCost: number;
  };
  total: number;
  page: number;
  pageSize: number;
}
```

---

### 3.8 订阅接口

#### GET /subscription

获取当前订阅状态。

```typescript
interface SubscriptionResponse {
  status: 'none' | 'active' | 'canceled' | 'past_due';
  plan: 'free' | 'pro' | 'team';
  currentPeriod?: {
    start: string;
    end: string;
  };
  cancelAtPeriodEnd?: boolean;
  paymentMethod?: {
    type: 'card';
    last4: string;
    brand: string;
  };
}
```

#### POST /subscription/checkout

创建 Stripe Checkout 会话。

```typescript
// 请求体
interface CheckoutRequest {
  plan: 'pro' | 'team';
  interval: 'month' | 'year';
  successUrl: string;
  cancelUrl: string;
}

// 响应
interface CheckoutResponse {
  checkoutUrl: string;  // Stripe Checkout URL
  sessionId: string;
}
```

#### POST /webhook/stripe

Stripe Webhook，处理支付事件。

```typescript
// 请求头
Stripe-Signature: string;

// 请求体: Stripe Event

// 响应
{ received: true }
```

---

## 四、Hono 路由实现参考

### 4.1 项目结构

```
api/
├── src/
│   ├── index.ts           # 入口
│   ├── routes/
│   │   ├── health.ts
│   │   ├── auth.ts
│   │   ├── voices.ts
│   │   ├── tts.ts
│   │   ├── audios.ts
│   │   ├── podcasts.ts
│   │   ├── user.ts
│   │   └── subscription.ts
│   ├── middleware/
│   │   ├── auth.ts        # Clerk 验证
│   │   ├── rateLimit.ts   # 速率限制
│   │   └── errorHandler.ts
│   ├── services/
│   │   ├── tts.ts
│   │   ├── podcast.ts
│   │   ├── storage.ts
│   │   └── stripe.ts
│   ├── db/
│   │   ├── schema.ts      # Drizzle Schema
│   │   └── queries.ts
│   └── types/
│       └── index.ts
├── wrangler.toml
└── package.json
```

### 4.2 入口文件

```typescript
// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';

import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import voicesRoutes from './routes/voices';
import ttsRoutes from './routes/tts';
import audiosRoutes from './routes/audios';
import podcastsRoutes from './routes/podcasts';
import userRoutes from './routes/user';
import subscriptionRoutes from './routes/subscription';

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  CLERK_SECRET_KEY: string;
  STRIPE_SECRET_KEY: string;
  OPENAI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// 全局中间件
app.use('*', logger());
app.use('*', cors({
  origin: ['https://aimake.cc', 'http://localhost:5173'],
  credentials: true,
}));
app.use('*', errorHandler());

// 公开路由
app.route('/api/health', healthRoutes);
app.route('/api/voices', voicesRoutes);
app.route('/api/webhook', webhookRoutes);

// 需要认证的路由
app.use('/api/*', authMiddleware());
app.use('/api/*', rateLimiter());

app.route('/api/auth', authRoutes);
app.route('/api/tts', ttsRoutes);
app.route('/api/audios', audiosRoutes);
app.route('/api/podcasts', podcastsRoutes);
app.route('/api/user', userRoutes);
app.route('/api/subscription', subscriptionRoutes);

export default app;
```

### 4.3 TTS 路由示例

```typescript
// src/routes/tts.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { TTSService } from '../services/tts';

const tts = new Hono();

const generateSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string(),
  speed: z.number().min(0.5).max(2).default(1),
  pitch: z.number().min(-10).max(10).default(0),
  format: z.enum(['mp3', 'wav']).default('mp3'),
});

// POST /api/tts/generate
tts.post('/generate', zValidator('json', generateSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  
  // 检查额度
  const quota = await getQuota(c.env.DB, user.id);
  const estimatedCost = estimateCost(body.text.length);
  
  if (quota.remaining < estimatedCost) {
    return c.json({
      success: false,
      error: {
        code: 'QUOTA_EXCEEDED',
        message: '额度不足，请升级套餐',
      },
    }, 403);
  }
  
  // 创建任务
  const ttsService = new TTSService(c.env);
  const job = await ttsService.createJob({
    userId: user.id,
    ...body,
  });
  
  return c.json({
    success: true,
    data: {
      jobId: job.id,
      status: job.status,
      estimatedTime: job.estimatedTime,
    },
  });
});

// GET /api/tts/status/:jobId
tts.get('/status/:jobId', async (c) => {
  const { jobId } = c.req.param();
  const user = c.get('user');
  
  const job = await getJob(c.env.DB, jobId, user.id);
  
  if (!job) {
    return c.json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '任务不存在',
      },
    }, 404);
  }
  
  return c.json({
    success: true,
    data: job,
  });
});

export default tts;
```

### 4.4 认证中间件

```typescript
// src/middleware/auth.ts
import { createMiddleware } from 'hono/factory';
import { verifyToken } from '@clerk/backend';

export const authMiddleware = () => {
  return createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '请先登录',
        },
      }, 401);
    }
    
    const token = authHeader.slice(7);
    
    try {
      const payload = await verifyToken(token, {
        secretKey: c.env.CLERK_SECRET_KEY,
      });
      
      // 从数据库获取用户信息
      const user = await getUserByClerkId(c.env.DB, payload.sub);
      
      if (!user) {
        return c.json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用户不存在',
          },
        }, 404);
      }
      
      c.set('user', user);
      await next();
    } catch (error) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token 无效或已过期',
        },
      }, 401);
    }
  });
};
```

---

## 五、前端 API 调用

### 5.1 API Client

```typescript
// src/services/api.ts
import axios, { AxiosError } from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_BASE = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
export const useApiWithAuth = () => {
  const { getToken } = useAuth();
  
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  return api;
};

// 响应拦截器 - 错误处理
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ErrorResponse>) => {
    const errorData = error.response?.data?.error;
    
    // 处理特定错误
    if (errorData?.code === 'QUOTA_EXCEEDED') {
      // 显示升级提示
    }
    
    throw errorData || { code: 'UNKNOWN', message: '网络错误' };
  }
);
```

### 5.2 TTS Service

```typescript
// src/services/ttsService.ts
import { api } from './api';

export interface GenerateRequest {
  text: string;
  voiceId: string;
  speed?: number;
  pitch?: number;
  format?: 'mp3' | 'wav';
}

export const ttsService = {
  // 生成音频
  async generate(data: GenerateRequest) {
    return api.post<{ jobId: string; status: string }>('/tts/generate', data);
  },
  
  // 查询状态
  async getStatus(jobId: string) {
    return api.get<TTSStatusResponse>(`/tts/status/${jobId}`);
  },
  
  // 轮询等待完成
  async waitForCompletion(jobId: string, onProgress?: (progress: number) => void) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        const result = await this.getStatus(jobId);
        
        if (result.status === 'completed') {
          resolve(result.audio);
        } else if (result.status === 'failed') {
          reject(result.error);
        } else {
          onProgress?.(result.progress || 0);
          setTimeout(poll, 1000);
        }
      };
      
      poll();
    });
  },
};
```

### 5.3 React Hook

```typescript
// src/hooks/useTTS.ts
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ttsService, GenerateRequest } from '@/services/ttsService';
import { useToast } from '@/hooks/useToast';

export function useTTS() {
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: async (data: GenerateRequest) => {
      // 1. 创建任务
      const { jobId } = await ttsService.generate(data);
      
      // 2. 等待完成
      const audio = await ttsService.waitForCompletion(jobId, setProgress);
      
      return audio;
    },
    onError: (error: { code: string; message: string }) => {
      if (error.code === 'QUOTA_EXCEEDED') {
        toast.error('额度不足', '请升级到 Pro 套餐获取更多额度');
      } else {
        toast.error('生成失败', error.message);
      }
    },
    onSuccess: () => {
      toast.success('生成成功！');
      setProgress(0);
    },
  });
  
  return {
    generate: mutation.mutate,
    isLoading: mutation.isPending,
    progress,
    error: mutation.error,
  };
}
```

---

## 六、TypeScript 类型定义

```typescript
// src/types/api.ts

// ============ 通用 ============
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

// ============ 用户 ============
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: Plan;
  quota: Quota;
  createdAt: string;
}

export type Plan = 'free' | 'pro' | 'team';

export interface Quota {
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

// ============ 音色 ============
export interface Voice {
  id: string;
  name: string;
  nameZh: string;
  provider: VoiceProvider;
  gender: 'male' | 'female' | 'neutral';
  language: string[];
  style: string;
  previewUrl: string;
  isPremium: boolean;
  tags: string[];
}

export type VoiceProvider = 'openai' | 'elevenlabs' | 'azure' | 'tencent' | 'minimax';

// ============ 音频 ============
export interface Audio {
  id: string;
  title: string;
  type: 'tts' | 'podcast';
  text: string;
  voiceId: string;
  voiceName: string;
  duration: number;
  size: number;
  url: string;
  createdAt: string;
}

// ============ TTS ============
export interface TTSJob {
  jobId: string;
  status: TTSStatus;
  progress?: number;
  audio?: {
    id: string;
    url: string;
    duration: number;
    size: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export type TTSStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ============ 播客 ============
export interface Podcast {
  id: string;
  title: string;
  status: PodcastStatus;
  source: {
    type: 'text' | 'url';
    content: string;
    summary?: string;
  };
  script?: PodcastScript;
  audio?: {
    url: string;
    duration: number;
    size: number;
  };
  settings: PodcastSettings;
  createdAt: string;
}

export type PodcastStatus = 'pending' | 'analyzing' | 'scripting' | 'synthesizing' | 'completed' | 'failed';

export interface PodcastScript {
  segments: Array<{
    speaker: 'host' | 'guest';
    text: string;
    startTime: number;
    endTime: number;
  }>;
}

export interface PodcastSettings {
  duration: number;
  style: 'casual' | 'professional' | 'debate';
  hostVoice: Voice;
  guestVoice: Voice;
}

// ============ 订阅 ============
export interface Subscription {
  status: 'none' | 'active' | 'canceled' | 'past_due';
  plan: Plan;
  currentPeriod?: {
    start: string;
    end: string;
  };
  cancelAtPeriodEnd?: boolean;
}
```

---

*完整的 API 接口定义，可直接用于前后端开发！*
