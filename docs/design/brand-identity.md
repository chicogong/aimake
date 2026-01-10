# AIMake 品牌视觉识别系统

> 专业、现代、可信的 AI 语音内容生成平台品牌设计

---

## 📊 品牌定位

**核心价值**：简单、高效、专业 **目标用户**：内容创作者、教育工作者、企业团队
**品牌个性**：科技感、可靠、友好

---

## 🎨 Logo 设计

### 主 Logo

**文件**: `landing/assets/images/logo.svg`

**设计理念**：

- **图形符号**：声波 + AI 元素结合
  - 5 条垂直线代表声波频率
  - 虚线圆环代表 AI 智能光环
  - 渐变色彩传达科技感和活力

- **文字标识**：Space Grotesk 字体
  - "AI" 使用白色（强调技术属性）
  - "Make" 使用蓝色渐变（强调创造能力）

**使用场景**：

- 网站导航栏
- 营销材料
- 社交媒体封面

### 图标 Logo (Favicon)

**文件**: `landing/assets/images/favicon.svg`

**设计说明**：

- 简化的声波图标
- 纯图形，无文字（适配小尺寸）
- 蓝色渐变背景 + 白色声波
- 橙色光环强调 AI 属性

**使用场景**：

- 浏览器标签页图标
- 移动端应用图标
- 社交媒体头像

---

## 🎨 配色系统

### 主色调

| 颜色名称         | Hex 值    | 用途                 |
| ---------------- | --------- | -------------------- |
| **Trust Blue**   | `#2563EB` | 主品牌色、按钮、链接 |
| **Light Blue**   | `#3B82F6` | 渐变、悬停状态       |
| **Sky Blue**     | `#60A5FA` | 高光、强调           |
| **Orange**       | `#F97316` | CTA 按钮、重要操作   |
| **Light Orange** | `#FB923C` | 悬停效果             |

### 中性色

| 颜色名称      | Hex 值                  | 用途         |
| ------------- | ----------------------- | ------------ |
| **Dark Navy** | `#0A0E27`               | 深色背景主色 |
| **Dark Gray** | `#121212`               | 深色背景辅助 |
| **White**     | `#FFFFFF`               | 文字、图标   |
| **White 80%** | `rgba(255,255,255,0.8)` | 次要文字     |
| **White 60%** | `rgba(255,255,255,0.6)` | 辅助文字     |
| **White 10%** | `rgba(255,255,255,0.1)` | 毛玻璃背景   |

### 渐变色

```css
/* 主背景渐变 */
background: linear-gradient(135deg, #0a0e27 0%, #1e3a8a 50%, #0a0e27 100%);

/* Logo 蓝色渐变 */
background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);

/* CTA 按钮渐变 */
background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);

/* 橙色强调渐变 */
background: linear-gradient(90deg, #f97316 0%, #fb923c 100%);
```

---

## 🔤 字体系统

### 标题字体：Space Grotesk

**用途**：

- Logo 文字
- 页面标题 (H1-H3)
- 数字统计
- 按钮文字

**特点**：

- 几何无衬线字体
- 现代、科技感强
- 易读性高

**字重**：

- Regular (400) - 正文标题
- Medium (500) - 次要标题
- SemiBold (600) - 重要标题
- Bold (700) - Logo、Hero 标题

### 正文字体：DM Sans

**用途**：

- 正文内容
- 描述文字
- 表单标签
- 导航链接

**特点**：

- 人文主义无衬线
- 温和、易读
- 数字等宽

**字重**：

- Regular (400) - 正文
- Medium (500) - 强调文字
- Bold (700) - 粗体强调

---

## 📐 Logo 使用规范

### 最小尺寸

| 场景          | 最小宽度 | 最小高度 |
| ------------- | -------- | -------- |
| **完整 Logo** | 120px    | 36px     |
| **图标 Logo** | 24px     | 24px     |
| **Favicon**   | 16px     | 16px     |

### 安全留白区域

Logo 周围需要预留至少 **Logo 高度的 50%** 作为安全留白。

```
┌─────────────────────────────┐
│                             │  ← 留白 (0.5x)
│    ┌─────────────────┐     │
│    │    [LOGO]       │     │
│    └─────────────────┘     │
│                             │  ← 留白 (0.5x)
└─────────────────────────────┘
```

### 颜色变体

#### 1. 标准版（深色背景）

- 背景：深色 (#0A0E27 或更深)
- Logo：全彩（渐变 + 白色）
- **文件**: `logo.svg`

#### 2. 反色版（浅色背景）

- 背景：白色或浅色
- Logo：深蓝色 (#2563EB)
- **文件**：需要创建 `logo-dark.svg`

#### 3. 单色版（任何背景）

- Logo：纯白色 (#FFFFFF)
- 用于打印、水印
- **文件**：需要创建 `logo-white.svg`

### 禁止使用方式

❌ **禁止**：

- 改变 Logo 颜色（除指定变体外）
- 拉伸、挤压 Logo
- 旋转 Logo（除 90° 倍数外）
- 添加阴影、描边、特效
- 与其他品牌 Logo 过近摆放
- 在低对比度背景使用

---

## 📦 资源文件清单

### 当前已创建

✅ `landing/assets/images/logo.svg` - 主 Logo（SVG 矢量）✅ `landing/assets/images/favicon.svg` -
Favicon（SVG 矢量）

### 需要生成

⏳ **Favicon 多尺寸 PNG**

```bash
# 使用 Inkscape 或在线工具转换
favicon-16x16.png    # 16x16
favicon-32x32.png    # 32x32
favicon-192x192.png  # 192x192 (Android)
```

⏳ **Apple Touch Icon**

```bash
apple-touch-icon.png  # 180x180
```

⏳ **ICO 格式 Favicon**

```bash
favicon.ico  # 包含 16x16 和 32x32
```

⏳ **OG Image（社交分享）**

```bash
og-image.png  # 1200x630
# 内容: Logo + "AI 语音内容生成" + 背景渐变
```

⏳ **PWA Icons**

```bash
icon-192x192.png   # PWA 推荐
icon-512x512.png   # PWA 推荐
```

---

## 🛠️ 生成指南

### 方法 1：使用 Inkscape (推荐)

```bash
# 安装 Inkscape
brew install inkscape  # macOS
# 或下载: https://inkscape.org/

# 从 SVG 生成 PNG
inkscape landing/assets/images/favicon.svg \
  --export-type=png \
  --export-filename=landing/assets/images/favicon-32x32.png \
  --export-width=32 \
  --export-height=32

# 批量生成
for size in 16 32 192 180 512; do
  inkscape landing/assets/images/favicon.svg \
    --export-type=png \
    --export-filename=landing/assets/images/favicon-${size}x${size}.png \
    --export-width=$size \
    --export-height=$size
done
```

### 方法 2：在线工具

**推荐工具**：

1. [RealFaviconGenerator](https://realfavicongenerator.net/)
   - 上传 `favicon.svg`
   - 自动生成所有尺寸和格式
   - 提供完整的 HTML 代码

2. [Favicon.io](https://favicon.io/)
   - 上传 SVG
   - 生成 ICO + PNG 套装

3. [Cloudconvert](https://cloudconvert.com/svg-to-png)
   - SVG → PNG 高质量转换
   - 自定义尺寸

### 方法 3：使用 ImageMagick

```bash
# 安装
brew install imagemagick

# 转换（需要先安装 librsvg）
brew install librsvg

# 生成 PNG
magick landing/assets/images/favicon.svg \
  -resize 32x32 \
  landing/assets/images/favicon-32x32.png
```

---

## 📝 HTML 引用代码

生成所有资源后，在 `landing/index.html` 的 `<head>` 中更新：

```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16x16.png" />
<link rel="shortcut icon" href="/assets/images/favicon.ico" />

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png" />

<!-- Android -->
<link rel="icon" type="image/png" sizes="192x192" href="/assets/images/favicon-192x192.png" />

<!-- OG Image -->
<meta property="og:image" content="https://aimake.cc/assets/images/og-image.png" />
<meta name="twitter:image" content="https://aimake.cc/assets/images/og-image.png" />

<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json" />
```

---

## 🎯 OG Image 设计规范

**尺寸**: 1200x630px **格式**: PNG **文件大小**: < 1MB

**布局建议**：

```
┌──────────────────────────────────────┐
│  [渐变背景 #0A0E27 → #2563EB]        │
│                                      │
│           [Logo 图标]                │
│                                      │
│         AIMake                       │
│     AI 语音内容生成                   │
│                                      │
│  播客 · 有声书 · 配音 · 教育          │
│                                      │
└──────────────────────────────────────┘
```

**文字规范**：

- 标题：Space Grotesk Bold 72px
- 副标题：DM Sans Regular 36px
- 特性标签：DM Sans Medium 24px

---

## 🚀 快速开始

### 立即可用

```bash
# 主 Logo（SVG）
<img src="/assets/images/logo.svg" alt="AIMake" width="200">

# Favicon（SVG - 现代浏览器）
<link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
```

### 生成完整套装

```bash
# 1. 使用 RealFaviconGenerator
# 访问 https://realfavicongenerator.net/
# 上传 landing/assets/images/favicon.svg
# 下载生成的资源包

# 2. 解压到 landing/assets/images/

# 3. 更新 index.html 中的引用
```

---

## 📚 参考资源

- [Favicon Generator](https://realfavicongenerator.net/)
- [OG Image Best Practices](https://www.opengraph.xyz/)
- [PWA Icon Guide](https://web.dev/add-manifest/)
- [Inkscape Documentation](https://inkscape.org/doc/)

---

**最后更新**: 2026-01-10 **版本**: 1.0 **设计师**: Claude Sonnet 4.5
