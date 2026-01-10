# 落地页目录结构设计

## 📁 推荐目录结构

```
aimake/
├── website/                   # 落地页根目录 (部署到 CF Pages)
│   ├── index.html             # 主页
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css       # 主样式
│   │   │   └── animations.css # 动画效果
│   │   ├── js/
│   │   │   ├── main.js        # 主逻辑
│   │   │   └── analytics.js   # 统计追踪
│   │   ├── images/
│   │   │   ├── logo.svg       # AIMake Logo
│   │   │   ├── hero-bg.svg    # Hero 背景
│   │   │   ├── icons/         # 功能图标
│   │   │   └── avatars/       # 用户头像占位
│   │   ├── audio/
│   │   │   ├── demo-podcast.mp3
│   │   │   ├── demo-audiobook.mp3
│   │   │   ├── demo-voiceover.mp3
│   │   │   └── demo-tutorial.mp3
│   │   └── fonts/             # (可选) 本地字体
│   ├── _headers               # CF Pages 响应头配置
│   ├── _redirects             # 重定向规则
│   └── robots.txt             # SEO
│
├── frontend/                  # (未来) React 应用
├── api/                       # (未来) Cloudflare Workers
└── docs/                      # 设计文档
```

---

## 🎨 文件拆分方案

### 1. index.html (核心结构)

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- SEO Meta Tags -->
    <title>AIMake - AI 语音内容生成 | 播客、有声书、配音</title>
    <meta name="description" content="..." />

    <!-- Open Graph -->
    <meta property="og:title" content="AIMake - AI 语音内容生成" />
    <meta property="og:image" content="/assets/images/og-image.png" />

    <!-- Styles -->
    <link rel="stylesheet" href="/assets/css/main.css" />

    <!-- Preload Critical Resources -->
    <link rel="preload" href="/assets/fonts/Inter.woff2" as="font" />
  </head>
  <body>
    <!-- Content -->

    <script src="/assets/js/main.js" defer></script>
  </body>
</html>
```

### 2. assets/css/main.css (样式)

- 提取当前 `<style>` 标签内容
- 添加 Tailwind CSS 本地构建版本
- 自定义 CSS 变量

### 3. assets/js/main.js (交互)

```javascript
// 平滑滚动
// 表单验证
// 音频播放器控制
// FAQ 展开/折叠
```

### 4. 音频文件占位

- 使用真实 TTS 生成的短音频（10-30秒）
- 或使用占位音频 + "即将上线"提示

---

## 🚀 Cloudflare Pages 部署配置

### 部署设置

| 配置项       | 值              |
| ------------ | --------------- |
| 构建命令     | (留空 - 纯静态) |
| 构建输出目录 | `landing`       |
| 根目录       | `/`             |
| Node 版本    | (不需要)        |

### \_headers 配置

```
# website/_headers

/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: interest-cohort=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

### \_redirects 配置

```
# website/_redirects

# 重定向示例
/start    /index.html#pricing   301
/demo     /index.html#demo      301

# SPA 回退 (未来)
# /*        /index.html           200
```

---

## 📦 静态资源准备清单

### 必需资源

- [ ] Logo SVG (透明背景)
- [ ] Favicon (16x16, 32x32, 192x192)
- [ ] 4 个音频演示文件 (MP3, 压缩到 < 500KB)
- [ ] OG Image (1200x630px)

### 可选资源

- [ ] 功能图标 SVG (替换当前内联 SVG)
- [ ] 用户头像占位图 (或使用 DiceBear API)
- [ ] 背景纹理/渐变图片

### 字体策略

**推荐**：继续使用 Google Fonts CDN

- 理由：自动子集化、全球 CDN、免维护
- 性能影响：< 50ms (可接受)

**备选**：本地字体

- 下载 Inter 字体 woff2 文件
- 使用 `font-display: swap`

---

## 🔧 优化实施步骤

### 阶段 1：目录重构 (30 分钟)

1. 创建 `website/` 目录结构
2. 拆分 HTML/CSS/JS
3. 添加 `_headers` 和 `robots.txt`
4. 更新资源引用路径

### 阶段 2：资源准备 (1 小时)

1. 设计简单 Logo (或使用文字 Logo)
2. 生成 4 个音频演示 (使用腾讯云 TTS 免费额度)
3. 创建 Favicon 和 OG Image

### 阶段 3：CF Pages 部署 (15 分钟)

1. 推送代码到 GitHub
2. 连接 CF Pages 到仓库
3. 配置构建设置
4. 绑定自定义域名 (可选)

### 阶段 4：SEO & 分析 (30 分钟)

1. 添加 schema.org JSON-LD
2. 集成 Cloudflare Web Analytics (免费)
3. 提交 sitemap.xml

---

## 🎯 关键 UI/UX 改进建议

### 高优先级

1. **音频演示可播放**
   - 生成真实音频文件
   - 添加播放/暂停/进度控制

2. **Hero 区域交互**
   - 演示卡片可实时生成（或假装生成）
   - 音色选择器实时预览

3. **移动端优化**
   - 导航栏汉堡菜单
   - CTA 按钮固定在底部

### 中优先级

4. **视觉增强**
   - 添加渐入动画 (Intersection Observer)
   - 卡片 hover 效果更明显
   - 添加微妙的背景粒子效果

5. **信任元素**
   - 合作伙伴 Logo (Tencent Cloud, OpenAI, Stripe)
   - 真实用户评价（或生成式占位）
   - 安全徽章

### 低优先级

6. **高级功能**
   - 深色模式切换
   - 多语言切换 (中/英)
   - 音频波形可视化

---

## 📊 性能目标

| 指标     | 目标    | 当前   |
| -------- | ------- | ------ |
| LCP      | < 2.5s  | ?      |
| FID      | < 100ms | ?      |
| CLS      | < 0.1   | ?      |
| 页面大小 | < 500KB | ~200KB |
| 请求数   | < 20    | ~5     |

使用 [PageSpeed Insights](https://pagespeed.web.dev/) 测试。

---

## 🔗 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Web Vitals](https://web.dev/vitals/)
- [腾讯云 TTS](https://cloud.tencent.com/product/tts) - 免费额度生成演示音频

---

**最后更新**: 2026-01-10 **下一步**: 执行阶段 1 - 目录重构
