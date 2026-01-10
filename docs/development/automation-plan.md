# AIMake 自动化开发计划

> 创建日期: 2026-01-09 核心策略: 最大化使用 AI 工具和自动化服务

---

## 一、AI 工具矩阵

### 1.1 开发阶段工具

| 阶段         | 工具                 | 用途             | 自动化程度 |
| ------------ | -------------------- | ---------------- | ---------- |
| **代码生成** | Claude Code / Cursor | 编写业务逻辑     | 90%        |
| **UI 生成**  | v0.dev / Bolt.new    | 生成 React 组件  | 95%        |
| **测试生成** | Claude + Vitest      | 生成测试用例     | 80%        |
| **E2E 测试** | Playwright MCP       | 浏览器自动化测试 | 90%        |
| **代码审查** | GitHub Copilot       | PR 自动审查      | 70%        |
| **部署**     | Vercel / Cloudflare  | 自动部署         | 100%       |
| **监控**     | Sentry               | 错误自动上报     | 100%       |

### 1.2 MCP Servers 配置

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "~/Projects/aimake"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxx"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}
```

---

## 二、自动化测试计划

### 2.1 测试金字塔

```
                    ┌─────────┐
                    │  E2E    │  10%  ← Playwright MCP
                    │  Tests  │
                    ├─────────┤
                    │  集成   │  20%  ← Vitest + MSW
                    │  测试   │
                    ├─────────┤
                    │  单元   │  70%  ← Vitest + RTL
                    │  测试   │
                    └─────────┘
```

### 2.2 测试工具栈

| 类型     | 工具                      | 说明              |
| -------- | ------------------------- | ----------------- |
| 单元测试 | Vitest                    | Vite 原生，速度快 |
| 组件测试 | React Testing Library     | DOM 测试          |
| API Mock | MSW (Mock Service Worker) | 拦截网络请求      |
| E2E 测试 | Playwright                | 浏览器自动化      |
| 覆盖率   | Vitest Coverage (c8)      | 代码覆盖率        |
| 快照测试 | Vitest Snapshot           | UI 快照           |

### 2.3 AI 生成测试用例

**使用 Claude Code 生成测试：**

```bash
# 让 Claude 为组件生成测试
claude "为 src/components/AudioPlayer.tsx 生成完整的 Vitest 测试用例，包括：
1. 播放/暂停功能测试
2. 进度条拖动测试
3. 音量控制测试
4. 边界条件测试"
```

**测试模板：**

```typescript
// tests/components/AudioPlayer.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPlayer } from '@/components/AudioPlayer';

describe('AudioPlayer', () => {
  const mockProps = {
    src: 'https://example.com/audio.mp3',
    title: 'Test Audio',
    duration: 120,
  };

  it('renders correctly', () => {
    render(<AudioPlayer {...mockProps} />);
    expect(screen.getByText('Test Audio')).toBeInTheDocument();
  });

  it('toggles play/pause on button click', async () => {
    render(<AudioPlayer {...mockProps} />);
    const playButton = screen.getByRole('button', { name: /play/i });

    fireEvent.click(playButton);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('updates progress when seeking', () => {
    render(<AudioPlayer {...mockProps} />);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, { target: { value: 60 } });
    expect(slider).toHaveValue('60');
  });
});
```

### 2.4 Playwright MCP 自动化 E2E 测试

**使用 Claude + Playwright MCP 生成 E2E 测试：**

```bash
# Claude 对话示例
"请用浏览器打开 http://localhost:5173，执行以下测试流程：
1. 点击登录按钮
2. 输入测试邮箱和密码
3. 验证登录成功后跳转到 /app
4. 在创建页面输入测试文本
5. 选择音色并点击生成
6. 验证音频播放器出现
7. 将这个流程整理成 Playwright 测试脚本"
```

**生成的测试脚本：**

```typescript
// tests/e2e/tts-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('TTS Generation Flow', () => {
  test('should generate audio from text', async ({ page }) => {
    // 1. 登录
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. 等待跳转到应用
    await expect(page).toHaveURL('/app');

    // 3. 进入创建页面
    await page.click('text=创建');

    // 4. 输入文本
    await page.fill('textarea', '这是一段测试文本，用于生成语音。');

    // 5. 选择音色
    await page.click('[data-voice-id="openai-alloy"]');

    // 6. 点击生成
    await page.click('button:has-text("生成音频")');

    // 7. 等待生成完成
    await expect(page.locator('.audio-player')).toBeVisible({ timeout: 30000 });

    // 8. 验证可以播放
    await page.click('[aria-label="播放"]');
    await expect(page.locator('[aria-label="暂停"]')).toBeVisible();
  });
});
```

### 2.5 GitHub Actions CI 配置

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, content-generation]
  pull_request:
    branches: [main]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 三、鉴权开发计划 (Clerk)

### 3.1 开发步骤

| 步骤     | 任务               | 工具            | 时间          |
| -------- | ------------------ | --------------- | ------------- |
| 1        | 创建 Clerk 应用    | Clerk Dashboard | 5 分钟        |
| 2        | 配置 OAuth         | Clerk Dashboard | 10 分钟       |
| 3        | 安装前端 SDK       | npm             | 2 分钟        |
| 4        | 生成登录页面       | v0.dev          | 10 分钟       |
| 5        | 集成 ClerkProvider | Claude Code     | 5 分钟        |
| 6        | 配置后端验证       | Claude Code     | 15 分钟       |
| 7        | 设置 Webhook 同步  | Clerk + Claude  | 20 分钟       |
| 8        | 编写测试           | Claude + Vitest | 15 分钟       |
| **总计** |                    |                 | **~1.5 小时** |

### 3.2 使用 v0.dev 生成登录页面

**v0.dev Prompt：**

```
创建一个现代化的登录页面，包含：
- Logo 和标题 "AIMake"
- Google 登录按钮
- GitHub 登录按钮
- 分隔线 "或使用邮箱登录"
- 邮箱输入框
- 密码输入框
- 登录按钮
- "还没有账号？注册" 链接
- 使用 Tailwind CSS
- 响应式设计
- 深蓝色主题 (#1A6BA0)
```

### 3.3 Claude Code 集成脚本

```bash
# 1. 初始化 Clerk
claude "在项目中集成 Clerk 认证：
1. 安装 @clerk/clerk-react
2. 创建 ClerkProvider 包装
3. 创建 /sign-in 和 /sign-up 页面
4. 添加路由保护
5. 创建 UserButton 组件
参考文档：https://clerk.com/docs/quickstarts/react"

# 2. 后端验证
claude "在 Cloudflare Workers 中添加 Clerk 验证：
1. 安装 @clerk/backend
2. 创建 authMiddleware
3. 保护 /api/* 路由
4. 从 token 中提取 userId"

# 3. Webhook 同步
claude "创建 Clerk Webhook 处理：
1. 创建 /webhook/clerk 路由
2. 验证 svix 签名
3. 处理 user.created 事件
4. 在 D1 数据库创建用户记录
5. 初始化用户额度"
```

### 3.4 Clerk 配置清单

```markdown
## Clerk Dashboard 配置

### 1. 创建应用

- [ ] 登录 https://dashboard.clerk.com
- [ ] 创建新应用 "AIMake"
- [ ] 选择 React 框架

### 2. 启用登录方式

- [ ] Email/Password ✓
- [ ] Google OAuth ✓
- [ ] GitHub OAuth ✓

### 3. 配置 OAuth

- [ ] Google: 添加 Client ID 和 Secret
- [ ] GitHub: 添加 Client ID 和 Secret

### 4. 设置重定向

- [ ] 开发环境: http://localhost:5173
- [ ] 生产环境: https://aimake.cc

### 5. 配置 Webhook

- [ ] URL: https://api.aimake.cc/webhook/clerk
- [ ] Events: user.created, user.updated, user.deleted
- [ ] 获取 Webhook Secret

### 6. 获取密钥

- [ ] Publishable Key → 前端 .env
- [ ] Secret Key → Workers Secrets
- [ ] Webhook Secret → Workers Secrets
```

---

## 四、部署自动化计划

### 4.1 部署架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         Git Push                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Lint      │→ │   Test      │→ │   Build     │             │
│  └─────────────┘  └─────────────┘  └──────┬──────┘             │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
            ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
            │   Vercel    │         │ Cloudflare  │         │   Neon      │
            │  Frontend   │         │  Workers    │         │  Database   │
            │  自动部署    │         │  自动部署    │         │  Migration  │
            └─────────────┘         └─────────────┘         └─────────────┘
```

### 4.2 前端部署 (Vercel)

**完全自动化：**

```bash
# 1. 连接 GitHub 仓库到 Vercel (一次性)
vercel link

# 2. 之后每次 push 自动部署
git push origin main  # 触发自动部署
```

**vercel.json：**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 4.3 后端部署 (Cloudflare Workers)

**GitHub Actions 自动部署：**

```yaml
# .github/workflows/deploy-api.yml
name: Deploy API

on:
  push:
    branches: [main]
    paths:
      - 'api/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd api && npm ci

      - name: Deploy to Cloudflare
        run: cd api && npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

### 4.4 数据库迁移 (Neon/D1)

```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  push:
    paths:
      - 'api/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run migrations
        run: |
          npx wrangler d1 execute aimake-db \
            --file=api/migrations/latest.sql \
            --remote
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

### 4.5 一键部署脚本

```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 AIMake 部署脚本"

# 1. 检查环境
echo "检查环境变量..."
required_vars=(
  "CLOUDFLARE_API_TOKEN"
  "CLERK_SECRET_KEY"
  "OPENAI_API_KEY"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ 缺少环境变量: $var"
    exit 1
  fi
done
echo "✅ 环境变量检查通过"

# 2. 运行测试
echo "运行测试..."
npm run test || exit 1
echo "✅ 测试通过"

# 3. 部署前端
echo "部署前端到 Vercel..."
cd frontend && vercel --prod
echo "✅ 前端部署完成"

# 4. 部署后端
echo "部署后端到 Cloudflare..."
cd ../api && npx wrangler deploy
echo "✅ 后端部署完成"

# 5. 运行数据库迁移
echo "运行数据库迁移..."
npx wrangler d1 execute aimake-db --file=migrations/latest.sql --remote
echo "✅ 数据库迁移完成"

echo "🎉 部署成功！"
echo "前端: https://aimake.cc"
echo "API: https://api.aimake.cc"
```

---

## 五、开发工作流

### 5.1 日常开发流程

```
1. 需求分析
   └── 使用 Claude 讨论需求，生成任务列表

2. UI 设计
   └── 使用 v0.dev 生成组件
   └── 复制代码到项目

3. 业务逻辑
   └── 使用 Claude Code 编写代码
   └── 自动生成测试用例

4. 本地测试
   └── npm run test (Vitest)
   └── npm run test:e2e (Playwright)

5. 提交代码
   └── git push
   └── 触发 CI/CD

6. 自动部署
   └── Vercel 自动部署前端
   └── Cloudflare 自动部署后端

7. 监控
   └── Sentry 错误监控
   └── Vercel Analytics
```

### 5.2 Claude Code 常用命令

```bash
# 生成组件
claude "创建一个 VoiceSelector 组件，功能：显示音色列表，支持试听和选择"

# 生成 API
claude "创建 /api/tts/generate 路由，接收文本和音色ID，调用 OpenAI TTS API"

# 生成测试
claude "为 src/components/VoiceSelector.tsx 生成 Vitest 测试用例"

# 代码审查
claude "审查 src/routes/tts.ts 的代码，检查安全性和性能问题"

# 修复 Bug
claude "这个组件有 bug：[错误描述]，请修复"

# 重构代码
claude "重构 src/services/api.ts，使用更好的错误处理"
```

### 5.3 v0.dev 常用 Prompt

```
# 登录页面
"创建登录页面，包含 Google/GitHub OAuth 按钮和邮箱登录表单，使用 Tailwind"

# 音频播放器
"创建音频播放器组件，包含播放/暂停、进度条、音量控制、下载按钮"

# 定价页面
"创建 SaaS 定价页面，3个套餐：Free/Pro/Team，包含功能对比表"

# 仪表盘
"创建用户仪表盘，显示用量统计、最近音频、快捷操作"
```

---

## 六、时间估算

### 6.1 MVP 开发计划

| 阶段      | 任务         | AI 工具         | 预计时间 |
| --------- | ------------ | --------------- | -------- |
| **Day 1** | 项目初始化   | Claude Code     | 2h       |
|           | Clerk 集成   | Clerk + Claude  | 1.5h     |
|           | 登录页面     | v0.dev          | 0.5h     |
| **Day 2** | TTS API 路由 | Claude Code     | 2h       |
|           | 创建页面 UI  | v0.dev          | 1h       |
|           | 音频播放器   | v0.dev + Claude | 1h       |
| **Day 3** | 音频库页面   | v0.dev + Claude | 2h       |
|           | 用量统计     | Claude Code     | 1h       |
|           | 测试用例     | Claude + Vitest | 1h       |
| **Day 4** | E2E 测试     | Playwright MCP  | 2h       |
|           | 部署配置     | Claude Code     | 1h       |
|           | 修复 Bug     | Claude Code     | 1h       |
| **Day 5** | 优化和测试   | 全部            | 4h       |

**总计: 5 天 (约 20 小时)**

### 6.2 传统开发 vs AI 辅助开发

| 任务      | 传统开发 | AI 辅助    | 节省    |
| --------- | -------- | ---------- | ------- |
| 登录认证  | 2-3 天   | 2 小时     | 90%     |
| CRUD 页面 | 1 天     | 2 小时     | 80%     |
| 测试用例  | 1 天     | 1 小时     | 90%     |
| API 路由  | 4 小时   | 1 小时     | 75%     |
| E2E 测试  | 1 天     | 2 小时     | 80%     |
| **总计**  | **2 周** | **3-4 天** | **75%** |

---

## 七、监控和告警

### 7.1 自动化监控

| 服务                 | 用途       | 配置                 |
| -------------------- | ---------- | -------------------- |
| Sentry               | 错误追踪   | 自动上报 JS/API 错误 |
| Vercel Analytics     | 性能监控   | Core Web Vitals      |
| UptimeRobot          | 可用性监控 | 每 5 分钟检查        |
| Cloudflare Analytics | 流量分析   | 自动统计             |

### 7.2 告警配置

```yaml
# UptimeRobot 配置
monitors:
  - name: AIMake Frontend
    url: https://aimake.cc
    interval: 5m
    alert: [email, slack]

  - name: AIMake API
    url: https://api.aimake.cc/health
    interval: 5m
    alert: [email, slack]
```

---

## 八、检查清单

### 开发环境

- [ ] 安装 Claude Code / Cursor
- [ ] 配置 MCP Servers (filesystem, playwright, github)
- [ ] 注册 v0.dev 账号
- [ ] 安装 Playwright

### 服务账号

- [ ] Clerk 账号 + 应用创建
- [ ] Vercel 账号 + 项目连接
- [ ] Cloudflare 账号 + Workers 配置
- [ ] Neon 账号 + 数据库创建
- [ ] OpenAI API Key
- [ ] Sentry 账号

### CI/CD

- [ ] GitHub Actions workflows
- [ ] Vercel 自动部署
- [ ] Cloudflare 自动部署
- [ ] 测试覆盖率报告

---

_用 AI 工具，让开发更轻松！_
