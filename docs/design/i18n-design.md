# AIMake 国际化 (i18n) 设计

> 创建日期: 2026-01-09
> 支持多语言的技术方案

---

## 一、语言支持计划

### 1.1 阶段规划

| 阶段 | 语言 | 优先级 | 时间 |
|------|------|--------|------|
| Phase 1 | 简体中文 (zh-CN)、英文 (en) | P0 | MVP |
| Phase 2 | 繁体中文 (zh-TW)、日语 (ja) | P1 | +1 月 |
| Phase 3 | 韩语 (ko)、西班牙语 (es) | P2 | +3 月 |

### 1.2 默认语言

```typescript
const DEFAULT_LOCALE = 'zh-CN';
const SUPPORTED_LOCALES = ['zh-CN', 'en', 'zh-TW', 'ja'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];
```

---

## 二、技术方案

### 2.1 库选型

| 方案 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| **react-i18next** | 生态成熟，功能丰富 | 包较大 | ✅ 推荐 |
| next-intl | Next.js 原生支持 | 仅限 Next.js | - |
| FormatJS | 标准化好 | 配置复杂 | - |

### 2.2 安装配置

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### 2.3 目录结构

```
src/
├── i18n/
│   ├── index.ts            # i18n 配置
│   ├── locales/
│   │   ├── zh-CN/
│   │   │   ├── common.json     # 通用文案
│   │   │   ├── auth.json       # 认证相关
│   │   │   ├── create.json     # 创建页面
│   │   │   ├── library.json    # 音频库
│   │   │   ├── settings.json   # 设置页面
│   │   │   ├── pricing.json    # 定价页面
│   │   │   └── errors.json     # 错误消息
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   └── ...
│   │   └── zh-TW/
│   │       └── ...
│   └── types.ts            # 类型定义
```

---

## 三、配置实现

### 3.1 i18n 初始化

```typescript
// src/i18n/index.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言包
import zhCN from './locales/zh-CN';
import en from './locales/en';

export const defaultNS = 'common';
export const resources = {
  'zh-CN': zhCN,
  'en': en,
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'zh-CN',
    supportedLngs: ['zh-CN', 'en', 'zh-TW', 'ja'],
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'aimake-language',
    },
  });

export default i18n;
```

### 3.2 类型安全

```typescript
// src/i18n/types.ts

import 'i18next';
import type zhCN from './locales/zh-CN';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: typeof zhCN;
  }
}
```

### 3.3 App 入口

```tsx
// src/main.tsx

import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 四、翻译文件

### 4.1 中文 (zh-CN)

```json
// src/i18n/locales/zh-CN/common.json
{
  "appName": "AIMake",
  "tagline": "AI 语音内容生成平台",
  
  "nav": {
    "features": "功能",
    "useCases": "场景",
    "pricing": "价格",
    "help": "帮助",
    "login": "登录",
    "signup": "免费试用",
    "logout": "退出登录"
  },
  
  "actions": {
    "save": "保存",
    "cancel": "取消",
    "confirm": "确认",
    "delete": "删除",
    "edit": "编辑",
    "copy": "复制",
    "download": "下载",
    "share": "分享",
    "back": "返回",
    "next": "下一步",
    "submit": "提交",
    "retry": "重试",
    "loading": "加载中...",
    "generating": "生成中..."
  },
  
  "time": {
    "now": "刚刚",
    "minutesAgo": "{{count}}分钟前",
    "hoursAgo": "{{count}}小时前",
    "yesterday": "昨天",
    "daysAgo": "{{count}}天前"
  },
  
  "units": {
    "minutes": "分钟",
    "seconds": "秒",
    "characters": "字符"
  }
}
```

```json
// src/i18n/locales/zh-CN/auth.json
{
  "login": {
    "title": "欢迎回来",
    "email": "邮箱",
    "password": "密码",
    "rememberMe": "记住我",
    "forgotPassword": "忘记密码？",
    "submit": "登录",
    "noAccount": "还没有账号？",
    "signupLink": "立即注册",
    "or": "或",
    "withGoogle": "使用 Google 登录",
    "withGithub": "使用 GitHub 登录"
  },
  
  "signup": {
    "title": "创建你的账号",
    "username": "用户名",
    "email": "邮箱",
    "password": "密码",
    "passwordHint": "密码至少 8 位，包含字母和数字",
    "terms": "我已阅读并同意",
    "termsLink": "服务条款",
    "and": "和",
    "privacyLink": "隐私政策",
    "submit": "创建账号",
    "hasAccount": "已有账号？",
    "loginLink": "立即登录"
  },
  
  "forgotPassword": {
    "title": "重置密码",
    "description": "输入你的邮箱，我们会发送重置链接",
    "email": "邮箱",
    "submit": "发送重置链接",
    "backToLogin": "返回登录"
  },
  
  "verifyEmail": {
    "title": "验证你的邮箱",
    "description": "我们已发送验证邮件到",
    "instruction": "请点击邮件中的链接完成验证",
    "resend": "重新发送邮件",
    "changeEmail": "更换邮箱地址"
  }
}
```

```json
// src/i18n/locales/zh-CN/create.json
{
  "title": "创建音频",
  
  "mode": {
    "title": "选择创建模式",
    "tts": {
      "name": "文字转语音",
      "description": "输入文字，生成音频"
    },
    "podcast": {
      "name": "播客对话",
      "description": "输入主题，生成双人对话"
    }
  },
  
  "tts": {
    "inputLabel": "输入文本",
    "inputPlaceholder": "在这里输入你想要转换的文字...",
    "charCount": "{{current}} / {{max}} 字",
    "voiceLabel": "选择音色",
    "speedLabel": "语速",
    "emotionLabel": "情感",
    "generateBtn": "生成音频",
    "estimatedDuration": "预计时长: {{duration}}"
  },
  
  "voice": {
    "preview": "试听",
    "stop": "停止",
    "premium": "Pro",
    "male": "男声",
    "female": "女声",
    "neutral": "中性"
  },
  
  "emotion": {
    "neutral": "自然",
    "happy": "开心",
    "sad": "悲伤",
    "excited": "激动",
    "calm": "平静"
  },
  
  "result": {
    "title": "生成结果",
    "downloadMp3": "下载 MP3",
    "downloadWav": "下载 WAV",
    "saveToLibrary": "保存到音频库"
  },
  
  "quota": {
    "remaining": "本月额度: {{remaining}} 剩余",
    "used": "{{used}} / {{limit}}",
    "resetAt": "{{date}} 重置",
    "upgrade": "升级 Pro"
  }
}
```

```json
// src/i18n/locales/zh-CN/errors.json
{
  "generic": "出错了，请重试",
  "network": "网络连接失败，请检查网络",
  "unauthorized": "请先登录",
  "forbidden": "没有权限访问",
  "notFound": "资源不存在",
  "serverError": "服务器错误，请稍后重试",
  
  "auth": {
    "invalidCredentials": "邮箱或密码错误",
    "emailExists": "该邮箱已被注册",
    "weakPassword": "密码强度不够",
    "emailNotVerified": "请先验证邮箱"
  },
  
  "quota": {
    "exceeded": "额度已用完",
    "insufficient": "额度不足，需要 {{required}} 秒，剩余 {{remaining}} 秒"
  },
  
  "tts": {
    "textTooLong": "文本过长，最多 {{max}} 字符",
    "textEmpty": "请输入文本",
    "generateFailed": "生成失败，请重试",
    "voiceUnavailable": "该音色暂不可用"
  }
}
```

### 4.2 英文 (en)

```json
// src/i18n/locales/en/common.json
{
  "appName": "AIMake",
  "tagline": "AI Voice Content Generator",
  
  "nav": {
    "features": "Features",
    "useCases": "Use Cases",
    "pricing": "Pricing",
    "help": "Help",
    "login": "Log in",
    "signup": "Get Started Free",
    "logout": "Log out"
  },
  
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "copy": "Copy",
    "download": "Download",
    "share": "Share",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "retry": "Retry",
    "loading": "Loading...",
    "generating": "Generating..."
  },
  
  "time": {
    "now": "Just now",
    "minutesAgo": "{{count}} minute ago",
    "minutesAgo_plural": "{{count}} minutes ago",
    "hoursAgo": "{{count}} hour ago",
    "hoursAgo_plural": "{{count}} hours ago",
    "yesterday": "Yesterday",
    "daysAgo": "{{count}} day ago",
    "daysAgo_plural": "{{count}} days ago"
  },
  
  "units": {
    "minutes": "min",
    "seconds": "sec",
    "characters": "chars"
  }
}
```

```json
// src/i18n/locales/en/create.json
{
  "title": "Create Audio",
  
  "mode": {
    "title": "Choose Creation Mode",
    "tts": {
      "name": "Text to Speech",
      "description": "Convert text to audio"
    },
    "podcast": {
      "name": "Podcast Dialogue",
      "description": "Generate two-person conversation"
    }
  },
  
  "tts": {
    "inputLabel": "Enter Text",
    "inputPlaceholder": "Enter the text you want to convert to speech...",
    "charCount": "{{current}} / {{max}} characters",
    "voiceLabel": "Select Voice",
    "speedLabel": "Speed",
    "emotionLabel": "Emotion",
    "generateBtn": "Generate Audio",
    "estimatedDuration": "Estimated duration: {{duration}}"
  },
  
  "voice": {
    "preview": "Preview",
    "stop": "Stop",
    "premium": "Pro",
    "male": "Male",
    "female": "Female",
    "neutral": "Neutral"
  },
  
  "emotion": {
    "neutral": "Neutral",
    "happy": "Happy",
    "sad": "Sad",
    "excited": "Excited",
    "calm": "Calm"
  }
}
```

---

## 五、组件使用

### 5.1 基础用法

```tsx
import { useTranslation } from 'react-i18next';

export function CreatePage() {
  const { t } = useTranslation('create');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      
      <label>{t('tts.inputLabel')}</label>
      <textarea placeholder={t('tts.inputPlaceholder')} />
      
      <button>{t('tts.generateBtn')}</button>
    </div>
  );
}
```

### 5.2 插值

```tsx
// 简单插值
t('tts.charCount', { current: 100, max: 5000 })
// → "100 / 5000 字"

// 带复数
t('time.minutesAgo', { count: 5 })
// → "5分钟前" (zh-CN)
// → "5 minutes ago" (en)
```

### 5.3 多命名空间

```tsx
import { useTranslation } from 'react-i18next';

export function Component() {
  const { t } = useTranslation(['create', 'common']);
  
  return (
    <div>
      <h1>{t('create:title')}</h1>
      <button>{t('common:actions.save')}</button>
    </div>
  );
}
```

### 5.4 语言切换

```tsx
// components/LanguageSwitcher.tsx

import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const currentLanguage = languages.find(l => l.code === i18n.language);
  
  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="p-2 border rounded-lg"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
```

---

## 六、日期和数字格式化

### 6.1 日期格式化

```typescript
// src/utils/format.ts

import { format, formatRelative, formatDistance } from 'date-fns';
import { zhCN, enUS, zhTW, ja } from 'date-fns/locale';
import i18n from '@/i18n';

const locales: Record<string, Locale> = {
  'zh-CN': zhCN,
  'en': enUS,
  'zh-TW': zhTW,
  'ja': ja,
};

export function formatDate(date: Date | string, formatStr = 'PPP') {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { 
    locale: locales[i18n.language] || zhCN 
  });
}

export function formatRelativeTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(d, new Date(), {
    addSuffix: true,
    locale: locales[i18n.language] || zhCN,
  });
}
```

### 6.2 数字格式化

```typescript
// src/utils/format.ts

export function formatNumber(num: number) {
  return new Intl.NumberFormat(i18n.language).format(num);
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

---

## 七、RTL 支持 (可选)

如果将来支持阿拉伯语等 RTL 语言：

```tsx
// src/App.tsx

import { useTranslation } from 'react-i18next';

const rtlLanguages = ['ar', 'he'];

function App() {
  const { i18n } = useTranslation();
  const isRTL = rtlLanguages.includes(i18n.language);
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <Routes />
    </div>
  );
}
```

---

## 八、SEO 多语言

### 8.1 HTML lang 属性

```tsx
// src/components/LanguageHead.tsx

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

export function LanguageHead() {
  const { i18n } = useTranslation();
  
  return (
    <Helmet>
      <html lang={i18n.language} />
    </Helmet>
  );
}
```

### 8.2 hreflang 标签

```tsx
// 主页 SEO
<Helmet>
  <link rel="alternate" hreflang="zh-CN" href="https://aimake.cc" />
  <link rel="alternate" hreflang="en" href="https://aimake.cc/en" />
  <link rel="alternate" hreflang="x-default" href="https://aimake.cc" />
</Helmet>
```

---

## 九、翻译工作流

### 9.1 提取待翻译文本

```bash
# 使用 i18next-parser 提取
npm install -D i18next-parser

# i18next-parser.config.js
module.exports = {
  locales: ['zh-CN', 'en'],
  output: 'src/i18n/locales/$LOCALE/$NAMESPACE.json',
  input: ['src/**/*.{ts,tsx}'],
  defaultValue: (locale, namespace, key) => key,
};
```

### 9.2 翻译缺失检查

```typescript
// scripts/check-translations.ts

import zhCN from '../src/i18n/locales/zh-CN';
import en from '../src/i18n/locales/en';

function findMissingKeys(base: object, target: object, path = ''): string[] {
  const missing: string[] = [];
  
  for (const key in base) {
    const newPath = path ? `${path}.${key}` : key;
    if (!(key in target)) {
      missing.push(newPath);
    } else if (typeof base[key] === 'object') {
      missing.push(...findMissingKeys(base[key], target[key], newPath));
    }
  }
  
  return missing;
}

const missingInEn = findMissingKeys(zhCN, en);
if (missingInEn.length > 0) {
  console.log('Missing translations in en:');
  missingInEn.forEach(key => console.log(`  - ${key}`));
}
```

---

## 十、最佳实践

### 10.1 Key 命名规范

```
✅ 好的命名
- create.tts.inputLabel
- errors.quota.exceeded
- nav.pricing

❌ 避免的命名
- label1
- text
- msg
```

### 10.2 避免硬编码

```tsx
// ❌ 错误
<button>保存</button>

// ✅ 正确
<button>{t('actions.save')}</button>
```

### 10.3 变量使用

```tsx
// ❌ 字符串拼接
`剩余 ${remaining} 分钟`

// ✅ 使用插值
t('quota.remaining', { remaining })
```

---

*让产品走向国际！*
