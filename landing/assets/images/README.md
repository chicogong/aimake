# AIMake 品牌资源

## 📦 当前文件

### 源文件（SVG 矢量）

✅ **logo.svg** - 完整 Logo（图标 + 文字）
- 尺寸：200x60px
- 用途：网站导航、营销材料
- 背景：深色

✅ **favicon.svg** - 图标 Logo（仅图标）
- 尺寸：64x64px
- 用途：Favicon、应用图标
- 背景：蓝色渐变

✅ **og-image-template.svg** - OG Image 模板
- 尺寸：1200x630px
- 用途：社交分享图片
- 需要转换为 PNG

---

## 🚀 生成 PNG 资源

### 方法 1：自动生成（推荐）

使用项目提供的脚本：

```bash
# 从项目根目录运行
./scripts/generate-brand-assets.sh
```

**需要安装**：
```bash
# macOS
brew install inkscape imagemagick

# Ubuntu/Debian
sudo apt-get install inkscape imagemagick
```

**生成的文件**：
- `favicon-16x16.png` - 16x16 favicon
- `favicon-32x32.png` - 32x32 favicon
- `favicon-192x192.png` - Android icon
- `favicon.ico` - 多尺寸 ICO
- `apple-touch-icon.png` - 180x180 Apple icon
- `icon-192x192.png` - PWA icon
- `icon-512x512.png` - PWA icon
- `og-image.png` - 1200x630 社交分享图

---

### 方法 2：在线工具

#### RealFaviconGenerator（推荐）
1. 访问：https://realfavicongenerator.net/
2. 上传 `favicon.svg`
3. 自定义设置（使用默认即可）
4. 下载生成的资源包
5. 解压到当前目录

#### Cloudconvert
1. 访问：https://cloudconvert.com/svg-to-png
2. 上传 SVG 文件
3. 设置输出尺寸
4. 下载 PNG

#### Favicon.io
1. 访问：https://favicon.io/
2. 选择 "SVG to Favicon"
3. 上传 `favicon.svg`
4. 下载 ZIP 包

---

### 方法 3：手动使用 Inkscape

```bash
# 生成 32x32 favicon
inkscape favicon.svg \
  --export-type=png \
  --export-filename=favicon-32x32.png \
  --export-width=32 \
  --export-height=32

# 生成 OG image
inkscape og-image-template.svg \
  --export-type=png \
  --export-filename=og-image.png \
  --export-width=1200 \
  --export-height=630
```

---

## ✅ 生成完成后

### 检查清单

- [ ] 所有 PNG 文件已生成
- [ ] 文件大小合理（< 50KB for favicons, < 200KB for OG image）
- [ ] 图片清晰，无锯齿
- [ ] `og-image.png` 文字可读

### 使用资源

所有资源已在 `index.html` 中正确引用：

```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png">

<!-- OG Image -->
<meta property="og:image" content="/assets/images/og-image.png">
```

---

## 📐 Logo 使用规范

详见 `docs/design/brand-identity.md`

**最小尺寸**：
- 完整 Logo：120px 宽
- 图标：24px

**禁止**：
- ❌ 改变颜色
- ❌ 拉伸变形
- ❌ 旋转（除 90° 倍数）
- ❌ 添加特效

---

## 🎨 配色参考

| 颜色 | Hex | 用途 |
|------|-----|------|
| Trust Blue | `#2563EB` | 主色 |
| Light Blue | `#3B82F6` | 渐变 |
| Orange | `#F97316` | CTA |
| Dark Navy | `#0A0E27` | 背景 |

---

## 📚 相关文档

- **品牌指南**: `docs/design/brand-identity.md`
- **部署指南**: `docs/development/cloudflare-pages-deployment.md`

---

**最后更新**: 2026-01-10
