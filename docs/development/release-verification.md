# AIMake 上线验证测试计划

> 创建日期: 2026-01-09目的: 确保每次发布前系统稳定可用

---

## 一、验证测试类型

```
┌─────────────────────────────────────────────────────────────┐
│                     上线验证测试                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   冒烟测试    │  │   回归测试    │  │   性能测试    │      │
│  │  Smoke Test  │  │  Regression  │  │  Performance │      │
│  │   (5 分钟)   │  │   (15 分钟)   │  │   (10 分钟)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   安全测试    │  │   兼容性测试  │  │   监控验证    │      │
│  │   Security   │  │ Compatibility│  │  Monitoring  │      │
│  │   (5 分钟)   │  │   (10 分钟)   │  │   (5 分钟)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、冒烟测试 (Smoke Test)

### 2.1 核心功能检查清单

快速验证核心功能是否正常，发现严重问题立即回滚。

```markdown
## 冒烟测试检查项 (5 分钟)

### 前端可访问性

- [ ] 首页加载成功 (< 3s)
- [ ] 无 JS 控制台错误
- [ ] 静态资源加载正常 (CSS/JS/图片)

### 认证流程

- [ ] 登录页面可访问
- [ ] Google OAuth 跳转正常
- [ ] 登录后正确跳转到 /app
- [ ] 登出功能正常

### 核心业务

- [ ] TTS 创建页面可访问
- [ ] 输入文本后可选择音色
- [ ] 点击生成后 API 响应正常
- [ ] 音频播放器可播放

### API 健康检查

- [ ] GET /health 返回 200
- [ ] GET /api/voices 返回音色列表
- [ ] POST /api/tts/generate 可调用
```

### 2.2 自动化冒烟测试脚本

```typescript
// tests/smoke/smoke.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // 检查关键元素
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="login-btn"]')).toBeVisible();
  });

  test('API health check', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.database).toBe('connected');
  });

  test('auth flow works', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.locator('text=登录')).toBeVisible();
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
  });

  test('TTS page accessible after login', async ({ page }) => {
    // 使用测试账号登录
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');

    // 验证跳转到应用
    await expect(page).toHaveURL('/app', { timeout: 10000 });

    // 验证创建页面
    await page.click('text=创建');
    await expect(page.locator('textarea')).toBeVisible();
  });
});
```

### 2.3 冒烟测试 CLI 命令

```bash
#!/bin/bash
# scripts/smoke-test.sh

echo "🔥 运行冒烟测试..."

BASE_URL=${1:-"https://aimake.cc"}
API_URL=${2:-"https://api.aimake.cc"}

# 1. 前端健康检查
echo "检查前端..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ 前端不可访问: HTTP $HTTP_CODE"
  exit 1
fi
echo "✅ 前端正常"

# 2. API 健康检查
echo "检查 API..."
HEALTH=$(curl -s "$API_URL/health")
if [[ ! "$HEALTH" == *"ok"* ]]; then
  echo "❌ API 健康检查失败: $HEALTH"
  exit 1
fi
echo "✅ API 正常"

# 3. 音色列表 API
echo "检查音色 API..."
VOICES=$(curl -s "$API_URL/api/voices")
if [[ ! "$VOICES" == *"openai"* ]]; then
  echo "❌ 音色 API 异常"
  exit 1
fi
echo "✅ 音色 API 正常"

# 4. Playwright E2E 测试
echo "运行 E2E 冒烟测试..."
npx playwright test tests/smoke/ --reporter=list

echo "🎉 冒烟测试通过！"
```

---

## 三、回归测试 (Regression Test)

### 3.1 测试范围

确保新版本没有破坏已有功能。

```markdown
## 回归测试矩阵

| 模块         | 测试用例             | 优先级 |
| ------------ | -------------------- | ------ |
| **认证**     |                      |        |
|              | 邮箱密码登录         | P0     |
|              | Google OAuth         | P0     |
|              | GitHub OAuth         | P1     |
|              | 登出                 | P0     |
|              | Token 刷新           | P1     |
| **TTS 生成** |                      |        |
|              | 短文本生成 (< 100字) | P0     |
|              | 长文本生成 (1000字)  | P0     |
|              | 不同音色切换         | P0     |
|              | 生成进度显示         | P1     |
|              | 生成失败重试         | P1     |
| **音频管理** |                      |        |
|              | 音频列表加载         | P0     |
|              | 音频播放             | P0     |
|              | 音频下载             | P0     |
|              | 音频删除             | P1     |
| **用户中心** |                      |        |
|              | 用量显示             | P0     |
|              | 额度提醒             | P1     |
|              | 订阅信息             | P1     |
```

### 3.2 自动化回归测试

```typescript
// tests/regression/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Auth Regression', () => {
  test('email login flow', async ({ page }) => {
    await page.goto('/sign-in');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/app');
    await expect(page.locator('[data-testid="user-button"]')).toBeVisible();
  });

  test('logout clears session', async ({ page }) => {
    // 先登录
    await loginAsTestUser(page);

    // 登出
    await page.click('[data-testid="user-button"]');
    await page.click('text=退出登录');

    // 验证跳转到首页
    await expect(page).toHaveURL('/');

    // 验证无法访问受保护页面
    await page.goto('/app');
    await expect(page).toHaveURL('/sign-in');
  });
});

// tests/regression/tts.spec.ts
test.describe('TTS Regression', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('generate short text audio', async ({ page }) => {
    await page.goto('/app/create');

    await page.fill('textarea', '这是一段测试文本。');
    await page.click('[data-voice-id="openai-alloy"]');
    await page.click('button:has-text("生成")');

    // 等待生成完成
    await expect(page.locator('.audio-player')).toBeVisible({ timeout: 30000 });

    // 验证可以播放
    await page.click('[aria-label="播放"]');
    await expect(page.locator('[aria-label="暂停"]')).toBeVisible();
  });

  test('generate long text audio', async ({ page }) => {
    await page.goto('/app/create');

    const longText = '这是一段很长的测试文本。'.repeat(50);
    await page.fill('textarea', longText);
    await page.click('[data-voice-id="openai-nova"]');
    await page.click('button:has-text("生成")');

    // 长文本需要更长时间
    await expect(page.locator('.audio-player')).toBeVisible({ timeout: 60000 });
  });

  test('switch voice before generate', async ({ page }) => {
    await page.goto('/app/create');

    await page.fill('textarea', '测试音色切换。');

    // 选择第一个音色
    await page.click('[data-voice-id="openai-alloy"]');
    await expect(page.locator('[data-voice-id="openai-alloy"]')).toHaveClass(/selected/);

    // 切换到另一个音色
    await page.click('[data-voice-id="openai-echo"]');
    await expect(page.locator('[data-voice-id="openai-echo"]')).toHaveClass(/selected/);
    await expect(page.locator('[data-voice-id="openai-alloy"]')).not.toHaveClass(/selected/);
  });
});
```

### 3.3 GitHub Actions 回归测试

```yaml
# .github/workflows/regression.yml
name: Regression Tests

on:
  deployment_status:

jobs:
  regression:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run regression tests
        run: npx playwright test tests/regression/
        env:
          BASE_URL: ${{ github.event.deployment_status.target_url }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: regression-report
          path: playwright-report/
```

---

## 四、性能测试

### 4.1 性能指标

```markdown
## 性能 SLA

| 指标              | 目标值  | 告警阈值 |
| ----------------- | ------- | -------- |
| **前端**          |         |          |
| 首页 LCP          | < 2.5s  | > 4s     |
| FID               | < 100ms | > 300ms  |
| CLS               | < 0.1   | > 0.25   |
| **API**           |         |          |
| /health 响应      | < 50ms  | > 200ms  |
| /api/voices       | < 100ms | > 500ms  |
| /api/tts/generate | < 30s   | > 60s    |
| **资源**          |         |          |
| JS Bundle         | < 200KB | > 500KB  |
| 首页总大小        | < 1MB   | > 2MB    |
```

### 4.2 性能测试脚本

```typescript
// tests/performance/perf.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('homepage Core Web Vitals', async ({ page }) => {
    await page.goto('/');

    // 获取 Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const results: Record<string, number> = {};

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              results.lcp = entry.startTime;
            }
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // CLS
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          results.cls = cls;
        }).observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => resolve(results), 3000);
      });
    });

    console.log('Web Vitals:', metrics);
    expect(metrics.lcp).toBeLessThan(2500);
    expect(metrics.cls).toBeLessThan(0.1);
  });

  test('API response times', async ({ request }) => {
    // Health endpoint
    const healthStart = Date.now();
    await request.get('/api/health');
    const healthTime = Date.now() - healthStart;
    expect(healthTime).toBeLessThan(200);

    // Voices endpoint
    const voicesStart = Date.now();
    await request.get('/api/voices');
    const voicesTime = Date.now() - voicesStart;
    expect(voicesTime).toBeLessThan(500);
  });

  test('bundle size check', async ({ page }) => {
    const resources: { name: string; size: number }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('.js') || url.includes('.css')) {
        const buffer = await response.body();
        resources.push({
          name: url.split('/').pop() || url,
          size: buffer.length,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalJS = resources
      .filter((r) => r.name.endsWith('.js'))
      .reduce((sum, r) => sum + r.size, 0);

    console.log('Total JS size:', (totalJS / 1024).toFixed(2), 'KB');
    expect(totalJS).toBeLessThan(500 * 1024); // 500KB
  });
});
```

### 4.3 负载测试 (k6)

```javascript
// tests/load/api-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp up
    { duration: '3m', target: 10 }, // Stay
    { duration: '1m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Health check
  const healthRes = http.get('https://api.aimake.cc/health');
  check(healthRes, {
    'health status 200': (r) => r.status === 200,
    'health response < 200ms': (r) => r.timings.duration < 200,
  });

  // Voices list
  const voicesRes = http.get('https://api.aimake.cc/api/voices');
  check(voicesRes, {
    'voices status 200': (r) => r.status === 200,
    'voices response < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## 五、安全测试

### 5.1 安全检查清单

```markdown
## 安全验证项

### 认证安全

- [ ] 无效 Token 返回 401
- [ ] 过期 Token 返回 401
- [ ] 无 Token 访问受保护路由返回 401
- [ ] CORS 配置正确

### 输入验证

- [ ] XSS 防护 (HTML 转义)
- [ ] SQL 注入防护
- [ ] 文本长度限制生效
- [ ] 文件上传类型限制

### 速率限制

- [ ] API 速率限制生效
- [ ] 超限返回 429
- [ ] 限制重置正常

### 敏感信息

- [ ] 错误响应不泄露堆栈
- [ ] 日志不记录敏感信息
- [ ] API Key 不暴露在前端
```

### 5.2 自动化安全测试

```typescript
// tests/security/security.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('protected routes require auth', async ({ request }) => {
    const response = await request.get('/api/user/profile');
    expect(response.status()).toBe(401);
  });

  test('invalid token rejected', async ({ request }) => {
    const response = await request.get('/api/user/profile', {
      headers: {
        Authorization: 'Bearer invalid-token-here',
      },
    });
    expect(response.status()).toBe(401);
  });

  test('XSS prevention', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/app/create');

    // 尝试 XSS 攻击
    const xssPayload = '<script>alert("xss")</script>';
    await page.fill('textarea', xssPayload);
    await page.click('button:has-text("生成")');

    // 验证脚本未执行
    const alertTriggered = await page.evaluate(() => {
      return (window as any).__xssTriggered || false;
    });
    expect(alertTriggered).toBe(false);
  });

  test('rate limiting works', async ({ request }) => {
    // 快速发送多个请求
    const requests = Array(20)
      .fill(null)
      .map(() => request.get('/api/voices'));

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter((r) => r.status() === 429);

    // 应该有部分请求被限制
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });

  test('CORS headers correct', async ({ request }) => {
    const response = await request.get('/api/health', {
      headers: {
        Origin: 'https://malicious-site.com',
      },
    });

    const corsHeader = response.headers()['access-control-allow-origin'];
    expect(corsHeader).not.toBe('*');
    expect(corsHeader).not.toBe('https://malicious-site.com');
  });
});
```

---

## 六、兼容性测试

### 6.1 浏览器兼容性

```markdown
## 支持的浏览器

| 浏览器         | 版本          | 优先级 |
| -------------- | ------------- | ------ |
| Chrome         | 最新 2 个版本 | P0     |
| Safari         | 最新 2 个版本 | P0     |
| Firefox        | 最新 2 个版本 | P1     |
| Edge           | 最新 2 个版本 | P1     |
| Safari iOS     | 最新 2 个版本 | P0     |
| Chrome Android | 最新 2 个版本 | P1     |
```

### 6.2 Playwright 多浏览器测试

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

### 6.3 响应式测试

```typescript
// tests/compatibility/responsive.spec.ts
import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`homepage renders correctly on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    await page.goto('/');

    // 截图对比
    await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`);

    // 验证关键元素可见
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="cta-button"]')).toBeVisible();
  });
}
```

---

## 七、监控验证

### 7.1 监控检查清单

```markdown
## 上线后监控验证

### Sentry 错误监控

- [ ] 测试错误能够上报
- [ ] Source Map 正确解析
- [ ] 告警通知正常

### Vercel Analytics

- [ ] 页面访问记录正常
- [ ] Core Web Vitals 采集正常
- [ ] 实时数据更新

### Cloudflare Analytics

- [ ] 请求统计正常
- [ ] 错误率显示正常
- [ ] 地理分布正常

### UptimeRobot

- [ ] 监控器状态为 Up
- [ ] 响应时间记录正常
- [ ] 告警配置生效
```

### 7.2 监控验证脚本

```bash
#!/bin/bash
# scripts/verify-monitoring.sh

echo "📊 验证监控配置..."

# 1. 触发测试错误 (验证 Sentry)
echo "触发 Sentry 测试错误..."
curl -X POST "https://api.aimake.cc/api/test/error" \
  -H "X-Test-Key: $TEST_API_KEY"

echo "等待 Sentry 接收..."
sleep 10

# 检查 Sentry 是否收到
SENTRY_ISSUES=$(curl -s "https://sentry.io/api/0/projects/aimake/aimake/issues/" \
  -H "Authorization: Bearer $SENTRY_TOKEN" | jq '.[] | select(.title | contains("Test Error"))')

if [ -n "$SENTRY_ISSUES" ]; then
  echo "✅ Sentry 监控正常"
else
  echo "❌ Sentry 未收到测试错误"
fi

# 2. 验证 UptimeRobot
echo "检查 UptimeRobot 状态..."
UPTIME_STATUS=$(curl -s "https://api.uptimerobot.com/v2/getMonitors" \
  -d "api_key=$UPTIME_ROBOT_KEY" \
  -d "format=json" | jq '.monitors[] | select(.friendly_name == "AIMake") | .status')

if [ "$UPTIME_STATUS" == "2" ]; then
  echo "✅ UptimeRobot 监控正常 (状态: Up)"
else
  echo "❌ UptimeRobot 状态异常: $UPTIME_STATUS"
fi

echo "📊 监控验证完成"
```

---

## 八、上线流程

### 8.1 发布前检查

```markdown
## 发布前检查清单 (Release Checklist)

### 代码准备

- [ ] 所有 PR 已合并到 main
- [ ] 版本号已更新 (package.json)
- [ ] CHANGELOG 已更新
- [ ] 无未解决的 Critical/High Bug

### 测试通过

- [ ] 单元测试通过 (> 80% 覆盖率)
- [ ] E2E 测试通过
- [ ] 冒烟测试通过
- [ ] 性能测试达标

### 环境准备

- [ ] 环境变量已配置
- [ ] Secrets 已更新 (如有变化)
- [ ] 数据库迁移已准备
- [ ] CDN 缓存策略确认

### 团队确认

- [ ] 产品确认发布范围
- [ ] 开发确认代码就绪
- [ ] 运维确认部署就绪
```

### 8.2 发布步骤

```bash
#!/bin/bash
# scripts/release.sh

set -e  # 遇错即停

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./release.sh <version>"
  echo "Example: ./release.sh 1.0.0"
  exit 1
fi

echo "🚀 开始发布 v$VERSION"

# 1. 预检查
echo "Step 1: 运行预检查..."
npm run lint
npm run test

# 2. 创建发布分支
echo "Step 2: 创建发布分支..."
git checkout -b "release/v$VERSION"

# 3. 更新版本号
echo "Step 3: 更新版本号..."
npm version $VERSION --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: bump version to $VERSION"

# 4. 合并到 main
echo "Step 4: 合并到 main..."
git checkout main
git merge "release/v$VERSION"

# 5. 打标签
echo "Step 5: 创建 Git Tag..."
git tag -a "v$VERSION" -m "Release v$VERSION"

# 6. 推送
echo "Step 6: 推送到远程..."
git push origin main
git push origin "v$VERSION"

# 7. 等待部署
echo "Step 7: 等待自动部署..."
sleep 60

# 8. 运行冒烟测试
echo "Step 8: 运行冒烟测试..."
./scripts/smoke-test.sh

# 9. 验证监控
echo "Step 9: 验证监控..."
./scripts/verify-monitoring.sh

echo "🎉 v$VERSION 发布成功！"
echo "前端: https://aimake.cc"
echo "API: https://api.aimake.cc"
```

### 8.3 回滚流程

```bash
#!/bin/bash
# scripts/rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "Usage: ./rollback.sh <previous-version>"
  echo "Example: ./rollback.sh 0.9.0"
  exit 1
fi

echo "⚠️ 开始回滚到 v$PREVIOUS_VERSION"

# 1. 通知团队
echo "发送回滚通知..."
curl -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"🚨 AIMake 正在回滚到 v$PREVIOUS_VERSION\"}"

# 2. Vercel 回滚
echo "回滚 Vercel 部署..."
vercel rollback --yes

# 3. Cloudflare Workers 回滚
echo "回滚 Cloudflare Workers..."
cd api
npx wrangler rollback

# 4. 验证回滚
echo "验证回滚..."
./scripts/smoke-test.sh

echo "✅ 回滚完成"
```

---

## 九、GitHub Actions 完整配置

```yaml
# .github/workflows/release-verification.yml
name: Release Verification

on:
  push:
    tags:
      - 'v*'

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Wait for deployment
        run: sleep 120

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run smoke tests
        run: npx playwright test tests/smoke/
        env:
          BASE_URL: https://aimake.cc
          API_URL: https://api.aimake.cc

      - name: Notify success
        if: success()
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
            -H "Content-Type: application/json" \
            -d '{"text": "✅ Release ${{ github.ref_name }} smoke tests passed!"}'

      - name: Notify failure
        if: failure()
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
            -H "Content-Type: application/json" \
            -d '{"text": "❌ Release ${{ github.ref_name }} smoke tests FAILED! Check immediately."}'

  regression-test:
    needs: smoke-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run regression tests
        run: npx playwright test tests/regression/
        env:
          BASE_URL: https://aimake.cc
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

  performance-test:
    needs: smoke-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://aimake.cc
            https://aimake.cc/sign-in
          configPath: .lighthouserc.json
          uploadArtifacts: true

  security-test:
    needs: smoke-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run security tests
        run: npx playwright test tests/security/
        env:
          BASE_URL: https://aimake.cc
          API_URL: https://api.aimake.cc
```

---

## 十、验证测试总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                      上线验证测试流程                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  代码合并 → 自动部署 → 冒烟测试 → 回归测试 → 性能测试 → 安全测试       │
│                            │                                         │
│                            ▼                                         │
│                       ┌─────────┐                                    │
│                       │ 通过？  │                                    │
│                       └────┬────┘                                    │
│                            │                                         │
│              ┌─────────────┼─────────────┐                           │
│              │ Yes         │             │ No                        │
│              ▼             │             ▼                           │
│        ┌──────────┐        │       ┌──────────┐                      │
│        │  发布    │        │       │  回滚    │                      │
│        │  完成    │        │       │  修复    │                      │
│        └──────────┘        │       └──────────┘                      │
│                            │                                         │
└────────────────────────────┴─────────────────────────────────────────┘

总耗时: 约 50 分钟
- 冒烟测试: 5 分钟
- 回归测试: 15 分钟
- 性能测试: 10 分钟
- 安全测试: 5 分钟
- 兼容性测试: 10 分钟
- 监控验证: 5 分钟
```

---

_确保每次发布都经过完整验证！_
