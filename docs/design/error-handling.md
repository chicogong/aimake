# AIMake 错误处理规范

> 创建日期: 2026-01-09目标: 统一错误格式、友好用户提示、便于调试

---

## 一、错误处理架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        错误处理流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   错误发生    │ →   │   错误捕获    │ →   │   错误响应    │    │
│  │  (业务/系统)  │     │  (中间件)     │     │  (JSON格式)   │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                              │                                   │
│                              ▼                                   │
│                       ┌──────────────┐                          │
│                       │   错误上报    │                          │
│                       │   (Sentry)    │                          │
│                       └──────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、错误码定义

### 2.1 错误码结构

```typescript
// 错误码格式: CATEGORY_SPECIFIC_ERROR
// 例如: AUTH_TOKEN_EXPIRED, TTS_QUOTA_EXCEEDED

type ErrorCode =
  // ========== 认证错误 (401) ==========
  | 'AUTH_REQUIRED' // 需要登录
  | 'AUTH_TOKEN_INVALID' // Token 无效
  | 'AUTH_TOKEN_EXPIRED' // Token 过期
  | 'AUTH_USER_NOT_FOUND' // 用户不存在

  // ========== 权限错误 (403) ==========
  | 'FORBIDDEN' // 无权限
  | 'QUOTA_EXCEEDED' // 额度超限
  | 'FEATURE_NOT_AVAILABLE' // 功能不可用（需升级）
  | 'RATE_LIMITED' // 请求频率限制

  // ========== 资源错误 (404) ==========
  | 'NOT_FOUND' // 资源不存在
  | 'AUDIO_NOT_FOUND' // 音频不存在
  | 'VOICE_NOT_FOUND' // 音色不存在
  | 'JOB_NOT_FOUND' // 任务不存在

  // ========== 请求错误 (400) ==========
  | 'VALIDATION_ERROR' // 参数验证失败
  | 'INVALID_INPUT' // 输入无效
  | 'TEXT_TOO_LONG' // 文本过长
  | 'TEXT_TOO_SHORT' // 文本过短
  | 'INVALID_VOICE' // 无效音色
  | 'INVALID_FORMAT' // 无效格式

  // ========== 业务错误 (422) ==========
  | 'TTS_GENERATION_FAILED' // TTS 生成失败
  | 'PODCAST_GENERATION_FAILED' // 播客生成失败
  | 'CONTENT_MODERATION_FAILED' // 内容审核失败
  | 'PAYMENT_FAILED' // 支付失败

  // ========== 服务器错误 (500) ==========
  | 'INTERNAL_ERROR' // 内部错误
  | 'DATABASE_ERROR' // 数据库错误
  | 'EXTERNAL_API_ERROR' // 外部 API 错误
  | 'TTS_PROVIDER_ERROR'; // TTS 供应商错误
```

### 2.2 错误码与 HTTP 状态码映射

```typescript
// src/utils/errors.ts

const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  // 401
  AUTH_REQUIRED: 401,
  AUTH_TOKEN_INVALID: 401,
  AUTH_TOKEN_EXPIRED: 401,
  AUTH_USER_NOT_FOUND: 401,

  // 403
  FORBIDDEN: 403,
  QUOTA_EXCEEDED: 403,
  FEATURE_NOT_AVAILABLE: 403,
  RATE_LIMITED: 429,

  // 404
  NOT_FOUND: 404,
  AUDIO_NOT_FOUND: 404,
  VOICE_NOT_FOUND: 404,
  JOB_NOT_FOUND: 404,

  // 400
  VALIDATION_ERROR: 400,
  INVALID_INPUT: 400,
  TEXT_TOO_LONG: 400,
  TEXT_TOO_SHORT: 400,
  INVALID_VOICE: 400,
  INVALID_FORMAT: 400,

  // 422
  TTS_GENERATION_FAILED: 422,
  PODCAST_GENERATION_FAILED: 422,
  CONTENT_MODERATION_FAILED: 422,
  PAYMENT_FAILED: 422,

  // 500
  INTERNAL_ERROR: 500,
  DATABASE_ERROR: 500,
  EXTERNAL_API_ERROR: 502,
  TTS_PROVIDER_ERROR: 502,
};
```

### 2.3 用户友好消息

```typescript
// src/utils/errorMessages.ts

// 中文消息
const ERROR_MESSAGES_ZH: Record<ErrorCode, string> = {
  // 认证
  AUTH_REQUIRED: '请先登录',
  AUTH_TOKEN_INVALID: '登录已失效，请重新登录',
  AUTH_TOKEN_EXPIRED: '登录已过期，请重新登录',
  AUTH_USER_NOT_FOUND: '用户不存在',

  // 权限
  FORBIDDEN: '您没有权限执行此操作',
  QUOTA_EXCEEDED: '本月额度已用完，请升级套餐',
  FEATURE_NOT_AVAILABLE: '此功能需要升级到 Pro 套餐',
  RATE_LIMITED: '操作过于频繁，请稍后再试',

  // 资源
  NOT_FOUND: '资源不存在',
  AUDIO_NOT_FOUND: '音频不存在或已删除',
  VOICE_NOT_FOUND: '音色不存在',
  JOB_NOT_FOUND: '任务不存在',

  // 请求
  VALIDATION_ERROR: '输入参数有误',
  INVALID_INPUT: '输入内容无效',
  TEXT_TOO_LONG: '文本过长，请控制在 5000 字以内',
  TEXT_TOO_SHORT: '文本过短，请输入至少 10 个字符',
  INVALID_VOICE: '所选音色无效',
  INVALID_FORMAT: '不支持的格式',

  // 业务
  TTS_GENERATION_FAILED: '音频生成失败，请重试',
  PODCAST_GENERATION_FAILED: '播客生成失败，请重试',
  CONTENT_MODERATION_FAILED: '内容包含敏感信息，请修改后重试',
  PAYMENT_FAILED: '支付失败，请检查支付信息',

  // 服务器
  INTERNAL_ERROR: '服务器开小差了，请稍后重试',
  DATABASE_ERROR: '数据服务异常，请稍后重试',
  EXTERNAL_API_ERROR: '第三方服务异常，请稍后重试',
  TTS_PROVIDER_ERROR: '语音服务暂时不可用，请稍后重试',
};

// 英文消息
const ERROR_MESSAGES_EN: Record<ErrorCode, string> = {
  AUTH_REQUIRED: 'Please sign in to continue',
  AUTH_TOKEN_INVALID: 'Session expired, please sign in again',
  // ... 其他英文消息
};

export function getErrorMessage(code: ErrorCode, locale = 'zh'): string {
  const messages = locale === 'zh' ? ERROR_MESSAGES_ZH : ERROR_MESSAGES_EN;
  return messages[code] || '发生未知错误';
}
```

---

## 三、后端错误处理

### 3.1 自定义错误类

```typescript
// src/utils/errors.ts

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public details?: unknown,
    public statusCode?: number
  ) {
    super(message || getErrorMessage(code));
    this.name = 'AppError';
    this.statusCode = statusCode || ERROR_STATUS_MAP[code] || 500;
  }
}

// 工厂函数
export const Errors = {
  // 认证
  authRequired: () => new AppError('AUTH_REQUIRED'),
  tokenInvalid: () => new AppError('AUTH_TOKEN_INVALID'),
  tokenExpired: () => new AppError('AUTH_TOKEN_EXPIRED'),
  userNotFound: () => new AppError('AUTH_USER_NOT_FOUND'),

  // 权限
  forbidden: () => new AppError('FORBIDDEN'),
  quotaExceeded: (quota: { limit: number; used: number }) =>
    new AppError('QUOTA_EXCEEDED', undefined, { quota }),
  featureNotAvailable: (feature: string) =>
    new AppError('FEATURE_NOT_AVAILABLE', undefined, { feature }),
  rateLimited: (retryAfter: number) => new AppError('RATE_LIMITED', undefined, { retryAfter }),

  // 资源
  notFound: (resource: string) => new AppError('NOT_FOUND', `${resource} 不存在`),
  audioNotFound: (id: string) => new AppError('AUDIO_NOT_FOUND', undefined, { id }),
  voiceNotFound: (id: string) => new AppError('VOICE_NOT_FOUND', undefined, { id }),

  // 请求
  validation: (errors: Record<string, string>) =>
    new AppError('VALIDATION_ERROR', undefined, { errors }),
  textTooLong: (length: number, max: number) =>
    new AppError('TEXT_TOO_LONG', undefined, { length, max }),
  textTooShort: (length: number, min: number) =>
    new AppError('TEXT_TOO_SHORT', undefined, { length, min }),

  // 业务
  ttsGenerationFailed: (reason: string) =>
    new AppError('TTS_GENERATION_FAILED', undefined, { reason }),
  contentModeration: (reason: string) =>
    new AppError('CONTENT_MODERATION_FAILED', undefined, { reason }),

  // 服务器
  internal: (error?: Error) =>
    new AppError('INTERNAL_ERROR', undefined, {
      originalError: error?.message,
    }),
  database: (error: Error) =>
    new AppError('DATABASE_ERROR', undefined, { originalError: error.message }),
  externalApi: (service: string, error: Error) =>
    new AppError('EXTERNAL_API_ERROR', undefined, {
      service,
      originalError: error.message,
    }),
};
```

### 3.2 错误处理中间件

```typescript
// src/middleware/errorHandler.ts

import { Context, Next } from 'hono';
import { AppError, getErrorMessage, ERROR_STATUS_MAP } from '@/utils/errors';
import * as Sentry from '@sentry/cloudflare';

export function errorHandler() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      // 处理已知业务错误
      if (error instanceof AppError) {
        return c.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
              // 仅开发环境返回详情
              ...(c.env.ENV === 'development' && { details: error.details }),
            },
          },
          error.statusCode
        );
      }

      // 处理 Zod 验证错误
      if (error.name === 'ZodError') {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: '输入参数有误',
              details: error.errors.map((e: any) => ({
                field: e.path.join('.'),
                message: e.message,
              })),
            },
          },
          400
        );
      }

      // 未知错误
      console.error('Unhandled error:', error);

      // 上报 Sentry
      if (c.env.SENTRY_DSN) {
        Sentry.captureException(error, {
          extra: {
            url: c.req.url,
            method: c.req.method,
            userId: c.get('user')?.id,
          },
        });
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: getErrorMessage('INTERNAL_ERROR'),
            // 仅开发环境返回堆栈
            ...(c.env.ENV === 'development' && {
              stack: error.stack,
            }),
          },
        },
        500
      );
    }
  };
}
```

### 3.3 业务代码中使用

```typescript
// src/routes/tts.ts

import { Errors } from '@/utils/errors';

tts.post('/generate', async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  // 检查额度
  const quota = await getQuota(c.env.DB, user.id);
  if (quota.remaining <= 0) {
    throw Errors.quotaExceeded({
      limit: quota.limit,
      used: quota.used,
    });
  }

  // 检查文本长度
  if (body.text.length > 5000) {
    throw Errors.textTooLong(body.text.length, 5000);
  }

  if (body.text.length < 10) {
    throw Errors.textTooShort(body.text.length, 10);
  }

  // 检查音色
  const voice = await getVoice(c.env.DB, body.voiceId);
  if (!voice) {
    throw Errors.voiceNotFound(body.voiceId);
  }

  // 检查高级音色权限
  if (voice.isPremium && user.plan === 'free') {
    throw Errors.featureNotAvailable('高级音色');
  }

  // 调用 TTS
  try {
    const result = await ttsService.generate(body);
    return c.json({ success: true, data: result });
  } catch (error) {
    throw Errors.ttsGenerationFailed(error.message);
  }
});
```

---

## 四、前端错误处理

### 4.1 API 响应类型

```typescript
// src/types/api.ts

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
```

### 4.2 Axios 拦截器

```typescript
// src/services/api.ts

import axios, { AxiosError } from 'axios';
import { toast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ error: ApiError }>) => {
    const apiError = error.response?.data?.error;

    if (!apiError) {
      // 网络错误
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查网络',
      });
    }

    // 处理特定错误
    switch (apiError.code) {
      case 'AUTH_TOKEN_EXPIRED':
      case 'AUTH_TOKEN_INVALID':
        // 清除登录状态，跳转登录
        useAuthStore.getState().logout();
        window.location.href = '/sign-in';
        break;

      case 'QUOTA_EXCEEDED':
        // 显示升级提示（由业务代码处理）
        break;

      case 'RATE_LIMITED':
        const retryAfter = apiError.details?.retryAfter || 60;
        toast.error(`操作过于频繁，请 ${retryAfter} 秒后重试`);
        break;

      case 'INTERNAL_ERROR':
      case 'DATABASE_ERROR':
      case 'EXTERNAL_API_ERROR':
        toast.error('服务暂时不可用，请稍后重试');
        break;
    }

    return Promise.reject(apiError);
  }
);
```

### 4.3 React Query 错误处理

```typescript
// src/hooks/useTTS.ts

import { useMutation } from '@tanstack/react-query';
import { ttsService } from '@/services/ttsService';
import { useToast } from '@/hooks/useToast';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';

export function useTTS() {
  const { toast } = useToast();
  const { openUpgrade } = useUpgradeModal();

  return useMutation({
    mutationFn: ttsService.generate,

    onError: (error: ApiError) => {
      switch (error.code) {
        case 'QUOTA_EXCEEDED':
          openUpgrade({
            reason: 'quota',
            message: error.message,
          });
          break;

        case 'FEATURE_NOT_AVAILABLE':
          openUpgrade({
            reason: 'feature',
            feature: error.details?.feature,
          });
          break;

        case 'TEXT_TOO_LONG':
          toast.error(`文本过长: ${error.details?.length}/${error.details?.max} 字符`);
          break;

        case 'CONTENT_MODERATION_FAILED':
          toast.error('内容包含敏感信息，请修改后重试');
          break;

        case 'TTS_GENERATION_FAILED':
          toast.error('生成失败，请重试');
          break;

        default:
          toast.error(error.message);
      }
    },

    onSuccess: () => {
      toast.success('音频生成成功！');
    },
  });
}
```

### 4.4 表单验证错误

```typescript
// src/components/forms/TTSForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  text: z
    .string()
    .min(10, '请输入至少 10 个字符')
    .max(5000, '文本不能超过 5000 个字符'),
  voiceId: z.string().min(1, '请选择音色'),
  speed: z.number().min(0.5).max(2),
});

export function TTSForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useTTS();

  const onSubmit = async (data) => {
    try {
      await mutate(data);
    } catch (error) {
      // 服务端验证错误映射到表单
      if (error.code === 'VALIDATION_ERROR' && error.details) {
        error.details.forEach((e) => {
          setError(e.field, { message: e.message });
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <textarea {...register('text')} />
      {errors.text && (
        <span className="text-red-500 text-sm">{errors.text.message}</span>
      )}

      {/* ... */}
    </form>
  );
}
```

### 4.5 错误边界

```typescript
// src/components/ErrorBoundary.tsx

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);

    // 上报 Sentry
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-xl font-bold mb-4">页面出错了</h2>
            <p className="text-gray-600 mb-4">
              我们已收到错误报告，正在修复中
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              刷新页面
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// 使用
// <ErrorBoundary>
//   <App />
// </ErrorBoundary>
```

---

## 五、错误上报

### 5.1 Sentry 配置

```typescript
// src/main.tsx (前端)

import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// 设置用户上下文
export function setSentryUser(user: { id: string; email: string }) {
  Sentry.setUser({ id: user.id, email: user.email });
}
```

```typescript
// src/index.ts (后端)

import { Toucan } from 'toucan-js';

const sentry = new Toucan({
  dsn: env.SENTRY_DSN,
  context: ctx.executionCtx,
  request: ctx.req.raw,
  environment: env.ENV,
});

// 在错误中间件中使用
sentry.captureException(error);
```

### 5.2 错误分类和告警

```typescript
// Sentry 告警规则

// 1. 高频错误告警
// 规则: 同一错误 5 分钟内出现 > 10 次
// 通知: Slack #alerts 频道

// 2. 关键错误告警
// 规则: INTERNAL_ERROR, DATABASE_ERROR
// 通知: 立即发送邮件 + Slack

// 3. 用户体验错误
// 规则: TTS_GENERATION_FAILED > 5%
// 通知: 每小时汇总

// 4. 支付错误
// 规则: 任何 PAYMENT_* 错误
// 通知: 立即通知
```

---

## 六、错误日志

### 6.1 日志格式

```typescript
// src/utils/logger.ts

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: {
    userId?: string;
    requestId?: string;
    errorCode?: string;
    [key: string]: unknown;
  };
}

export function createLogger(env: Env) {
  const level = env.LOG_LEVEL || 'info';

  return {
    debug: (message: string, context?: object) => {
      if (level === 'debug') {
        console.debug(formatLog('debug', message, context));
      }
    },

    info: (message: string, context?: object) => {
      if (['debug', 'info'].includes(level)) {
        console.info(formatLog('info', message, context));
      }
    },

    warn: (message: string, context?: object) => {
      if (['debug', 'info', 'warn'].includes(level)) {
        console.warn(formatLog('warn', message, context));
      }
    },

    error: (message: string, error?: Error, context?: object) => {
      console.error(
        formatLog('error', message, {
          ...context,
          error: error?.message,
          stack: error?.stack,
        })
      );
    },
  };
}

function formatLog(level: string, message: string, context?: object): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: level as LogEntry['level'],
    message,
    context,
  };

  return JSON.stringify(entry);
}
```

### 6.2 请求日志

```typescript
// src/middleware/requestLogger.ts

export function requestLogger() {
  return async (c: Context, next: Next) => {
    const requestId = crypto.randomUUID();
    c.set('requestId', requestId);

    const start = Date.now();

    await next();

    const duration = Date.now() - start;
    const user = c.get('user');

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        duration,
        userId: user?.id,
        userAgent: c.req.header('User-Agent'),
      })
    );
  };
}
```

---

## 七、测试错误处理

### 7.1 单元测试

```typescript
// tests/unit/errors.test.ts

import { describe, it, expect } from 'vitest';
import { Errors, AppError } from '@/utils/errors';

describe('AppError', () => {
  it('creates error with correct code and message', () => {
    const error = Errors.quotaExceeded({ limit: 600, used: 600 });

    expect(error.code).toBe('QUOTA_EXCEEDED');
    expect(error.statusCode).toBe(403);
    expect(error.details).toEqual({ quota: { limit: 600, used: 600 } });
  });

  it('maps error code to correct HTTP status', () => {
    expect(Errors.authRequired().statusCode).toBe(401);
    expect(Errors.notFound('Audio').statusCode).toBe(404);
    expect(Errors.internal().statusCode).toBe(500);
  });
});
```

### 7.2 API 测试

```typescript
// tests/api/errors.test.ts

import { describe, it, expect } from 'vitest';
import app from '@/index';

describe('Error Handling', () => {
  it('returns 401 for unauthenticated request', async () => {
    const res = await app.request('/api/tts/generate', {
      method: 'POST',
      body: JSON.stringify({ text: 'test' }),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error.code).toBe('AUTH_REQUIRED');
  });

  it('returns 400 for validation error', async () => {
    const res = await app.request('/api/tts/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({ text: '' }), // Empty text
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 403 for quota exceeded', async () => {
    // 设置用户额度为 0
    await setUserQuota(testUserId, 0);

    const res = await app.request('/api/tts/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({ text: 'test', voiceId: 'openai-alloy' }),
    });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error.code).toBe('QUOTA_EXCEEDED');
  });
});
```

---

## 八、快速参考

### 8.1 常见错误处理模式

```typescript
// 模式 1: 简单抛出
throw Errors.quotaExceeded(quota);

// 模式 2: 条件检查
if (!voice) {
  throw Errors.voiceNotFound(voiceId);
}

// 模式 3: Try-Catch 包装
try {
  await externalApi.call();
} catch (error) {
  throw Errors.externalApi('TTS Provider', error);
}

// 模式 4: 验证失败
if (errors.length > 0) {
  throw Errors.validation(errors);
}
```

### 8.2 前端错误处理模式

```typescript
// 模式 1: Toast 提示
toast.error(error.message);

// 模式 2: 弹窗交互
if (error.code === 'QUOTA_EXCEEDED') {
  openUpgradeModal();
}

// 模式 3: 表单错误
setError('fieldName', { message: error.message });

// 模式 4: 重定向
if (error.code === 'AUTH_TOKEN_EXPIRED') {
  navigate('/sign-in');
}
```

### 8.3 错误码速查

| 错误码                | HTTP | 说明       | 前端处理     |
| --------------------- | ---- | ---------- | ------------ |
| AUTH_REQUIRED         | 401  | 未登录     | 跳转登录     |
| QUOTA_EXCEEDED        | 403  | 额度用完   | 升级弹窗     |
| RATE_LIMITED          | 429  | 频率限制   | Toast + 等待 |
| VALIDATION_ERROR      | 400  | 参数错误   | 表单提示     |
| TTS_GENERATION_FAILED | 422  | 生成失败   | Toast + 重试 |
| INTERNAL_ERROR        | 500  | 服务器错误 | Toast + 上报 |

---

_统一的错误处理规范，提升用户体验和调试效率！_
