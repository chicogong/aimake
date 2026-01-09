# AIMake SEO 与数据分析设计

> 创建日期: 2026-01-09
> 覆盖 SEO 优化和用户行为分析

---

## 一、SEO 优化

### 1.1 Meta 标签规范

```tsx
// components/SEO.tsx

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const DEFAULT_SEO = {
  title: 'AIMake - AI 语音内容生成平台',
  description: '用 AI 快速生成播客、有声书、视频配音、教育内容。输入文字，获得专业音频。免费试用，无需信用卡。',
  keywords: ['AI语音', 'TTS', '文字转语音', '播客生成', '有声书', '配音'],
  image: 'https://aimake.cc/og-image.png',
  url: 'https://aimake.cc',
};

export function SEO({ 
  title, 
  description, 
  keywords,
  image,
  url,
  type = 'website'
}: SEOProps) {
  const seo = {
    title: title ? `${title} | AIMake` : DEFAULT_SEO.title,
    description: description || DEFAULT_SEO.description,
    keywords: keywords || DEFAULT_SEO.keywords,
    image: image || DEFAULT_SEO.image,
    url: url || DEFAULT_SEO.url,
  };

  return (
    <Helmet>
      {/* 基础 Meta */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(', ')} />
      <link rel="canonical" href={seo.url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content="AIMake" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      
      {/* 其他 */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="AIMake" />
    </Helmet>
  );
}
```

### 1.2 各页面 SEO 配置

| 页面 | Title | Description |
|------|-------|-------------|
| 首页 | AIMake - AI 语音内容生成平台 | 用 AI 快速生成播客、有声书、视频配音。输入文字，获得专业音频。 |
| 定价 | 定价 \| AIMake | AIMake 定价方案。免费版每月 10 分钟，Pro 版 $19/月享 300 分钟。 |
| 登录 | 登录 \| AIMake | 登录 AIMake，开始创作 AI 语音内容。 |
| 创建 | 创建音频 \| AIMake | 输入文字，选择音色，一键生成高质量语音。 |
| 帮助 | 帮助中心 \| AIMake | AIMake 使用指南、常见问题解答。 |

### 1.3 结构化数据 (JSON-LD)

```tsx
// components/StructuredData.tsx

export function WebsiteStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'AIMake',
    'description': 'AI 语音内容生成平台',
    'url': 'https://aimake.cc',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'ratingCount': '128',
    },
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  );
}

export function FAQStructuredData({ faqs }: { faqs: Array<{q: string, a: string}> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a,
      },
    })),
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  );
}
```

### 1.4 Sitemap

```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aimake.cc/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://aimake.cc/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://aimake.cc/help</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://aimake.cc/login</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://aimake.cc/signup</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

### 1.5 Robots.txt

```txt
# public/robots.txt
User-agent: *
Allow: /
Disallow: /app/
Disallow: /api/

Sitemap: https://aimake.cc/sitemap.xml
```

---

## 二、数据分析

### 2.1 分析工具选型

| 工具 | 用途 | 成本 |
|------|------|------|
| **Plausible** | 页面访问、转化率 | $9/月 (推荐，隐私友好) |
| Google Analytics 4 | 全面分析 | 免费 |
| Mixpanel | 事件分析、漏斗 | 免费层 |
| PostHog | 产品分析、Session 回放 | 免费层 |

### 2.2 事件追踪设计

```typescript
// src/lib/analytics.ts

type EventName = 
  // 页面访问
  | 'page_view'
  // 认证
  | 'signup_start'
  | 'signup_complete'
  | 'login'
  | 'logout'
  // 创建
  | 'create_start'
  | 'voice_selected'
  | 'generate_click'
  | 'generate_success'
  | 'generate_error'
  // 音频
  | 'audio_play'
  | 'audio_download'
  | 'audio_delete'
  // 付费
  | 'pricing_view'
  | 'upgrade_click'
  | 'checkout_start'
  | 'payment_success'
  | 'payment_failed'
  // 其他
  | 'share_click'
  | 'help_view';

interface EventProperties {
  // 通用属性
  page?: string;
  source?: string;
  
  // 创建相关
  voice_id?: string;
  text_length?: number;
  duration?: number;
  
  // 付费相关
  plan?: 'pro' | 'team';
  billing_cycle?: 'monthly' | 'yearly';
  amount?: number;
  
  // 错误相关
  error_code?: string;
  error_message?: string;
}

class Analytics {
  track(event: EventName, properties?: EventProperties) {
    // Plausible
    if (window.plausible) {
      window.plausible(event, { props: properties });
    }
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event, properties);
    }
    
    // 开发环境日志
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }
  }
  
  identify(userId: string, traits?: Record<string, any>) {
    // 用于付费分析工具
  }
  
  page(pageName: string) {
    this.track('page_view', { page: pageName });
  }
}

export const analytics = new Analytics();
```

### 2.3 关键事件埋点

```tsx
// 注册完成
analytics.track('signup_complete', {
  source: 'landing_page',
});

// 生成音频
analytics.track('generate_click', {
  voice_id: selectedVoice,
  text_length: text.length,
});

analytics.track('generate_success', {
  voice_id: selectedVoice,
  text_length: text.length,
  duration: result.duration,
});

// 升级付费
analytics.track('upgrade_click', {
  plan: 'pro',
  billing_cycle: 'monthly',
  source: 'quota_bar',
});

// 支付成功
analytics.track('payment_success', {
  plan: 'pro',
  billing_cycle: 'monthly',
  amount: 19,
});
```

### 2.4 页面埋点 Hook

```tsx
// hooks/usePageTracking.ts

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';

export function usePageTracking() {
  const location = useLocation();
  
  useEffect(() => {
    analytics.page(location.pathname);
  }, [location.pathname]);
}

// 在 App.tsx 中使用
function App() {
  usePageTracking();
  return <Routes />;
}
```

---

## 三、转化漏斗

### 3.1 核心漏斗

```
访问首页
    ↓ (点击注册)
注册页面
    ↓ (完成注册)
首次创建
    ↓ (生成音频)
生成成功
    ↓ (额度用完)
查看定价
    ↓ (点击升级)
支付页面
    ↓ (完成支付)
付费用户
```

### 3.2 漏斗追踪

```typescript
// 定义漏斗步骤
const SIGNUP_FUNNEL = [
  'landing_page_view',
  'signup_start',
  'signup_complete',
  'first_generate',
  'pricing_view',
  'checkout_start',
  'payment_success',
];

// 每个步骤追踪
analytics.track('landing_page_view');
analytics.track('signup_start');
analytics.track('signup_complete');
// ...
```

---

## 四、自定义仪表盘指标

### 4.1 核心指标 (KPIs)

| 指标 | 定义 | 目标 |
|------|------|------|
| **DAU** | 日活跃用户 | 增长 10%/月 |
| **注册转化率** | 注册数 / 访客数 | > 5% |
| **付费转化率** | 付费用户 / 注册用户 | > 3% |
| **MRR** | 月经常性收入 | 增长 20%/月 |
| **Churn Rate** | 月流失率 | < 5% |
| **生成量** | 日均生成分钟数 | - |

### 4.2 产品指标

| 指标 | 定义 |
|------|------|
| 首次生成时间 | 注册到首次生成的时间 |
| 生成成功率 | 成功生成 / 总尝试 |
| 平均生成时长 | 每次生成的音频时长 |
| 功能使用率 | TTS vs 播客的使用比例 |
| 留存率 | 7日/30日回访率 |

---

## 五、A/B 测试

### 5.1 测试框架

```typescript
// src/lib/experiment.ts

interface Experiment {
  id: string;
  variants: string[];
  weights?: number[];  // 默认均分
}

const experiments: Record<string, Experiment> = {
  'hero-cta-text': {
    id: 'hero-cta-text',
    variants: ['立即体验', '免费开始', '开始创作'],
  },
  'pricing-layout': {
    id: 'pricing-layout',
    variants: ['three-column', 'two-column'],
  },
};

export function getVariant(experimentId: string): string {
  const experiment = experiments[experimentId];
  if (!experiment) return '';
  
  // 从 localStorage 读取已分配的变体
  const stored = localStorage.getItem(`exp_${experimentId}`);
  if (stored) return stored;
  
  // 随机分配
  const variant = experiment.variants[
    Math.floor(Math.random() * experiment.variants.length)
  ];
  
  localStorage.setItem(`exp_${experimentId}`, variant);
  
  // 追踪实验分组
  analytics.track('experiment_assigned', {
    experiment_id: experimentId,
    variant,
  });
  
  return variant;
}
```

### 5.2 使用示例

```tsx
function HeroCTA() {
  const ctaText = getVariant('hero-cta-text');
  
  return (
    <button onClick={() => {
      analytics.track('hero_cta_click', {
        experiment_id: 'hero-cta-text',
        variant: ctaText,
      });
    }}>
      {ctaText}
    </button>
  );
}
```

---

## 六、错误监控

### 6.1 Sentry 配置

```typescript
// src/lib/sentry.ts

import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'api.aimake.cc'],
    }),
    new Sentry.Replay(),
  ],
  
  tracesSampleRate: 0.1,  // 10% 性能追踪
  replaysSessionSampleRate: 0.1,  // 10% Session 回放
  replaysOnErrorSampleRate: 1.0,  // 错误时 100% 回放
});

// 用户识别
export function identifyUser(user: { id: string; email: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
}

// 自定义错误上报
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}
```

### 6.2 错误边界

```tsx
// components/ErrorBoundary.tsx

import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <SentryErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">出错了</h1>
            <p className="text-gray-600 mb-6">抱歉，发生了意外错误</p>
            <button 
              onClick={resetError}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg"
            >
              重试
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </SentryErrorBoundary>
  );
}
```

---

## 七、性能监控

### 7.1 Web Vitals

```typescript
// src/lib/vitals.ts

import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: { name: string; value: number }) {
  analytics.track('web_vital', {
    metric_name: metric.name,
    metric_value: Math.round(metric.value),
  });
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

### 7.2 性能目标

| 指标 | 目标 | 说明 |
|------|------|------|
| LCP | < 2.5s | 最大内容绘制 |
| FID | < 100ms | 首次输入延迟 |
| CLS | < 0.1 | 累积布局偏移 |
| TTFB | < 600ms | 首字节时间 |

---

## 八、隐私合规

### 8.1 Cookie 同意

```tsx
// components/CookieConsent.tsx

export function CookieConsent() {
  const [shown, setShown] = useState(false);
  
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setShown(true);
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShown(false);
    // 初始化分析工具
    initAnalytics();
  };
  
  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShown(false);
  };
  
  if (!shown) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <p>
          我们使用 Cookie 来改善您的体验。
          <a href="/privacy" className="underline ml-1">了解更多</a>
        </p>
        <div className="flex gap-4">
          <button onClick={handleDecline} className="text-gray-400">
            拒绝
          </button>
          <button 
            onClick={handleAccept}
            className="bg-primary-500 px-4 py-2 rounded-lg"
          >
            接受
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 8.2 数据收集声明

在隐私政策中说明：
- 收集哪些数据
- 如何使用数据
- 第三方服务 (Sentry, Analytics)
- 用户权利 (删除、导出)

---

*数据驱动产品增长！*
