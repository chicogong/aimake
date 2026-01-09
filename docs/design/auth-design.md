# AIMake 登录鉴权设计

> 创建日期: 2026-01-09
> 策略: 使用现成认证服务，减少开发维护成本

---

## 一、认证服务选型

| 服务 | 优点 | 缺点 | 月费 | 推荐度 |
|------|------|------|------|--------|
| **Clerk** | UI 组件完善、开箱即用 | 免费额度较少 | 免费 5K MAU | ⭐⭐⭐⭐⭐ |
| **Supabase Auth** | 与 Supabase DB 集成 | UI 需自己写 | 免费 50K MAU | ⭐⭐⭐⭐ |
| **Auth0** | 企业级、功能全 | 配置复杂、贵 | 免费 7K MAU | ⭐⭐⭐ |
| **Firebase Auth** | Google 生态 | 绑定 Firebase | 免费 | ⭐⭐⭐ |
| **Lucia** | 开源自托管 | 需要自己维护 | 免费 | ⭐⭐ |

### 推荐方案

**首选: Clerk** - 最省事，自带 UI 组件
**备选: Supabase Auth** - 如果已用 Supabase 做数据库

---

## 二、Clerk 集成方案

### 2.1 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户请求                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      前端 (React)                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  <ClerkProvider>                                         │   │
│  │    ├── <SignIn />        # Clerk 登录组件                │   │
│  │    ├── <SignUp />        # Clerk 注册组件                │   │
│  │    ├── <UserButton />    # Clerk 用户菜单                │   │
│  │    └── <SignedIn>        # 已登录内容                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ JWT Token (自动)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      后端 (Workers)                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Clerk Middleware                                        │   │
│  │    └── 验证 JWT → 获取 userId                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Clerk 服务                                  │
│  • 用户管理                                                      │
│  • OAuth (Google/GitHub/Apple)                                  │
│  • MFA 多因素认证                                               │
│  • 会话管理                                                      │
│  • Webhook 通知                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 前端集成

**安装依赖**

```bash
npm install @clerk/clerk-react
```

**环境变量**

```env
# .env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

**Provider 配置**

```tsx
// src/main.tsx

import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <App />
  </ClerkProvider>
);
```

**路由保护**

```tsx
// src/App.tsx

import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公开页面 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        
        {/* 需要登录 */}
        <Route
          path="/app/*"
          element={
            <>
              <SignedIn>
                <AppLayout />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

**登录页面**

```tsx
// src/pages/SignIn.tsx

import { SignIn } from '@clerk/clerk-react';

export function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/app"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl',
          },
          variables: {
            colorPrimary: '#3b82f6',
          },
        }}
      />
    </div>
  );
}
```

**注册页面**

```tsx
// src/pages/SignUp.tsx

import { SignUp } from '@clerk/clerk-react';

export function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        afterSignUpUrl="/app"
      />
    </div>
  );
}
```

**用户菜单**

```tsx
// src/components/Header.tsx

import { UserButton, useUser } from '@clerk/clerk-react';

export function Header() {
  const { user } = useUser();
  
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Logo />
      
      <nav className="flex items-center gap-4">
        <Link to="/app/create">创建</Link>
        <Link to="/app/library">音频库</Link>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {user?.firstName || user?.emailAddresses[0]?.emailAddress}
          </span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>
    </header>
  );
}
```

**获取用户信息 Hook**

```tsx
// src/hooks/useCurrentUser.ts

import { useUser, useAuth } from '@clerk/clerk-react';

export function useCurrentUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  
  // 获取 JWT token 用于 API 请求
  const getAuthToken = async () => {
    return await getToken();
  };
  
  return {
    user: user ? {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: user.fullName || user.firstName,
      avatar: user.imageUrl,
    } : null,
    isLoaded,
    isSignedIn,
    getAuthToken,
  };
}
```

### 2.3 后端集成 (Cloudflare Workers)

**安装依赖**

```bash
npm install @clerk/backend
```

**验证中间件**

```typescript
// src/middleware/auth.ts

import { verifyToken } from '@clerk/backend';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: '未授权' }, 401);
  }
  
  const token = authHeader.slice(7);
  
  try {
    const payload = await verifyToken(token, {
      secretKey: c.env.CLERK_SECRET_KEY,
    });
    
    // 存储用户 ID
    c.set('userId', payload.sub);
    c.set('sessionId', payload.sid);
    
    await next();
  } catch (error) {
    return c.json({ error: 'Token 无效' }, 401);
  }
}
```

**API 路由使用**

```typescript
// src/routes/tts.ts

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

const tts = new Hono();

// 所有路由需要登录
tts.use('*', authMiddleware);

tts.post('/generate', async (c) => {
  const userId = c.get('userId');  // Clerk 用户 ID
  
  // 查询用户额度 (从自己的数据库)
  const user = await c.env.DB.prepare(
    'SELECT quota_used, quota_limit FROM users WHERE clerk_id = ?'
  ).bind(userId).first();
  
  // ... 生成逻辑
});
```

### 2.4 用户同步 (Webhook)

Clerk 用户创建时，同步到自己的数据库：

```typescript
// src/routes/webhook.ts

import { Webhook } from 'svix';

const webhook = new Hono();

webhook.post('/clerk', async (c) => {
  const payload = await c.req.text();
  const headers = {
    'svix-id': c.req.header('svix-id'),
    'svix-timestamp': c.req.header('svix-timestamp'),
    'svix-signature': c.req.header('svix-signature'),
  };
  
  // 验证签名
  const wh = new Webhook(c.env.CLERK_WEBHOOK_SECRET);
  let event;
  
  try {
    event = wh.verify(payload, headers);
  } catch {
    return c.json({ error: 'Invalid signature' }, 400);
  }
  
  // 处理事件
  switch (event.type) {
    case 'user.created':
      await handleUserCreated(c.env.DB, event.data);
      break;
    case 'user.updated':
      await handleUserUpdated(c.env.DB, event.data);
      break;
    case 'user.deleted':
      await handleUserDeleted(c.env.DB, event.data);
      break;
  }
  
  return c.json({ received: true });
});

async function handleUserCreated(db: D1Database, data: any) {
  const now = new Date().toISOString();
  const resetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  await db.prepare(`
    INSERT INTO users (id, clerk_id, email, name, avatar_url, plan, quota_limit, quota_used, quota_reset_at, created_at)
    VALUES (?, ?, ?, ?, ?, 'free', 600, 0, ?, ?)
  `).bind(
    crypto.randomUUID(),
    data.id,
    data.email_addresses[0]?.email_address,
    data.first_name || '',
    data.image_url,
    resetAt,
    now
  ).run();
}
```

### 2.5 数据库 Schema 更新

```sql
-- 使用 clerk_id 替代自己管理的认证
CREATE TABLE users (
    id              TEXT PRIMARY KEY,
    clerk_id        TEXT UNIQUE NOT NULL,  -- Clerk 用户 ID
    email           TEXT NOT NULL,
    name            TEXT,
    avatar_url      TEXT,
    
    -- 套餐和额度
    plan            TEXT DEFAULT 'free',
    quota_limit     INTEGER DEFAULT 600,
    quota_used      INTEGER DEFAULT 0,
    quota_reset_at  TEXT,
    
    -- Stripe
    stripe_customer_id TEXT,
    
    created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at      TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
```

---

## 三、Supabase Auth 方案 (备选)

如果使用 Supabase 作为数据库，可以直接用 Supabase Auth：

### 3.1 前端集成

```bash
npm install @supabase/supabase-js
```

```tsx
// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

```tsx
// src/pages/Login.tsx

import { supabase } from '@/lib/supabase';

export function LoginPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };
  
  const handleEmailLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };
  
  return (
    <div>
      <button onClick={handleGoogleLogin}>
        使用 Google 登录
      </button>
      {/* 邮箱登录表单 */}
    </div>
  );
}
```

```tsx
// src/hooks/useAuth.ts

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取当前用户
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // 监听状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

### 3.2 后端验证

```typescript
// Cloudflare Workers 验证 Supabase JWT

import { createClient } from '@supabase/supabase-js';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: '未授权' }, 401);
  }
  
  const token = authHeader.slice(7);
  
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_SERVICE_KEY
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return c.json({ error: 'Token 无效' }, 401);
  }
  
  c.set('userId', user.id);
  c.set('userEmail', user.email);
  
  await next();
}
```

---

## 四、认证流程图 (Clerk)

### 4.1 登录流程

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  用户   │     │  前端   │     │  Clerk  │     │  后端   │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ 1. 点击登录   │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │ 2. 显示 Clerk │               │
     │               │    登录组件   │               │
     │               │──────────────>│               │
     │               │               │               │
     │ 3. 输入凭据   │               │               │
     │   或 OAuth    │               │               │
     │──────────────────────────────>│               │
     │               │               │               │
     │               │ 4. 验证成功   │               │
     │               │    返回 Token │               │
     │               │<──────────────│               │
     │               │               │               │
     │ 5. 登录成功   │               │               │
     │    跳转应用   │               │               │
     │<──────────────│               │               │
     │               │               │               │
     │               │ 6. API 请求   │               │
     │               │    带 Token   │               │
     │               │──────────────────────────────>│
     │               │               │               │
     │               │               │ 7. 验证 Token │
     │               │               │<──────────────│
     │               │               │               │
     │               │               │ 8. Token 有效 │
     │               │               │──────────────>│
     │               │               │               │
     │               │ 9. 返回数据   │               │
     │               │<──────────────────────────────│
```

### 4.2 首次用户同步

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  用户   │     │  Clerk  │     │ Webhook │     │  D1 DB  │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ 1. 注册成功   │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │ 2. 触发       │               │
     │               │ user.created  │               │
     │               │──────────────>│               │
     │               │               │               │
     │               │               │ 3. 创建用户   │
     │               │               │    记录       │
     │               │               │──────────────>│
     │               │               │               │
     │               │               │ 4. 初始化额度 │
     │               │               │    plan=free  │
     │               │               │    quota=600s │
     │               │               │               │
```

---

## 五、API 请求示例

### 前端发送请求

```tsx
// src/services/api.ts

import { useAuth } from '@clerk/clerk-react';

export function useApi() {
  const { getToken } = useAuth();
  
  const request = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    return response.json();
  };
  
  return {
    get: (endpoint: string) => request(endpoint),
    post: (endpoint: string, data: any) => 
      request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  };
}

// 使用
function TTSCreate() {
  const api = useApi();
  
  const handleGenerate = async () => {
    const result = await api.post('/tts/generate', {
      text: 'Hello world',
      voiceId: 'openai-alloy',
    });
    console.log(result);
  };
}
```

---

## 六、Clerk 配置清单

### Dashboard 配置

1. **创建应用**: https://dashboard.clerk.com
2. **启用登录方式**:
   - [x] Email/Password
   - [x] Google OAuth
   - [x] GitHub OAuth
3. **设置 Redirect URLs**:
   - 开发: `http://localhost:5173`
   - 生产: `https://aimake.cc`
4. **配置 Webhook**:
   - URL: `https://api.aimake.cc/webhook/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`

### 环境变量

```env
# 前端
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# 后端 (Workers)
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
```

---

## 七、成本对比

| 方案 | 开发时间 | 维护成本 | 月费用 | 功能完整度 |
|------|----------|----------|--------|------------|
| **Clerk** | 1-2 天 | 极低 | $0-25 | 极高 |
| **Supabase Auth** | 2-3 天 | 低 | $0 | 高 |
| **自建 JWT** | 1-2 周 | 高 | $0 | 中 |
| **Auth0** | 2-3 天 | 低 | $0-23 | 极高 |

### 推荐

**MVP 阶段**: 使用 Clerk 免费版 (5K MAU)
**增长阶段**: 继续使用 Clerk 或迁移到 Supabase Auth

---

## 八、迁移路径

如果将来需要从 Clerk 迁移：

1. Clerk 支持导出用户数据
2. 用户的 `clerk_id` 可以保持不变
3. 密码哈希可以导出（需联系支持）
4. OAuth 绑定需要用户重新授权

---

*使用现成服务，专注核心业务！*
