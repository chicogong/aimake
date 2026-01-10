# Cloudflare Pages 部署指南

## 📋 部署前准备

### 1. 确认账户

- [ ] Cloudflare 账户 (免费版即可)
- [ ] GitHub 账户 (代码仓库)
- [ ] 自定义域名 (可选，可用 `*.pages.dev`)

### 2. 代码准备

```bash
# 确认目录结构
aimake/
├── landing/
│   ├── index.html
│   ├── assets/
│   ├── _headers
│   ├── _redirects
│   └── robots.txt
└── wrangler.toml
```

---

## 🚀 部署步骤

### 方式 1：通过 Cloudflare Dashboard (推荐)

#### 步骤 1：创建 Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择 **Pages** → **创建项目**
3. 选择 **连接到 Git**

#### 步骤 2：连接 GitHub 仓库

1. 授权 Cloudflare 访问你的 GitHub
2. 选择 `chicogong/aimake` 仓库
3. 选择分支：`master` 或 `main`

#### 步骤 3：配置构建设置

| 配置项       | 值               |
| ------------ | ---------------- |
| 项目名称     | `aimake-landing` |
| 生产分支     | `master`         |
| 框架预设     | `None` (纯静态)  |
| 构建命令     | (留空)           |
| 构建输出目录 | `landing`        |
| 根目录       | `/`              |
| 环境变量     | (不需要)         |

#### 步骤 4：开始部署

- 点击 **保存并部署**
- 等待 1-2 分钟
- 部署完成后获得 URL：`https://aimake-landing.pages.dev`

---

### 方式 2：通过 Wrangler CLI

#### 安装 Wrangler

```bash
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

#### 部署命令

```bash
# 首次部署
cd /path/to/aimake
wrangler pages deploy landing --project-name=aimake-landing

# 后续更新
wrangler pages deploy landing
```

---

## 🔧 部署后配置

### 1. 绑定自定义域名 (可选)

#### 步骤 1：添加域名

1. Pages 项目 → **自定义域**
2. 点击 **设置自定义域**
3. 输入域名：`aimake.cc` 或 `www.aimake.cc`

#### 步骤 2：配置 DNS

- Cloudflare 会自动添加 CNAME 记录
- 如果域名不在 Cloudflare，手动添加：
  ```
  CNAME  @  aimake-landing.pages.dev
  ```

#### 步骤 3：启用 HTTPS

- Cloudflare 自动提供免费 SSL 证书
- 强制 HTTPS：在 **SSL/TLS** → **边缘证书** → 启用 **始终使用 HTTPS**

### 2. 配置分析 (可选)

#### Cloudflare Web Analytics (免费)

1. Pages 项目 → **Web Analytics**
2. 启用跟踪代码
3. 复制跟踪代码到 `landing/index.html` 的 `</body>` 前

```html
<!-- Cloudflare Web Analytics -->
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "YOUR_TOKEN"}'
></script>
```

### 3. 性能优化

#### 启用 Brotli 压缩

- 默认已启用，无需配置

#### 配置缓存规则

- `_headers` 文件已配置
- 静态资源：1 年缓存
- HTML：不缓存

#### 启用 HTTP/3

1. 域名 → **网络**
2. 启用 **HTTP/3 (with QUIC)**

---

## 🔄 自动部署流程

### GitHub Actions (推荐)

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - master
    paths:
      - 'landing/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy Landing Page
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: aimake-landing
          directory: landing
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

#### 配置 Secrets

1. GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 添加以下 secrets：
   - `CLOUDFLARE_API_TOKEN`：从 CF Dashboard → **我的个人资料** → **API 令牌** 创建
   - `CLOUDFLARE_ACCOUNT_ID`：CF Dashboard 右侧边栏

---

## 🧪 预览环境

### 分支预览

- 每个 Git 分支自动部署到：`https://BRANCH.aimake-landing.pages.dev`
- PR 预览：每个 Pull Request 自动生成预览链接

### 访问控制

- Pages 项目 → **设置** → **访问策略**
- 可设置密码保护预览环境

---

## 📊 监控与日志

### 查看部署日志

1. Pages 项目 → **部署**
2. 点击具体部署查看详细日志

### 实时流量监控

- Pages 项目 → **分析**
- 查看请求数、带宽、缓存命中率

### 错误追踪

- 404 错误会显示在 **实时日志** 中
- 使用 Cloudflare Web Analytics 追踪 JS 错误

---

## ⚠️ 常见问题

### 1. 部署失败：`Build directory not found`

**原因**：构建输出目录配置错误

**解决**：

- 确认 `landing/` 目录存在
- 检查 `wrangler.toml` 中 `pages_build_output_dir = "landing"`

### 2. 静态资源 404

**原因**：资源路径错误

**解决**：

- 使用绝对路径：`/assets/css/main.css`
- 不要使用相对路径：`./assets/css/main.css`

### 3. 自定义域名无法访问

**原因**：DNS 配置错误或传播延迟

**解决**：

- 等待 DNS 传播 (最多 48 小时，通常 10 分钟)
- 使用 `dig aimake.cc` 检查 DNS 记录
- 确认 CNAME 指向正确的 `*.pages.dev` 地址

### 4. CORS 错误

**原因**：缺少 CORS 响应头

**解决**：在 `landing/_headers` 添加：

```
/api/*
  Access-Control-Allow-Origin: https://aimake.cc
  Access-Control-Allow-Methods: GET, POST, OPTIONS
```

---

## 📈 性能基准

### 目标指标

| 指标 | 目标    | 预期            |
| ---- | ------- | --------------- |
| TTFB | < 200ms | ~50ms (CF Edge) |
| LCP  | < 2.5s  | ~1.5s           |
| FID  | < 100ms | ~10ms           |
| CLS  | < 0.1   | ~0.05           |

### 测试工具

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Cloudflare Observatory](https://observatory.cloudflare.com/)

---

## 🔗 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Pages Functions](https://developers.cloudflare.com/pages/platform/functions/) - 未来添加动态功能

---

## ✅ 部署检查清单

部署前：

- [ ] `landing/` 目录结构正确
- [ ] `_headers` 和 `_redirects` 配置完成
- [ ] 所有资源路径使用绝对路径 (`/assets/...`)
- [ ] 测试 HTML/CSS/JS 在本地可正常运行
- [ ] 提交代码到 GitHub

部署后：

- [ ] 访问 `*.pages.dev` URL 确认站点正常
- [ ] 检查所有链接和资源加载正常
- [ ] 测试移动端响应式布局
- [ ] 运行 PageSpeed Insights 测试性能
- [ ] (可选) 绑定自定义域名
- [ ] (可选) 启用 Web Analytics

---

**最后更新**: 2026-01-10 **预计部署时间**: 10-15 分钟 (首次)
