# AIMake 部署架构设计

> 创建日期: 2026-01-09目标: 从开发到生产的完整部署方案

---

## 一、部署架构总览

### 1.1 生产环境架构图

```
                                    ┌─────────────────┐
                                    │   Cloudflare    │
                                    │   DNS + CDN     │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │   Cloudflare    │
                                    │   WAF + DDoS    │
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
           ┌────────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
           │  Cloudflare     │      │  Cloudflare     │      │  Cloudflare     │
           │    Pages        │      │    Workers      │      │       R2        │
           │  (React SPA)    │      │   (Hono API)    │      │   音频存储       │
           └─────────────────┘      └────────┬────────┘      └─────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
           ┌────────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
           │  Cloudflare     │      │    Upstash      │      │  External APIs  │
           │       D1        │      │     Redis       │      │  TTS/LLM/ASR    │
           └─────────────────┘      └─────────────────┘      └─────────────────┘
```

### 1.2 服务选型

| 服务         | 推荐方案           | 备选方案         | 月成本估算 |
| ------------ | ------------------ | ---------------- | ---------- |
| **前端托管** | Cloudflare Pages   | Vercel           | 免费       |
| **后端托管** | Cloudflare Workers | Railway / Fly.io | 免费-$5    |
| **数据库**   | Cloudflare D1      | Supabase / Neon  | 免费       |
| **Redis**    | Upstash            | Cloudflare KV    | 免费-$10   |
| **对象存储** | Cloudflare R2      | AWS S3           | 免费-$5    |
| **CDN**      | Cloudflare         | -                | 免费       |
| **域名**     | Cloudflare         | Namecheap        | $10-15/年  |
| **监控**     | Sentry + Axiom     | Datadog          | 免费-$30   |

---

## 二、开发环境

### 2.1 Docker Compose 配置

```yaml
# docker-compose.yml

version: '3.8'

services:
  # 前端开发服务器
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - '5173:5173'
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000/api
    depends_on:
      - backend

  # 后端 API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - '8000:8000'
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/aimake
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
      - S3_ENDPOINT=http://minio:9000
      - S3_ACCESS_KEY=minioadmin
      - S3_SECRET_KEY=minioadmin
      - S3_BUCKET=aimake-audio
    depends_on:
      - db
      - redis
      - minio

  # PostgreSQL 数据库
  db:
    image: postgres:15-alpine
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=aimake
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations/init.sql:/docker-entrypoint-initdb.d/init.sql

  # Redis 缓存
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  # MinIO (S3 兼容存储)
  minio:
    image: minio/minio
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  # Celery Worker (异步任务)
  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    command: celery -A app.worker worker --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/aimake
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 2.2 前端 Dockerfile

```dockerfile
# frontend/Dockerfile.dev

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

### 2.3 后端 Dockerfile

```dockerfile
# backend/Dockerfile.dev

FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

---

## 三、生产环境部署

### 3.1 前端部署 (Cloudflare Pages)

```json
// frontend/wrangler.toml (可选，用于高级配置)

name = "aimake-frontend"
pages_build_output_dir = "dist"

[env.production]
vars = { VITE_ENV = "production" }
```

**部署步骤:**

```bash
# 方式一: 通过 Git 自动部署 (推荐)
# 1. 在 Cloudflare Dashboard 创建 Pages 项目
# 2. 连接 GitHub 仓库
# 3. 配置构建设置:
#    - 构建命令: npm run build
#    - 构建输出目录: dist
#    - 根目录: frontend
# 4. 设置环境变量 (Pages Dashboard)
#    VITE_API_URL=https://api.aimake.cc
#    VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
#    VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# 方式二: 通过 Wrangler CLI 部署
npm i -g wrangler
wrangler login

cd frontend
npm run build
wrangler pages deploy dist --project-name=aimake-frontend
```

**自定义域名配置:**

```bash
# 在 Cloudflare Pages 设置中添加自定义域名
# 1. Pages 项目 → Custom domains → Set up a custom domain
# 2. 输入域名: aimake.cc 或 www.aimake.cc
# 3. Cloudflare 会自动配置 DNS 记录
```

**环境变量管理:**

```bash
# 通过 Wrangler 设置环境变量
wrangler pages secret put VITE_CLERK_PUBLISHABLE_KEY --project-name=aimake-frontend
wrangler pages secret put VITE_STRIPE_PUBLISHABLE_KEY --project-name=aimake-frontend

# 或在 Cloudflare Dashboard 设置:
# Pages 项目 → Settings → Environment variables
```

---

### 3.1.2 备选方案: Vercel 部署

如果选择 Vercel 作为前端托管:

```json
// frontend/vercel.json

{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

**部署步骤:**

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
cd frontend
vercel --prod

# 4. 设置环境变量 (Vercel Dashboard)
# VITE_API_URL=https://api.aimake.cc
```

### 3.2 后端部署 (Cloudflare Workers)

```toml
# api/wrangler.toml

name = "aimake-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# 生产环境变量
[env.production]
vars = { ENV = "production", CORS_ORIGIN = "https://aimake.cc" }

# D1 数据库
[[d1_databases]]
binding = "DB"
database_name = "aimake-db"
database_id = "xxx"  # 从 wrangler d1 create 获取

# KV 存储
[[kv_namespaces]]
binding = "KV"
id = "xxx"  # 从 wrangler kv:namespace create 获取

# R2 存储
[[r2_buckets]]
binding = "R2"
bucket_name = "aimake-audio"
```

**部署步骤:**

```bash
# 1. 安装 Wrangler
npm i -g wrangler

# 2. 登录
wrangler login

# 3. 创建 D1 数据库
cd api
wrangler d1 create aimake-db
# 复制返回的 database_id 到 wrangler.toml

# 4. 应用数据库迁移
wrangler d1 migrations apply aimake-db --remote

# 5. 创建 KV 命名空间
wrangler kv:namespace create KV
# 复制返回的 id 到 wrangler.toml

# 6. 创建 R2 存储桶
wrangler r2 bucket create aimake-audio

# 7. 设置 Secrets
wrangler secret put CLERK_SECRET_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put TENCENT_SECRET_ID
wrangler secret put TENCENT_SECRET_KEY
wrangler secret put LLM_API_KEY

# 8. 部署
wrangler deploy
```

**自定义域名配置:**

```bash
# 在 Cloudflare Workers 设置中添加自定义域名
# 1. Workers & Pages → aimake-api → Settings → Triggers
# 2. Add Custom Domain → api.aimake.cc
# 3. Cloudflare 会自动配置 DNS 记录
```

---

### 3.2.2 备选方案: Railway 部署

如果选择 Railway 作为后端托管:

```toml
# backend/railway.toml

[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.prod"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

```dockerfile
# backend/Dockerfile.prod

FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 生产环境使用 gunicorn
RUN pip install gunicorn

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

**Railway 环境变量:**

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
S3_ENDPOINT=https://...r2.cloudflarestorage.com
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=aimake-audio
JWT_SECRET=...
CORS_ORIGINS=https://aimake.cc,https://www.aimake.cc
```

### 3.3 数据库部署 (Supabase)

```sql
-- Supabase SQL Editor

-- 1. 创建表 (参考 database-schema.md)

-- 2. 启用 RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- 3. 创建策略 (API 通过 service_role 访问，不受限制)

-- 4. 创建索引
CREATE INDEX CONCURRENTLY idx_audios_user_created
ON audios(user_id, created_at DESC);
```

### 3.4 对象存储 (Cloudflare R2)

```python
# backend/app/services/storage.py

import boto3
from botocore.config import Config

class StorageService:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            config=Config(signature_version='s3v4'),
            region_name='auto'
        )
        self.bucket = settings.S3_BUCKET

    def upload_audio(self, file_data: bytes, key: str) -> str:
        """上传音频文件，返回 URL"""
        self.s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=file_data,
            ContentType='audio/mpeg'
        )

        # 返回公开 URL
        return f"{settings.CDN_URL}/{key}"

    def get_presigned_url(self, key: str, expires: int = 3600) -> str:
        """获取预签名 URL (用于私有文件)"""
        return self.s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': key},
            ExpiresIn=expires
        )

    def delete_audio(self, key: str):
        """删除音频文件"""
        self.s3.delete_object(Bucket=self.bucket, Key=key)
```

---

## 四、CI/CD 流水线

### 4.1 GitHub Actions - 前端

```yaml
# .github/workflows/frontend.yml

name: Frontend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Run linter
        run: cd frontend && npm run lint

      - name: Run tests
        run: cd frontend && npm run test

      - name: Build
        run: cd frontend && npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Build
        run: cd frontend && npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy frontend/dist --project-name=aimake-frontend
```

### 4.2 GitHub Actions - 后端

```yaml
# .github/workflows/backend.yml

name: Backend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'api/**'
  pull_request:
    branches: [main]
    paths:
      - 'api/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: api/package-lock.json

      - name: Install dependencies
        run: cd api && npm ci

      - name: Run linter
        run: cd api && npm run lint

      - name: Run tests
        run: cd api && npm run test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
          workingDirectory: api
```

---

## 五、监控与告警

### 5.1 应用监控 (Sentry)

```python
# backend/app/main.py

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[
        FastApiIntegration(),
        SqlalchemyIntegration(),
    ],
    traces_sample_rate=0.1,  # 10% 采样
    profiles_sample_rate=0.1,
    environment=settings.ENVIRONMENT,
)
```

```tsx
// frontend/src/main.tsx

import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 5.2 日志收集 (Axiom)

```python
# backend/app/core/logging.py

import logging
import axiom

class AxiomHandler(logging.Handler):
    def __init__(self, dataset: str):
        super().__init__()
        self.client = axiom.Client()
        self.dataset = dataset

    def emit(self, record):
        log_entry = {
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "timestamp": record.created,
            "path": getattr(record, 'path', None),
            "method": getattr(record, 'method', None),
            "status_code": getattr(record, 'status_code', None),
            "duration_ms": getattr(record, 'duration_ms', None),
        }
        self.client.ingest_events(self.dataset, [log_entry])

# 配置
logger = logging.getLogger("aimake")
logger.addHandler(AxiomHandler("aimake-logs"))
```

### 5.3 健康检查

```python
# backend/app/api/health.py

from fastapi import APIRouter, Response
from app.core.database import database
from app.core.redis import redis

router = APIRouter()

@router.get("/health")
async def health_check():
    """基础健康检查"""
    return {"status": "ok"}

@router.get("/health/ready")
async def readiness_check(response: Response):
    """就绪检查 - 检查所有依赖"""
    checks = {
        "database": False,
        "redis": False,
    }

    # 检查数据库
    try:
        await database.execute("SELECT 1")
        checks["database"] = True
    except Exception:
        pass

    # 检查 Redis
    try:
        await redis.ping()
        checks["redis"] = True
    except Exception:
        pass

    all_healthy = all(checks.values())

    if not all_healthy:
        response.status_code = 503

    return {
        "status": "ok" if all_healthy else "degraded",
        "checks": checks
    }
```

### 5.4 告警配置

```yaml
# 告警规则示例 (用于 Grafana / Axiom)

alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    notify:
      - slack: #alerts
      - email: team@aimake.cc

  - name: High Latency
    condition: p99_latency > 3s
    duration: 5m
    severity: warning
    notify:
      - slack: #alerts

  - name: Database Connection Errors
    condition: db_connection_errors > 0
    duration: 1m
    severity: critical
    notify:
      - slack: #alerts
      - pagerduty: on-call

  - name: TTS API Errors
    condition: tts_api_error_rate > 10%
    duration: 3m
    severity: warning
    notify:
      - slack: #alerts
```

---

## 六、扩容策略

### 6.1 自动扩容配置 (Railway/Fly.io)

```toml
# fly.toml (Fly.io 示例)

app = "aimake-api"
primary_region = "hkg"

[build]
dockerfile = "Dockerfile.prod"

[http_service]
internal_port = 8000
force_https = true
auto_stop_machines = true
auto_start_machines = true
min_machines_running = 1

[http_service.concurrency]
type = "requests"
hard_limit = 250
soft_limit = 200

[[services.http_checks]]
interval = 10000
grace_period = "5s"
method = "get"
path = "/health"
protocol = "http"
timeout = 2000

[metrics]
port = 9091
path = "/metrics"
```

### 6.2 数据库读写分离

```
┌─────────────────────────────────────────────────────────────┐
│                      应用层                                  │
├──────────────────────┬──────────────────────────────────────┤
│       写操作         │              读操作                   │
│    (INSERT/UPDATE)   │           (SELECT)                   │
└──────────┬───────────┴──────────────────┬───────────────────┘
           │                              │
           ▼                              ▼
    ┌────────────┐              ┌─────────────────┐
    │   Master   │──复制──────→│    Replica 1    │
    │  (Primary) │              │   (Read-only)   │
    └────────────┘              ├─────────────────┤
                                │    Replica 2    │
                                │   (Read-only)   │
                                └─────────────────┘
```

```python
# backend/app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 主库 (写)
master_engine = create_engine(settings.DATABASE_URL)

# 从库 (读)
replica_engine = create_engine(settings.DATABASE_REPLICA_URL)

MasterSession = sessionmaker(bind=master_engine)
ReplicaSession = sessionmaker(bind=replica_engine)

def get_write_session():
    return MasterSession()

def get_read_session():
    return ReplicaSession()
```

---

## 七、安全配置

### 7.1 环境变量管理

```bash
# 使用 doppler 或 infisical 管理密钥

# Doppler
doppler setup
doppler run -- python app/main.py

# 或直接注入
doppler secrets download --no-file --format env > .env
```

### 7.2 HTTPS 配置 (Cloudflare)

```
1. 在 Cloudflare 启用 Full (Strict) SSL/TLS
2. 启用 HSTS
3. 启用自动 HTTPS 重写
4. 配置 WAF 规则
```

### 7.3 API 安全

```python
# backend/app/middleware/security.py

from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Rate Limiting
class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host

        # 使用 Redis 实现限流
        key = f"rate_limit:{client_ip}"
        count = await redis.incr(key)

        if count == 1:
            await redis.expire(key, 60)  # 每分钟窗口

        if count > 100:  # 每分钟 100 次
            return JSONResponse(
                status_code=429,
                content={"error": "Too many requests"}
            )

        return await call_next(request)

app.add_middleware(RateLimitMiddleware)
```

---

## 八、备份与恢复

### 8.1 数据库备份

```bash
#!/bin/bash
# scripts/backup.sh

# 每日备份
DATE=$(date +%Y%m%d)
BACKUP_FILE="aimake_backup_${DATE}.dump"

# 导出数据库
pg_dump $DATABASE_URL -Fc > /tmp/$BACKUP_FILE

# 上传到 R2
aws s3 cp /tmp/$BACKUP_FILE s3://aimake-backups/$BACKUP_FILE \
    --endpoint-url $S3_ENDPOINT

# 清理本地文件
rm /tmp/$BACKUP_FILE

# 清理 30 天前的备份
aws s3 ls s3://aimake-backups/ --endpoint-url $S3_ENDPOINT | \
    while read -r line; do
        createDate=$(echo $line | awk '{print $1" "$2}')
        createDate=$(date -d "$createDate" +%s)
        olderThan=$(date -d "30 days ago" +%s)
        if [[ $createDate -lt $olderThan ]]; then
            fileName=$(echo $line | awk '{print $4}')
            aws s3 rm s3://aimake-backups/$fileName --endpoint-url $S3_ENDPOINT
        fi
    done
```

### 8.2 恢复流程

```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1

# 从 R2 下载
aws s3 cp s3://aimake-backups/$BACKUP_FILE /tmp/$BACKUP_FILE \
    --endpoint-url $S3_ENDPOINT

# 恢复数据库
pg_restore -d $DATABASE_URL /tmp/$BACKUP_FILE --clean --if-exists

echo "Restore completed!"
```

---

## 九、成本优化

### 9.1 按阶段的推荐配置

| 阶段     | 用户数    | 配置        | 月成本   |
| -------- | --------- | ----------- | -------- |
| **开发** | 0         | 本地 Docker | $0       |
| **Beta** | 0-100     | 免费层      | $0-20    |
| **上线** | 100-1000  | 基础付费    | $50-100  |
| **增长** | 1000-5000 | 扩展配置    | $200-500 |
| **规模** | 5000+     | 专业配置    | $500+    |

### 9.2 免费层最大化

```
Cloudflare Pages:  无限带宽 + 500 次构建/月
Cloudflare Workers: 100K 请求/天免费
Cloudflare D1:     5GB 存储 + 500万行读取/天
Cloudflare R2:     10GB 存储 + 无出口费用
Cloudflare KV:     100K 读取/天 + 1K 写入/天
Upstash Redis:     10K 命令/天免费
```

**Cloudflare 全家桶优势:**

- 统一账单和管理
- 零延迟边缘网络
- 无跨平台费用
- 免费 SSL 和 DDoS 防护
- 全球 CDN 加速

### 9.3 成本监控

```python
# backend/app/services/cost_tracker.py

class CostTracker:
    """追踪 API 调用成本"""

    PRICES = {
        "openai_tts": 0.000015,      # $0.015/1K chars
        "elevenlabs_tts": 0.00030,   # $0.30/1K chars
        "gpt4_input": 0.00001,       # $0.01/1K tokens
        "gpt4_output": 0.00003,      # $0.03/1K tokens
    }

    async def log_usage(
        self,
        user_id: str,
        service: str,
        units: int
    ):
        cost = units * self.PRICES.get(service, 0)

        await usage_logs.insert({
            "user_id": user_id,
            "service": service,
            "units": units,
            "cost": cost,
            "created_at": datetime.utcnow()
        })

        return cost

    async def get_daily_cost(self) -> float:
        """获取今日总成本"""
        result = await usage_logs.aggregate([
            {"$match": {"created_at": {"$gte": today_start}}},
            {"$group": {"_id": None, "total": {"$sum": "$cost"}}}
        ])
        return result[0]["total"] if result else 0
```

---

## 十、检查清单

### 上线前检查

- [ ] 所有环境变量已配置
- [ ] 数据库迁移已完成
- [ ] SSL 证书已配置
- [ ] CORS 已正确设置
- [ ] Rate Limiting 已启用
- [ ] 错误监控已配置 (Sentry)
- [ ] 日志收集已配置
- [ ] 备份策略已设置
- [ ] 健康检查端点可用
- [ ] DNS 已正确指向

### 上线后验证

- [ ] 所有页面可正常访问
- [ ] 注册/登录流程正常
- [ ] TTS 生成功能正常
- [ ] 音频播放/下载正常
- [ ] 支付流程正常 (如有)
- [ ] 监控数据正常上报
- [ ] 告警能正常触发

---

_文档持续更新中..._
