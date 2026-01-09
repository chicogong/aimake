# AIMake 支付集成设计

> 创建日期: 2026-01-09
> 支付服务: Stripe
> 策略: 订阅制 + 按量付费

---

## 一、支付架构

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户操作                                  │
│     选择套餐 → 点击订阅 → Stripe Checkout → 支付成功              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      前端 (React)                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  PricingPage                                             │   │
│  │    └── 调用 /api/subscription/checkout                   │   │
│  │    └── 跳转到 Stripe Checkout                            │   │
│  │                                                          │   │
│  │  SuccessPage                                             │   │
│  │    └── 显示支付成功                                       │   │
│  │    └── 刷新用户订阅状态                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      后端 (Workers)                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  POST /api/subscription/checkout                         │   │
│  │    └── 创建 Stripe Checkout Session                      │   │
│  │    └── 返回 checkoutUrl                                  │   │
│  │                                                          │   │
│  │  POST /api/webhook/stripe                                │   │
│  │    └── 验证 Webhook 签名                                  │   │
│  │    └── 处理 checkout.session.completed                   │   │
│  │    └── 处理 invoice.paid                                 │   │
│  │    └── 处理 customer.subscription.updated                │   │
│  │    └── 更新数据库订阅状态                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Stripe                                      │
│  • Checkout Session (支付页面)                                   │
│  • Subscriptions (订阅管理)                                      │
│  • Customer Portal (客户自助)                                    │
│  • Webhooks (事件通知)                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 订阅套餐

| 套餐 | 月付 | 年付 | 额度 | Stripe Price ID |
|------|------|------|------|-----------------|
| **Free** | $0 | $0 | 10 分钟/月 | - |
| **Pro** | $19 | $190 | 300 分钟/月 | `price_pro_monthly` / `price_pro_yearly` |
| **Team** | $99 | $990 | 无限 | `price_team_monthly` / `price_team_yearly` |

---

## 二、Stripe 配置

### 2.1 Stripe Dashboard 设置

```markdown
## Stripe 配置清单

### 1. 创建产品和价格
- [ ] 登录 https://dashboard.stripe.com
- [ ] 创建产品 "AIMake Pro"
  - [ ] 月付价格: $19/month → 记录 price_id
  - [ ] 年付价格: $190/year → 记录 price_id
- [ ] 创建产品 "AIMake Team"
  - [ ] 月付价格: $99/month → 记录 price_id
  - [ ] 年付价格: $990/year → 记录 price_id

### 2. 配置 Webhook
- [ ] 添加 Endpoint: https://api.aimake.cc/api/webhook/stripe
- [ ] 选择事件:
  - checkout.session.completed
  - invoice.paid
  - invoice.payment_failed
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
- [ ] 记录 Webhook Secret

### 3. 配置 Customer Portal
- [ ] 启用 Customer Portal
- [ ] 允许取消订阅
- [ ] 允许切换套餐
- [ ] 允许更新支付方式

### 4. 获取 API Keys
- [ ] Publishable Key → 前端 .env
- [ ] Secret Key → Workers Secrets
- [ ] Webhook Secret → Workers Secrets
```

### 2.2 环境变量

```env
# 前端 .env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Workers Secrets
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_TEAM_MONTHLY=price_xxx
STRIPE_PRICE_TEAM_YEARLY=price_xxx
```

---

## 三、数据库设计

### 3.1 订阅表

```sql
-- subscriptions 表
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Stripe 信息
    stripe_customer_id    VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    stripe_price_id       VARCHAR(100),
    
    -- 订阅状态
    status          VARCHAR(20) NOT NULL DEFAULT 'none',
    -- none: 未订阅
    -- active: 有效订阅
    -- canceled: 已取消（期限内仍有效）
    -- past_due: 支付失败
    -- expired: 已过期
    
    plan            VARCHAR(20) NOT NULL DEFAULT 'free',
    interval        VARCHAR(10),  -- month | year
    
    -- 周期
    current_period_start  TIMESTAMP WITH TIME ZONE,
    current_period_end    TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end  BOOLEAN DEFAULT false,
    canceled_at           TIMESTAMP WITH TIME ZONE,
    
    -- 时间戳
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
```

### 3.2 支付记录表

```sql
-- payments 表
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    
    -- Stripe 信息
    stripe_payment_intent_id  VARCHAR(100),
    stripe_invoice_id         VARCHAR(100),
    
    -- 金额
    amount          INTEGER NOT NULL,      -- 分 (cents)
    currency        VARCHAR(3) DEFAULT 'usd',
    
    -- 状态
    status          VARCHAR(20) NOT NULL,
    -- succeeded: 成功
    -- pending: 处理中
    -- failed: 失败
    -- refunded: 已退款
    
    -- 描述
    description     TEXT,
    
    -- 时间戳
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_created ON payments(created_at);
```

---

## 四、后端实现

### 4.1 Checkout 路由

```typescript
// src/routes/subscription.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import Stripe from 'stripe';

const subscription = new Hono();

const checkoutSchema = z.object({
  plan: z.enum(['pro', 'team']),
  interval: z.enum(['month', 'year']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// POST /api/subscription/checkout
subscription.post('/checkout', zValidator('json', checkoutSchema), async (c) => {
  const user = c.get('user');
  const { plan, interval, successUrl, cancelUrl } = c.req.valid('json');
  
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
  
  // 获取或创建 Stripe Customer
  let customerId = user.stripeCustomerId;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
        clerkId: user.clerkId,
      },
    });
    customerId = customer.id;
    
    // 保存到数据库
    await updateUserStripeCustomer(c.env.DB, user.id, customerId);
  }
  
  // 获取 Price ID
  const priceId = getPriceId(c.env, plan, interval);
  
  // 创建 Checkout Session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId: user.id,
        plan,
      },
    },
    allow_promotion_codes: true,
  });
  
  return c.json({
    success: true,
    data: {
      checkoutUrl: session.url,
      sessionId: session.id,
    },
  });
});

// GET /api/subscription
subscription.get('/', async (c) => {
  const user = c.get('user');
  
  const sub = await getSubscription(c.env.DB, user.id);
  
  if (!sub || sub.status === 'none') {
    return c.json({
      success: true,
      data: {
        status: 'none',
        plan: 'free',
      },
    });
  }
  
  return c.json({
    success: true,
    data: {
      status: sub.status,
      plan: sub.plan,
      currentPeriod: {
        start: sub.currentPeriodStart,
        end: sub.currentPeriodEnd,
      },
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    },
  });
});

// POST /api/subscription/portal
subscription.post('/portal', async (c) => {
  const user = c.get('user');
  
  if (!user.stripeCustomerId) {
    return c.json({
      success: false,
      error: {
        code: 'NO_SUBSCRIPTION',
        message: '您还没有订阅',
      },
    }, 400);
  }
  
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
  
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${c.req.header('Origin')}/app/settings`,
  });
  
  return c.json({
    success: true,
    data: {
      portalUrl: session.url,
    },
  });
});

// Helper
function getPriceId(env: Env, plan: string, interval: string): string {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}LY`;
  return env[key];
}

export default subscription;
```

### 4.2 Webhook 处理

```typescript
// src/routes/webhook.ts
import { Hono } from 'hono';
import Stripe from 'stripe';

const webhook = new Hono();

// POST /api/webhook/stripe
webhook.post('/stripe', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
  const sig = c.req.header('Stripe-Signature');
  const body = await c.req.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      c.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return c.json({ error: 'Invalid signature' }, 400);
  }
  
  // 处理事件
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(c.env, event.data.object);
      break;
      
    case 'invoice.paid':
      await handleInvoicePaid(c.env, event.data.object);
      break;
      
    case 'invoice.payment_failed':
      await handlePaymentFailed(c.env, event.data.object);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(c.env, event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(c.env, event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return c.json({ received: true });
});

// 处理 Checkout 完成
async function handleCheckoutCompleted(
  env: Env,
  session: Stripe.Checkout.Session
) {
  const userId = session.subscription_data?.metadata?.userId;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }
  
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // 更新数据库
  await upsertSubscription(env.DB, {
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: subscription.items.data[0].price.id,
    status: 'active',
    plan: subscription.metadata.plan || 'pro',
    interval: subscription.items.data[0].price.recurring?.interval || 'month',
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });
  
  // 更新用户额度
  await updateUserQuota(env.DB, userId, getPlanQuota(subscription.metadata.plan));
  
  console.log(`Subscription created for user ${userId}`);
}

// 处理发票支付成功（续费）
async function handleInvoicePaid(env: Env, invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) return;
  
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // 获取用户 ID
  const sub = await getSubscriptionByStripeId(env.DB, subscriptionId);
  if (!sub) return;
  
  // 更新周期
  await updateSubscriptionPeriod(env.DB, sub.userId, {
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    status: 'active',
  });
  
  // 重置月度额度
  await resetUserQuota(env.DB, sub.userId);
  
  // 记录支付
  await createPayment(env.DB, {
    userId: sub.userId,
    subscriptionId: sub.id,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    description: `Subscription renewal - ${sub.plan}`,
  });
  
  console.log(`Invoice paid for user ${sub.userId}`);
}

// 处理支付失败
async function handlePaymentFailed(env: Env, invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;
  
  const sub = await getSubscriptionByStripeId(env.DB, subscriptionId);
  if (!sub) return;
  
  // 更新状态为 past_due
  await updateSubscriptionStatus(env.DB, sub.userId, 'past_due');
  
  // TODO: 发送邮件通知用户
  console.log(`Payment failed for user ${sub.userId}`);
}

// 处理订阅更新
async function handleSubscriptionUpdated(
  env: Env,
  subscription: Stripe.Subscription
) {
  const sub = await getSubscriptionByStripeId(env.DB, subscription.id);
  if (!sub) return;
  
  await updateSubscription(env.DB, sub.userId, {
    status: mapStripeStatus(subscription.status),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });
  
  console.log(`Subscription updated for user ${sub.userId}`);
}

// 处理订阅删除
async function handleSubscriptionDeleted(
  env: Env,
  subscription: Stripe.Subscription
) {
  const sub = await getSubscriptionByStripeId(env.DB, subscription.id);
  if (!sub) return;
  
  // 降级为免费版
  await updateSubscription(env.DB, sub.userId, {
    status: 'expired',
    plan: 'free',
  });
  
  await updateUserQuota(env.DB, sub.userId, getPlanQuota('free'));
  
  console.log(`Subscription deleted for user ${sub.userId}`);
}

// 映射 Stripe 状态
function mapStripeStatus(status: Stripe.Subscription.Status): string {
  const map: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'pending',
    incomplete_expired: 'expired',
    trialing: 'active',
  };
  return map[status] || 'none';
}

// 获取套餐额度（秒）
function getPlanQuota(plan: string): number {
  const quotas: Record<string, number> = {
    free: 600,       // 10 分钟
    pro: 18000,      // 300 分钟
    team: 999999,    // 无限
  };
  return quotas[plan] || 600;
}

export default webhook;
```

---

## 五、前端实现

### 5.1 定价页面

```tsx
// src/pages/Pricing/index.tsx
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

const plans = [
  {
    id: 'free',
    name: '免费版',
    price: { month: 0, year: 0 },
    quota: '10 分钟/月',
    features: [
      '基础音色',
      'MP3 下载',
      '标准生成速度',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { month: 19, year: 190 },
    quota: '300 分钟/月',
    features: [
      '全部音色',
      'MP3 + WAV 下载',
      '播客对话生成',
      '优先生成速度',
      '邮件支持',
    ],
    popular: true,
  },
  {
    id: 'team',
    name: '团队版',
    price: { month: 99, year: 990 },
    quota: '无限',
    features: [
      '所有 Pro 功能',
      'API 接入',
      '多成员协作',
      '专属客服',
      '自定义音色（即将推出）',
    ],
  },
];

export function PricingPage() {
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState<string | null>(null);
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;
    
    if (!isSignedIn) {
      navigate('/sign-in?redirect=/pricing');
      return;
    }
    
    setLoading(planId);
    
    try {
      const { data } = await api.post('/subscription/checkout', {
        plan: planId,
        interval,
        successUrl: `${window.location.origin}/app?upgrade=success`,
        cancelUrl: window.location.href,
      });
      
      // 跳转到 Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      // 显示错误提示
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">选择适合您的套餐</h1>
        <p className="text-gray-600 mb-8">随时升级或降级，无隐藏费用</p>
        
        {/* 月付/年付切换 */}
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          <button
            className={`px-4 py-2 rounded-md ${
              interval === 'month' ? 'bg-white shadow' : ''
            }`}
            onClick={() => setInterval('month')}
          >
            月付
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              interval === 'year' ? 'bg-white shadow' : ''
            }`}
            onClick={() => setInterval('year')}
          >
            年付 <span className="text-green-600 text-sm">省 17%</span>
          </button>
        </div>
      </div>
      
      {/* 价格卡片 */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl p-8 ${
              plan.popular
                ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-2'
                : 'bg-white border'
            }`}
          >
            {plan.popular && (
              <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
                最受欢迎
              </span>
            )}
            
            <h3 className="text-xl font-bold mt-4">{plan.name}</h3>
            
            <div className="mt-4">
              <span className="text-4xl font-bold">
                ${plan.price[interval]}
              </span>
              {plan.id !== 'free' && (
                <span className="text-sm opacity-80">
                  /{interval === 'month' ? '月' : '年'}
                </span>
              )}
            </div>
            
            <p className="mt-2 opacity-80">{plan.quota}</p>
            
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckIcon />
                  {feature}
                </li>
              ))}
            </ul>
            
            <button
              className={`w-full mt-8 py-3 rounded-lg font-medium ${
                plan.popular
                  ? 'bg-white text-blue-600 hover:bg-gray-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id}
            >
              {loading === plan.id ? '处理中...' : 
               plan.id === 'free' ? '当前套餐' : '立即订阅'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5.2 订阅管理 Hook

```typescript
// src/hooks/useSubscription.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

interface Subscription {
  status: 'none' | 'active' | 'canceled' | 'past_due';
  plan: 'free' | 'pro' | 'team';
  currentPeriod?: {
    start: string;
    end: string;
  };
  cancelAtPeriodEnd?: boolean;
}

export function useSubscription() {
  const queryClient = useQueryClient();
  
  // 获取订阅状态
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await api.get<Subscription>('/subscription');
      return res.data;
    },
  });
  
  // 创建 Checkout
  const checkoutMutation = useMutation({
    mutationFn: async (params: {
      plan: 'pro' | 'team';
      interval: 'month' | 'year';
    }) => {
      const res = await api.post('/subscription/checkout', {
        ...params,
        successUrl: `${window.location.origin}/app?upgrade=success`,
        cancelUrl: window.location.href,
      });
      return res.data;
    },
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
  });
  
  // 打开 Customer Portal
  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/subscription/portal');
      return res.data;
    },
    onSuccess: (data) => {
      window.location.href = data.portalUrl;
    },
  });
  
  // 刷新订阅状态
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
  };
  
  return {
    subscription,
    isLoading,
    isPro: subscription?.plan === 'pro' || subscription?.plan === 'team',
    isTeam: subscription?.plan === 'team',
    checkout: checkoutMutation.mutate,
    openPortal: portalMutation.mutate,
    refresh,
  };
}
```

### 5.3 升级提示组件

```tsx
// src/components/shared/UpgradePrompt.tsx
import { useSubscription } from '@/hooks/useSubscription';

interface UpgradePromptProps {
  feature: string;
  requiredPlan?: 'pro' | 'team';
}

export function UpgradePrompt({ feature, requiredPlan = 'pro' }: UpgradePromptProps) {
  const { checkout, isPro } = useSubscription();
  
  if (isPro) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">升级解锁 {feature}</h4>
          <p className="text-sm opacity-80">
            升级到 {requiredPlan === 'pro' ? 'Pro' : '团队版'} 套餐使用此功能
          </p>
        </div>
        <button
          onClick={() => checkout({ plan: requiredPlan, interval: 'month' })}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
        >
          立即升级
        </button>
      </div>
    </div>
  );
}
```

### 5.4 额度不足提示

```tsx
// src/components/shared/QuotaExceededModal.tsx
import { Dialog } from '@headlessui/react';
import { useSubscription } from '@/hooks/useSubscription';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function QuotaExceededModal({ isOpen, onClose }: Props) {
  const { checkout, subscription } = useSubscription();
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-6 max-w-md w-full">
          <Dialog.Title className="text-xl font-bold">
            额度已用完
          </Dialog.Title>
          
          <p className="mt-2 text-gray-600">
            您本月的 {subscription?.plan === 'free' ? '10 分钟' : '300 分钟'} 额度已用完。
            升级套餐获取更多额度。
          </p>
          
          <div className="mt-6 space-y-3">
            <button
              onClick={() => checkout({ plan: 'pro', interval: 'month' })}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
            >
              升级到 Pro ($19/月)
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 border rounded-lg"
            >
              下月再说
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-500 text-center">
            额度将于 {new Date(subscription?.currentPeriod?.end || '').toLocaleDateString()} 重置
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
```

---

## 六、测试

### 6.1 Stripe 测试卡号

```markdown
## 测试卡号

| 场景 | 卡号 |
|------|------|
| 成功支付 | 4242 4242 4242 4242 |
| 需要验证 | 4000 0025 0000 3155 |
| 支付失败 | 4000 0000 0000 9995 |
| 过期卡 | 4000 0000 0000 0069 |

其他字段:
- 有效期: 任意未来日期，如 12/34
- CVC: 任意 3 位数，如 123
- 邮编: 任意 5 位数，如 12345
```

### 6.2 Webhook 本地测试

```bash
# 安装 Stripe CLI
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发 Webhook 到本地
stripe listen --forward-to localhost:8787/api/webhook/stripe

# 触发测试事件
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger customer.subscription.updated
```

### 6.3 E2E 测试

```typescript
// tests/e2e/subscription.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Subscription Flow', () => {
  test('should redirect to Stripe checkout', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/pricing');
    
    // 选择 Pro 套餐
    await page.click('text=立即订阅');
    
    // 验证跳转到 Stripe
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
  });
  
  test('should show upgrade prompt when quota exceeded', async ({ page }) => {
    await loginAsTestUser(page);
    await setUserQuotaToZero();  // 测试 helper
    
    await page.goto('/app/create');
    await page.fill('textarea', '测试文本');
    await page.click('button:has-text("生成")');
    
    // 应该显示升级提示
    await expect(page.locator('text=额度已用完')).toBeVisible();
  });
});
```

---

## 七、检查清单

```markdown
## 支付集成检查清单

### Stripe 配置
- [ ] 创建产品和价格
- [ ] 配置 Webhook
- [ ] 启用 Customer Portal
- [ ] 配置测试模式

### 后端实现
- [ ] Checkout Session 创建
- [ ] Webhook 签名验证
- [ ] 处理 checkout.session.completed
- [ ] 处理 invoice.paid
- [ ] 处理 subscription.updated
- [ ] 处理 subscription.deleted

### 数据库
- [ ] subscriptions 表
- [ ] payments 表
- [ ] 索引优化

### 前端实现
- [ ] 定价页面
- [ ] Checkout 跳转
- [ ] 订阅状态显示
- [ ] Customer Portal 入口
- [ ] 升级提示组件
- [ ] 额度不足弹窗

### 测试
- [ ] 测试卡号验证
- [ ] Webhook 本地测试
- [ ] E2E 测试
- [ ] 退款流程测试
```

---

*完整的 Stripe 支付集成方案！*
